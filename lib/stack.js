/*
  EBTCalc
  (C) Copyright 2023, Eric Bergman-Terrell

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

const StringLiterals = require('./stringLiterals');
const serializerDeserializer = require('./serializerDeserializer');
const remote = require('@electron/remote');
const {clipboard} = require('electron');
const ipc = require('electron').ipcRenderer;
const {Menu, MenuItem} = remote;
const WindowUtils = require('./windowUtils');
const ObjectUtils = require('./objectUtils');

module.exports = class Stack {
    constructor(valueFormatter, enableDisableButtons) {
        this._stackElement = document.querySelector('#stack');
        this._valueFormatter = valueFormatter;
        this._enableDisableButtons = enableDisableButtons;

        // Cancel selection when context menu goes away.
        addEventListener(StringLiterals.MOUSEDOWN, () => {
            this._unhighlightUnSelectedItems();
        });

        addEventListener(StringLiterals.KEYUP, (event) => {
            if (event.key === StringLiterals.ESCAPE) {
                this._unhighlightUnSelectedItems();
            }
        });

        this._addContextMenu();
    }

    _addContextMenu() {
        const that = this;

        this._stackElement.addEventListener(StringLiterals.CONTEXTMENU, (event) => {
            if (event.target.constructor.name === StringLiterals.HTML_PRE_ELEMENT) {
                const menu = new Menu();

                menu.append(new MenuItem({
                    label: 'Display Stack Contents', click() {
                        that._displayStackContents();
                        that._unhighlightUnSelectedItems();
                    }
                }));

                menu.append(new MenuItem({type: StringLiterals.MENU_SEPARATOR}));

                menu.append(new MenuItem({
                    label: 'Copy Item', click() {
                        that._copySelectedItem(event.target.innerText);
                        that._unhighlightUnSelectedItems();
                    }
                }));

                menu.append(new MenuItem({type: StringLiterals.MENU_SEPARATOR}));

                menu.append(new MenuItem({
                    label: 'Copy Entire Stack', click() {
                        that._copyAllItems();
                        that._unhighlightUnSelectedItems();
                    }
                }));

                if (!this.contextMenuActive) {
                    event.preventDefault();

                    menu.popup({window: remote.getCurrentWindow()});

                    this._highlightSelectedItem(event.target);
                }
            }
        }, false);
    }

    _unhighlightUnSelectedItems() {
        const defaultStyle = getComputedStyle(this._stackElement);

        this.getListItems(this.stackSize()).forEach((item) => {
            item.style.backgroundColor = defaultStyle.backgroundColor;
            item.style.color = defaultStyle.color;
        });
    }

    _highlightSelectedItem(target) {
        this._unhighlightUnSelectedItems();

        if (target.constructor.name === StringLiterals.HTML_PRE_ELEMENT) {
            target.parentNode.style.backgroundColor = 'blue';
            target.parentNode.style.color = 'white';
        }
    }

    _copySelectedItem(value) {
        clipboard.writeText(value);
    }

    _copyAllItems() {
        const stackItems = this.getListItems(this.stackSize())
            .map(item => item.serializedValue.displayText);

        const lines = stackItems.join('\n');
        clipboard.writeText(lines);
    }

    _displayStackContents() {
        this.contextMenuActive = true;

        const onDestroyedCallback = () => { this.contextMenuActive = false; };
        const window = WindowUtils.createWindow('display_stack', onDestroyedCallback);

        // https://github.com/electron/remote/pull/72#issuecomment-924933800
        remote.require("@electron/remote/main").enable(window.webContents)

        const stackItems = this.getListItems(this.stackSize())
            .map(item => item.serializedValue.displayText);

        const numericalWindowId = window.id;

        window.webContents.once(StringLiterals.DID_FINISH_LOAD, () => {
            ipc.sendTo(numericalWindowId, StringLiterals.CHILD_WINDOW_CHANNEL, stackItems);
        });
    }

    set topLine(topLine) {
        this._topLineItem = topLine;
    }

    stackSize() {
        return Array.from(this._stackElement.childNodes)
            .filter(element => element.tagName && element.tagName === StringLiterals.LI)
            .length;
    }

    drop() {
        this._topLineItem.clearEntry();

        if (this._stackElement.childNodes && this._stackElement.childNodes.length > 0) {
            this._stackElement.removeChild(this._stackElement.childNodes[this._stackElement.childNodes.length - 1]);
        }

        this._enableDisableButtons();
    }

    dropAll() {
        this._topLineItem.clearEntry();

        while (this._stackElement.childNodes && this._stackElement.childNodes.length > 0) {
            this.drop();
        }
    }

    getArgs(n, commaDelimit = true) {
        function convert(value) {
            if (value.className === StringLiterals.BIG_NUMBER) {
                const clone = ObjectUtils.clone(value);

                clone.serializedValue += '.toNumber()';

                return clone;
            }

            return value;
        }

        if (n === 0) {
            return StringLiterals.EMPTY_STRING;
        } else {
            const array = Array.from(this._stackElement.childNodes)
                .filter(element => element.tagName && element.tagName === StringLiterals.LI)
                .map(element => element.serializedValue)
                .map(value => `___sd.deserialize(${JSON.stringify(convert(value))}, ___evalFunction)`)
                .slice(-n);

            if (!commaDelimit) {
                return array;
            } else {
                return array.join(', ');
            }
        }
    }

    getListItems(n) {
        if (n === 0) {
            return [];
        } else {
            return Array.from(this._stackElement.childNodes)
                .filter(element => element.tagName && element.tagName === StringLiterals.LI)
                .slice(-n);
        }
    }

    getArgValues(n) {
        return this.getListItems(n)
            .map(element => element.serializedValue)
            .map(serializedValue => serializerDeserializer.deserialize(serializedValue));
    }

    getStackData() {
        return {
            topLine: this._topLineItem.value,
            stackItems: this.getListItems(this.stackSize()),
            options: this._valueFormatter.options
        };
    }

    scrollToBottomOfStackList() {
        this._stackElement.scrollTop = this._stackElement.scrollHeight;
    }

    pushValue(displayText, serializedResult) {
        const newListItem = document.createElement(StringLiterals.LI);
        newListItem.className = StringLiterals.STACK_ITEM;

        const newPreItem = document.createElement(StringLiterals.PRE);

        const textNode = document.createTextNode(displayText);
        newPreItem.appendChild(textNode);

        newListItem.appendChild(newPreItem);

        newListItem.serializedValue = serializedResult;
        this._stackElement.appendChild(newListItem);

        this.scrollToBottomOfStackList();

        this._enableDisableButtons();
    }

    popValues(n) {
        for (let i = 0; i < n; i++) {
            this.drop();
        }

        this._enableDisableButtons();
    }

    stackToArray() {
        let array = [];

        const stackItems = this.getArgValues(this.stackSize());

        stackItems.forEach(element => {
            if (element.constructor.name === StringLiterals.BIG_NUMBER) {
                array.push(element.toNumber())
            } else {
                array.push(element);
            }
        });

        const serializedValue = serializerDeserializer.serialize(array);

        this.popValues(stackItems.length);
        this.pushValue(this._valueFormatter.getDisplayText(array), serializedValue);
    }

    arrayToStack() {
        let successful = false;

        if (this.stackSize() >= 1) {
            const item = this.getArgValues(1)[0];

            if (Array.isArray(item)) {
                this.popValues(1);

                item.forEach(element => {
                    const serializedValue = serializerDeserializer.serialize(element);

                    this.pushValue(this._valueFormatter.getDisplayText(element), serializedValue);
                });

                successful = true;
            }
        }

        if (!successful) {
            throw 'Error: Top item on the stack must be an array.';
        }
    }

    formatValues() {
        const listItems = this.getListItems(this.stackSize());

        listItems.forEach(element => {
            const value = serializerDeserializer.deserialize(element.serializedValue);

            // Drill down to the nested PRE elements.
            element.children[0].innerText = this._valueFormatter.getDisplayText(value);
        });
    }

    topXValuesToArray() {
        let successful = false;

        if (this.stackSize() >= 1) {
            const n = (this.getArgValues(1)[0]).toNumber();

            if (Number.isInteger(n) && n < this.stackSize()) {
                const stackItems = this.getArgValues(n + 1).slice(0, n);

                let array = [];

                stackItems.forEach(element => {
                    array.push(element);
                });

                const serializedValue = serializerDeserializer.serialize(array);

                this.popValues(n + 1);
                this.pushValue(this._valueFormatter.getDisplayText(array), serializedValue);

                successful = true;
            } else {
                throw 'Insufficient number of stack items';
            }
        }

        if (!successful) {
            throw 'Error: Top item on the stack must be an integer. There must be sufficient items on the stack.';
        }
    }

    swap() {
        this._topLineItem.pushTopLineValue();

        const n = this.stackSize();
        const listItems = this.getListItems(n)
            .slice(-2);

        const temp = [listItems[0].innerText, listItems[0].serializedValue];

        listItems[0].firstChild.innerText       = listItems[1].innerText;
        listItems[0].serializedValue = listItems[1].serializedValue;

        listItems[1].firstChild.innerText       = temp[0];
        listItems[1].serializedValue = temp[1];
    }

    duplicate() {
        const numberOfItems = this.stackSize();

        if (numberOfItems >= 1) {
            const value = this.getListItems(numberOfItems)[numberOfItems - 1];
            this.pushValue(value.innerText, value.serializedValue);
        }
    }

    enter() {
        if (!this._topLineItem.pushTopLineValue()) {
            this.duplicate();
        }
    }
};
