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

const BigNumber = require('bignumber.js');
const StringLiterals = require('./stringLiterals');
const Constants = require('./constants');
const StringUtils = require('./stringUtils');
const serializerDeserializer = require('./serializerDeserializer');
const Files = require('./files');
const {addContextMenu} = require('./htmlElementUtils');

module.exports = class TopLine {
    constructor(valueFormatter, errorText, enableDisableButtons) {
        this._inputElement = document.querySelector('#topLine');
        this._valueFormatter = valueFormatter;
        this._errorText = errorText;
        this._enableDisableButtons = enableDisableButtons;

        this._keyToButtonItem = new Map();

        this.keyToButton.set('Enter', document.querySelector('#enter'));
        this.keyToButton.set('!', document.querySelector('#factorial'));

        this._inputElement.addEventListener(StringLiterals.KEYUP, this.processKeyPress.bind(this), true);

        this._addContextMenu();
        this._contextMenuActive = false;
    }

    _addContextMenu() {
        addContextMenu(this._inputElement);
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

        this._enableDisableButtons();
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
                const booleanValue = Boolean(this._inputElement.value === 'true');

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

        this._enableDisableButtons();

        return result;
    }

    processKeyPress(event) {
        function startsWithQuote(value) {
            const string = value.trim();

            return string.startsWith("'") || string.startsWith('"');
        }

        console.log(`processKeyPress: ${event.key}`);

        const keys = ['Enter'].concat(Constants.OPERATOR_CHARS);

        if (keys.includes(event.key) && !startsWithQuote(this._inputElement.value)) {
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

        this._enableDisableButtons();
    }

    appendTopLineCharacter(digitCharacter) {
        this._errorText.setErrorText(StringLiterals.EMPTY_STRING);
        this._inputElement.value = `${this._inputElement.value}${digitCharacter}`;

        this._enableDisableButtons();
    }

    appendDecimalPoint() {
        this._errorText.setErrorText(StringLiterals.EMPTY_STRING);
        this.appendTopLineCharacter(StringLiterals.DECIMAL_POINT);
    }
};