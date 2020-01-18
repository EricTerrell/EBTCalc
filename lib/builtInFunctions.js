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
const serializerDeserializer = require('./serializerDeserializer');
const WindowUtils = require('./windowUtils');
const Constants = require('./constants');

const {remote} = require('electron');
const {dialog} = require('electron').remote;
const ipc = require('electron').ipcRenderer;

module.exports = class BuiltInFunctions {
    constructor(stack, topLine, valueFormatter, errorText, variableNames, functionExecutor, enableDisableFunctionButtons) {
        this._stack = stack;
        this._topLine = topLine;
        this.valueFormatter = valueFormatter;
        this._errorText = errorText;
        this._variableNames = variableNames;
        this._functionExecutor = functionExecutor;
        this._enableDisableFunctionButtons = enableDisableFunctionButtons;
    }

    set variableNames(value) { this._variableNames = value; }

    _factorial(n) {
        n = new BigNumber(n).toNumber();

        if (!Number.isInteger(n) || n < 0) {
            throw 'Error: Argument to factorial must be an integer ≥ 0.';
        }

        return (n === 0 || n === 1) ? 1 : n * this._factorial(n - 1);
    }

    _squareRoot(x) {
        if (x.comparedTo(new BigNumber('0')) < 0) {
            throw 'Error: Argument to square root must not be negative.';
        }

        return x.squareRoot();
    }

    _pi() {
        this._topLine.clearEntry();

        const result = new BigNumber(Math.PI);

        const valueToPush = serializerDeserializer.serialize(result);
        this._stack.pushValue(this.valueFormatter.getDisplayText(result), valueToPush);
    }

    _scientificNotation(x, y) {
        return new BigNumber(x).multipliedBy(new BigNumber('10').pow(new BigNumber(y)));
    }

    _fix(decimalDigits) {
        decimalDigits = new BigNumber(decimalDigits).toNumber();

        if (decimalDigits < 1 || decimalDigits > 100) {
            throw 'Error: Fix argument must be between 1 and 100.';
        }

        if (decimalDigits !== Math.floor(decimalDigits)) {
            throw 'Error: Fix argument must be an integer.';
        }

        this.valueFormatter.setNumberFormatFixed(decimalDigits);
        this._stack.formatValues();
    }

    _float() {
        this.valueFormatter.setNumberFormatFloat();
        this._stack.formatValues();
    }

    _processVariableUI(executeFunctionItem, windowOptions) {
        const window = WindowUtils.createWindow('variable', () => { this._enableDisableFunctionButtons(); });

        ipc.removeAllListeners(StringLiterals.MAIN_WINDOW_CHANNEL);
        ipc.once(StringLiterals.MAIN_WINDOW_CHANNEL, (event, variableName) => {
            this._stack.pushValue(this.valueFormatter.getDisplayText(variableName), serializerDeserializer.serialize(variableName));

            this._functionExecutor.executeFunction(executeFunctionItem);
            console.log(`_processVariableUI: executed function. ${JSON.stringify(this._variableNames)}`);
        });

        const windowNumericalId = window.id;

        window.webContents.once(StringLiterals.DID_FINISH_LOAD, () => {
            ipc.sendTo(windowNumericalId, StringLiterals.VARIABLE_WINDOW_CHANNEL, windowOptions);
        });

        const buttons = [
            document.querySelector('#store_variable'),
            document.querySelector('#load_variable'),
            document.querySelector('#delete_variable'),
            document.querySelector('#delete_all_variables'),
        ];

        buttons.forEach((element) => {
            element.disabled = true;
        });
    }

    _loadVariable() {
        if (this._variableNames.length > 0) {
            const executeFunctionItem = {
                name: 'retrieveVariable',
                className: 'Memory',
                isStatic: true,
                params: [
                    {
                        type: 'Identifier',
                        name: 'variableName'
                    }
                ]
            };

            const windowOptions = {
                variableNames: this._variableNames,
                displayTextBox: false,
                prompt: 'Retrieve Variable'
            };

            this._processVariableUI(executeFunctionItem, windowOptions);
        }
    }

    _storeVariable() {
        const executeFunctionItem = {
            name: 'storeVariable',
            className: 'Memory',
            isStatic: true,
            params: [
                {
                    type: 'Identifier',
                    name: 'variableValue'
                },
                {
                    type: 'Identifier',
                    name: 'variableName'
                }
            ]
        };

        const windowOptions = {
            variableNames: this._variableNames,
            displayTextBox: true,
            prompt: 'Store Value as Variable'
        };

        this._processVariableUI(executeFunctionItem, windowOptions);
    }

    _deleteVariable() {
        if (this._variableNames.length > 0) {
            const executeFunctionItem = {
                name: 'deleteVariable',
                className: 'Memory',
                isStatic: true,
                params: [
                    {
                        type: 'Identifier',
                        name: 'variableName'
                    }
                ]
            };

            const windowOptions = {
                variableNames: this._variableNames,
                displayTextBox: false,
                prompt: 'Delete Variable'
            };

            this._processVariableUI(executeFunctionItem, windowOptions);
        }
    }

    _deleteAllVariables() {
        const options = {
            type: StringLiterals.QUESTION,
            title: 'Delete All Variables',
            message: 'Delete all variables?',
            buttons: Constants.YES_NO_CANCEL,
            defaultId: 1,
            cancelId: 2
        };

        dialog
            .showMessageBox(remote.getCurrentWindow(), options)
            .then(response => {
            if (response.response === 0) {
                const executeFunctionItem = {
                    name: 'deleteAllVariables',
                    className: 'Memory',
                    isStatic: true,
                    params: []
                };
                this._functionExecutor.executeFunction(executeFunctionItem);
            }
        });
    }

    _backspace() {
        if (this._topLine.value) {
            this._topLine.value = this._topLine.value.slice(0, this._topLine.value.length - 1);

            this._enableDisableFunctionButtons();
        }
    }

    _promptForString() {
        const button = document.querySelector('#string');
        button.disabled = true;

        const window = WindowUtils.createWindow('prompt', () => {button.disabled = false});

        ipc.removeAllListeners(StringLiterals.MAIN_WINDOW_CHANNEL);
        ipc.once(StringLiterals.MAIN_WINDOW_CHANNEL, (event, text) => {
            stack.pushValue(this.valueFormatter.getDisplayText(text), serializerDeserializer.serialize(text));
        });

        const windowId = window.id;

        const options = {
            title: 'Enter String',
            prompt: 'String:',
            defaultValue: ''
        };

        window.webContents.once(StringLiterals.DID_FINISH_LOAD, () => {
            ipc.sendTo(windowId, StringLiterals.VARIABLE_WINDOW_CHANNEL, options);
        });
    }

    _processBuiltInOperation(buttonName, func) {
        this._topLine.pushTopLineValue();

        const argValues = stack.getArgValues(func.length);

        if (argValues.length === func.length) {
            const result = func.apply(null, argValues);

            this._stack.popValues(func.length);

            const serializedResult = serializerDeserializer.serialize(result);

            if (!['#fix', '#float'].includes(buttonName)) {
                this._stack.pushValue(this.valueFormatter.getDisplayText(result), serializedResult);
            }
        }
    }

    wireUpButtons() {
        // Digit buttons
        for (let digit = 0; digit <= 9; digit++) {
            const button = document.querySelector(`#button_${digit}`);

            button.addEventListener(StringLiterals.CLICK, () => {
                this._topLine.appendTopLineCharacter.bind(this._topLine)(digit);
                this._topLine.focus();
            });
        }

        let buttonFunctions = [
            ['#add', (a, b) => new BigNumber(a).plus(new BigNumber(b)), '+'],
            ['#subtract', (a, b) => new BigNumber(a).minus(new BigNumber(b)), '-'],
            ['#multiply', (a, b) => new BigNumber(a).multipliedBy(new BigNumber(b)), '*'],
            ['#divide', (a, b) => new BigNumber(a).dividedBy(new BigNumber(b)), '/'],
            ['#factorial', this._factorial.bind(this), '!'],
            ['#raise', (x, y) => new BigNumber(Math.pow(new BigNumber(x).toNumber(), new BigNumber(y).toNumber())), '^'],
            ['#percent', (x) => new BigNumber(x).dividedBy(new BigNumber('100')), '%'],
            ['#square_root', this._squareRoot.bind(this)],
            ['#change_sign', (x) => new BigNumber(x).negated()],
            ['#square', (x) => new BigNumber(x).pow('2')],
            ['#reciprocal', (x) => new BigNumber('1').dividedBy(new BigNumber(x))],
            ['#scientific_notation', (x, y) => this._scientificNotation.bind(this)(x, y)],
            ['#fix', (x) => this._fix.bind(this)(new BigNumber(x))],
            ['#float', this._float.bind(this)]
        ];

        buttonFunctions.forEach(element => {
            document.querySelector(element[0]).addEventListener(StringLiterals.CLICK, () => {
                try {
                    this._errorText.setErrorText(StringLiterals.EMPTY_STRING);
                    this._processBuiltInOperation(element[0], element[1]);
                    this._topLine.focus();
                } catch (err) {
                    this._errorText.setErrorText(err);
                }
            });

            if (element.length === 3) {
                const button = document.querySelector(element[0]);

                this._topLine.keyToButton.set(element[2], button);
            }
        });

        buttonFunctions = [
            ['#swap', stack.swap.bind(stack)],
            ['#clear_all', stack.dropAll.bind(stack)],
            ['#clear_entry', this._topLine.clearEntry.bind(this._topLine)],
            ['#drop', stack.drop.bind(stack)],
            ['#enter', stack.enter.bind(stack)],
            ['#string', this._promptForString.bind(this)],
            ['#pi', this._pi.bind(this)],
            ['#backspace', this._backspace.bind(this)],
            ['#decimal_point', this._topLine.appendDecimalPoint.bind(this._topLine)],
            ['#stack_to_array', this._stack.stackToArray.bind(this._stack)],
            ['#array_to_stack', this._stack.arrayToStack.bind(this._stack)],
            ['#top_x_values_to_array', this._stack.topXValuesToArray.bind(this._stack)],
            ['#load_variable', this._loadVariable.bind(this)],
            ['#store_variable', this._storeVariable.bind(this)],
            ['#delete_variable', this._deleteVariable.bind(this)],
            ['#delete_all_variables', this._deleteAllVariables.bind(this)]
        ];

        buttonFunctions.forEach(element => {
            document.querySelector(element[0]).addEventListener(StringLiterals.CLICK, () => {
                this._errorText.setErrorText(StringLiterals.EMPTY_STRING);

                if (!['#enter', '#clear_entry', '#decimal_point', '#backspace', '#drop', '#clear_all'].includes(element[0])) {
                    this._topLine.pushTopLineValue();
                }

                try {
                    element[1]();
                } catch (err) {
                    this._errorText.setErrorText(err);
                } finally {
                    this._topLine.focus();
                }
            });
        });
    }
};