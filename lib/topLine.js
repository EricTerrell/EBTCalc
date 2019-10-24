/*
  EBTCalc
  (C) Copyright 2019, Eric Bergman-Terrell

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

const BigNumber = require('bignumber.js');
const StringLiterals = require('./stringLiterals');
const StringUtils = require('./stringUtils');
const serializerDeserializer = require('./serializerDeserializer');
const {remote, clipboard} = require('electron');
const Files = require('./files');
const { Menu, MenuItem } = remote;

module.exports = class TopLine {
    constructor(valueFormatter, errorText, enableDisableFunctionButtons) {
        this._inputElement = document.querySelector('#topLine');
        this._valueFormatter = valueFormatter;
        this._errorText = errorText;
        this._enableDisableFunctionButtons = enableDisableFunctionButtons;

        this._keyToButtonItem = new Map();

        this.keyToButton.set('Enter', document.querySelector('#enter'));
        this.keyToButton.set('!', document.querySelector('#factorial'));

        this._inputElement.addEventListener(StringLiterals.KEYUP, this.processKeyPress.bind(this), true);

        this._addContextMenu();
        this._contextMenuActive = false;
    }

    _addContextMenu() {
        const that = this;

        this._inputElement.addEventListener(StringLiterals.CONTEXTMENU, (event) => {
            const menu = new Menu();

            menu.append(new MenuItem({ label: StringLiterals.MENU_CUT, click() {  that._cut(event.target); } }));
            menu.append(new MenuItem({ type: StringLiterals.MENU_SEPARATOR }));
            menu.append(new MenuItem({ label: StringLiterals.MENU_COPY, click() { that._copy(event.target); } }));
            menu.append(new MenuItem({ type: StringLiterals.MENU_SEPARATOR }));
            menu.append(new MenuItem({ label: StringLiterals.MENU_PASTE, click() { that._paste(); } }));

            if (!this._contextMenuActive) {
                event.preventDefault();

                menu.popup({window: remote.getCurrentWindow()});
            }
        }, false);
    }

    _cut(value) {
        clipboard.writeText(value.value);
        value.value = StringLiterals.EMPTY_STRING;
    }

    _copy (value) {
        clipboard.writeText(value.value);
    }

    _paste() {
        this.value = clipboard.readText();
    }

    set stack(value) {
        this.stackItem = value;
    }

    get value() {
        return this._inputElement.value;
    }

    get keyToButton() {
        return this._keyToButtonItem;
    }

    set value(value) {
        this._inputElement.value = value;
    }

    clearEntry() {
        this._inputElement.value = StringLiterals.EMPTY_STRING;
        this._errorText.setErrorText(StringLiterals.EMPTY_STRING);

        this._enableDisableFunctionButtons();
    }

    focus() {
        this._inputElement.focus();
    }

    pushTopLineValue() {
        let result = false;

        if (this._inputElement.value.trim()) {
            let value = this._inputElement.value.trim();

            const settings = Files.getSettings();

            value = StringUtils.replaceAll(value, settings.decimalPoint, StringLiterals.DECIMAL_POINT);
            value = StringUtils.replaceAll(value, settings.thousandsSeparator, StringLiterals.EMPTY_STRING);

            if (StringUtils.isNumber(value)) {
                const number = new BigNumber(value);

                const valueToPush = serializerDeserializer.serialize(number);
                this.stackItem.pushValue(this._valueFormatter.getDisplayText(number), valueToPush);

                this.clearEntry();

                result = true;
            } else if (StringUtils.isQuotedString(this._inputElement.value)) {
                let unquotedString = this._inputElement.value.trim();
                unquotedString = unquotedString.slice(1, unquotedString.length - 1);

                const valueToPush = serializerDeserializer.serialize(unquotedString);
                this.stackItem.pushValue(this._valueFormatter.getDisplayText(unquotedString), valueToPush);

                this.clearEntry();

                result = true;
            } else if (StringUtils.isBoolean(this._inputElement.value)) {
                const booleanValue = new Boolean(this._inputElement.value);

                const valueToPush = serializerDeserializer.serialize(booleanValue);
                this.stackItem.pushValue(this._inputElement.value.trim(), valueToPush);

                this.clearEntry();

                result = true;
            } else if (StringUtils.isNull(this._inputElement.value)) {
                const valueToPush = serializerDeserializer.serialize(null);
                this.stackItem.pushValue(this._inputElement.value.trim(), valueToPush);

                this.clearEntry();

                result = true;
            } else {
                throw `Error: invalid value: '${this._inputElement.value}'.`;
            }
        }

        this._enableDisableFunctionButtons();

        return result;
    }

    processKeyPress(event) {
        function startsWithQuote(value) {
            const string = value.trim();

            return string.startsWith("'") || string.startsWith('"');
        }

        console.log(`processKeyPress: ${event.key}`);

        if (['Enter', '+', '-', '*', '/', '^', '%', '!'].includes(event.key) && !startsWithQuote(this._inputElement.value)) {
            const button = this._keyToButtonItem.get(event.key);

            if (button) {
                console.log(`processKeyPress: simulate click of ${button.id}`);

                if (button.id !== 'enter') {
                    this._inputElement.value = this._inputElement.value.slice(0, this._inputElement.value.length - 1);
                }

                button.click();
            }
        }

        if (StringUtils.isQuotedString(this._inputElement.value) && event.key === StringLiterals.ENTER) {
            this.pushTopLineValue();
        }

        this._enableDisableFunctionButtons();
    }

    appendTopLineCharacter(digitCharacter) {
        this._errorText.setErrorText(StringLiterals.EMPTY_STRING);
        this._inputElement.value = `${this._inputElement.value}${digitCharacter}`;

        this._enableDisableFunctionButtons();
    }

    appendDecimalPoint() {
        this._errorText.setErrorText(StringLiterals.EMPTY_STRING);
        this.appendTopLineCharacter(StringLiterals.DECIMAL_POINT);
    }
};