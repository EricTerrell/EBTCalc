/*
  EBTCalc
  (C) Copyright 2020, Eric Bergman-Terrell

  This file is part of EBTCalc.

    EBTCalc is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    EBTCalc is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with EBTCalc.  If not, see <http://www.gnu.org/licenses/>.
*/

const parser = require('./parser');
const SelectUtils = require('./selectUtils');
const I18NUtils = require('./i18nUtils');
const FunctionAndMethodUtils = require('./functionAndMethodUtils');
const ErrorText = require('./errorText');
const errorText = new ErrorText();
const Files = require('./files');
const FunctionHelpText = require('./functionHelpText');
const {remote} = require('electron');
const { Menu, MenuItem } = remote;
const WindowUtils = require('./windowUtils');
const ipc = require('electron').ipcRenderer;

const rightColumn = document.querySelector("#right_column");

const doubleQuotes = /"/g;
const functionButtonColumns = 3;

module.exports = class Category {
    constructor(functionExecutor, topLine, enableDisableFunctionButtons) {
        this._functionExecutor = functionExecutor;
        this._topLine = topLine;
        this._enableDisableFunctionButtons = enableDisableFunctionButtons;

        this._contextMenuActive = false;

        this._categoryElement = document.querySelector('#category');

        const that = this;

        this._categoryElement.addEventListener(StringLiterals.CHANGE, () => {
            that.renderCustomButtonUI();
        });

        require('electron').ipcRenderer.on(StringLiterals.UPDATE_SOURCE_CODE, () => {
            errorText.setErrorText(StringLiterals.EMPTY_STRING);
            that.renderCustomButtonUI();
        });

        this._functionButtons = document.querySelector('#function_buttons');

        this._addContextMenu(rightColumn);
    }

    _getCategoryData(extract) {
        const buttonRegEx = /button\s+([\S]+)\s+("[^"]*")\s+("[^"]*")/;

        const categoryData = new Map();

        extract.comments.forEach(element => {
            const tokens = element.value.trim().match(buttonRegEx);

            if (tokens && tokens.length === 4) {
                const categoryText = tokens[3].replace(doubleQuotes, StringLiterals.EMPTY_STRING);

                if (!categoryData.has(categoryText)) {
                    categoryData.set(categoryText, []);
                }

                categoryData.get(categoryText).push({
                    functionOrMethodName: tokens[1],
                    displayText: tokens[2].replace(doubleQuotes, StringLiterals.EMPTY_STRING),
                    isUserDefined: element.isUserDefined,
                    commentLocation: element.loc
                });
            }
        });

        return categoryData;
    }

    _renderCategories(categoryData) {
        let currentCategory = '(Main)';

        const keys = Array.from(categoryData.keys());

        if (keys.includes(this._categoryElement.value)) {
            currentCategory = this._categoryElement.value;
        }

        SelectUtils.removeAllItems(this._categoryElement);

        let optionToSelect;

        keys
            .sort((a, b) => (a > b ? 1 : -1))
            .forEach(categoryText => {
                const option = document.createElement(StringLiterals.OPTION);
                option.value = option.text = categoryText;

                if (option.value === currentCategory) {
                    optionToSelect = option;
                }

                this._categoryElement.add(option);
            });

        if (optionToSelect) {
            optionToSelect.selected = true;
        }

        return currentCategory;
    }

    _edit(offset = 0) {
        this._contextMenuActive = true;

        const window = WindowUtils.createWindow('edit', () => {this._contextMenuActive = false});

        const windowNumericalId = window.id;

        window.webContents.once(StringLiterals.DID_FINISH_LOAD, () => {
            ipc.sendTo(windowNumericalId, StringLiterals.CHILD_WINDOW_CHANNEL, offset);
        });
    }

    _addContextMenu(element, commentLocation = null) {
        const that = this;

        const listener = (event) => {
            const menu = new Menu();
            menu.append(new MenuItem({ label: 'Edit', click() { that._edit(commentLocation); } }));

            // If element is rightColumn, don't display the menu if mouse is over a button - when button renders
            // the context menu it would cancel the rightColumn's context menu.
            const elementUnderMouse = document.elementFromPoint(event.x, event.y);

            const overCustomButton = elementUnderMouse && elementUnderMouse.className === StringLiterals.CUSTOM_BUTTON && element.id === 'right_column';

            if (!overCustomButton && !this._contextMenuActive) {
                console.info(`displaying context menu element.id: ${element.id}`);

                event.preventDefault();

                menu.popup({window: remote.getCurrentWindow()});
            }
        };

        element.removeEventListener(StringLiterals.CONTEXTMENU, listener, true);
        element.addEventListener(StringLiterals.CONTEXTMENU, listener, true);
    }

    renderCustomButtonUI() {
        try {
            const extract = parser.extract(Files.getPredefinedSourceCode(), Files.getUserSourceCode());

            const categoryData = this._getCategoryData(extract);

            const currentCategory = this._renderCategories(categoryData);

            while (this._functionButtons.firstChild) {
                this._functionButtons.removeChild(this._functionButtons.firstChild);
            }

            let tableRow;
            let tableCells = 0;

            const buttonsToRender =
                categoryData
                .get(currentCategory)
                .sort((a, b) => (I18NUtils.localeCompare(a.displayText, b.displayText, false)));

            buttonsToRender
                .forEach(buttonToRender => {
                    extract.functions.concat(extract.methods).forEach(item => {
                        const itemName = item.className ? `${item.className}.${item.name}` : `${item.name}`;

                        if (buttonToRender.functionOrMethodName === itemName) {
                            if (tableCells === 0 || tableCells % functionButtonColumns === 0) {
                                tableRow = this._functionButtons.insertRow();

                                tableRow.setAttribute(StringLiterals.CLASS, StringLiterals.FUNCTION_TABLE_ROW);
                            }

                            const cell = tableRow.insertCell();

                            const buttonElement = document.createElement(StringLiterals.INPUT);
                            buttonElement.setAttribute(StringLiterals.VALUE, buttonToRender.displayText);
                            buttonElement.setAttribute(StringLiterals.TYPE, StringLiterals.BUTTON);
                            buttonElement.setAttribute(StringLiterals.TITLE, FunctionHelpText.getText(item));
                            buttonElement.setAttribute(StringLiterals.CLASS, StringLiterals.CUSTOM_BUTTON);

                            buttonElement.addEventListener(StringLiterals.CLICK, () => {
                                this._functionExecutor.executeFunction(item);
                            });

                            buttonElement.___requiredParameterInfo = FunctionAndMethodUtils.getRequiredParamInfo(item);

                            if (buttonToRender.isUserDefined) {
                                this._addContextMenu(buttonElement, buttonToRender.commentLocation.end);
                            }

                            const newTableCellItem = document.createElement(StringLiterals.TABLE_CELL);
                            newTableCellItem.setAttribute(StringLiterals.CLASS, StringLiterals.CUSTOM_BUTTON_TABLE_CELL);

                            newTableCellItem.appendChild(buttonElement);

                            cell.appendChild(newTableCellItem);
                            tableCells++;
                        }
                    })
                });

            this._topLine.focus();

            this._enableDisableFunctionButtons();
        } catch (err) {
            errorText.setErrorText(err);
        }
    }
};
