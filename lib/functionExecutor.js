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

const parser = require('./parser');
const path = require('path');
const child_process = require('child_process');
const serializerDeserializer = require('./serializerDeserializer');
const StringLiterals = require('./stringLiterals');
const FunctionAndMethodUtils = require('./functionAndMethodUtils');
const Files = require('./files');

let childProcess;

module.exports = class FunctionExecutor {
    constructor(topLine, stack, errorText, valueFormatter, variables, variableNames, displayLogMessage) {
        this._topLine = topLine;
        this._stack = stack;
        this._errorText = errorText;
        this._valueFormatter = valueFormatter;
        this._variables = variables;
        this._variableNames = variableNames;
        this._displayLogMessage = displayLogMessage;

        this._cancelButton = document.querySelector('#cancel');

        this._cancelButton.addEventListener(StringLiterals.CLICK, () => {
            this._cancel();
        })
    }

    get variables() { return this._variables; }
    set variables(value) { this._variables = value; }

    set variableNames(value) { this._variableNames = value; }

    enableUI(enable) {
        []
            .concat(Array.from(document.getElementsByTagName(StringLiterals.BUTTON)))
            .concat(Array.from(document.getElementsByClassName(StringLiterals.CUSTOM_BUTTON)))
            .concat(Array.from(document.getElementsByClassName(StringLiterals.TOP_LINE)))
            .concat(Array.from(document.getElementsByClassName(StringLiterals.SELECT_CATEGORY)))
            .forEach(element => {
                if (element.id !== 'cancel') {
                    element.disabled = !enable;
                }
            });
    }

    _getNumberOfFunctionArgs(functionOrMethodInfo, stackSize) {
        const paramInfo = FunctionAndMethodUtils.getRequiredParamInfo(functionOrMethodInfo);

        return Math.min(paramInfo.maxParameters, stackSize);
    }

    executeFunction(functionOrMethodItem) {
        try {
            this._topLine.pushTopLineValue();

            // Check for syntax errors
            parser.extract(Files.getPredefinedSourceCode(), Files.getUserSourceCode());

            const numberOfArgs = this._getNumberOfFunctionArgs(functionOrMethodItem, this._stack.stackSize());
            const args = this._stack.getArgs(numberOfArgs);

            let object;

            if (functionOrMethodItem.className && !functionOrMethodItem.isStatic) {
                object = this._stack.getArgs(numberOfArgs + 1, false)[0];
            }

            const sdPath = path.join(__dirname, '../lib/serializerDeserializer.js').replace(/\\/g, '/');

            let call = functionOrMethodItem.name;

            if (functionOrMethodItem.className) {
                if (functionOrMethodItem.isStatic) {
                    call = `${functionOrMethodItem.className}.${functionOrMethodItem.name}`;
                } else {
                    call = `${object}.${functionOrMethodItem.name}`;
                }
            }

            const partialSourceCode = Files.getMergedSourceCode();

            const sourceCode =
`
${partialSourceCode} 

const ___sd = require('${sdPath}');

function ___evalFunction(expression) {
    console.info('___evalFunction: expression: ' + expression);
    
    return eval(expression);
}

var ___result;
var ___error;
var ___variables;

try {
    ___variables = ___sd.deserialize(${JSON.stringify(this._variables)}, ___evalFunction);
    ___result = ${call}(${args}); 
} catch(err) {
    console.error(err);
    ___error = err;
}

try {
    var ___serializedResult = ___sd.serialize(___result);
    ___variables = ___sd.serialize(___variables);
} catch(err) {
    console.error(err);
    ___error = err;
} 
`;

            const debug = false;

            const options = {
                silent: true,
                execArgv: debug ? ['--inspect=10245'] : undefined
            };

            this._errorText.setErrorText(StringLiterals.EMPTY_STRING);
            this._enableCancelButton(true);

            this.enableUI(false);

            const scriptPath = path.join(__dirname, '../src/runScript.js');

            childProcess = child_process.fork(scriptPath, [sourceCode], options);

            const that = this;

            childProcess.on(StringLiterals.CLOSE, function (code) {
                const message = `child process existed with code ${code}`;
                console.log(message);

                that._enableCancelButton(false);
            });

            let gotError = false;

            childProcess.on(StringLiterals.MESSAGE, (msg) => {
                console.log('Message from child', msg);

                if (msg.sandbox) {
                    const resultMessage = `${JSON.stringify(msg.sandbox)}`;

                    console.log(resultMessage);

                    childProcess.kill();
                    this.enableUI(true);

                    if (!gotError) {
                        // Pop arguments off the stack.
                        this._stack.popValues(numberOfArgs);

                        if (object) {
                            this._stack.popValues(1);
                        }

                        if (msg.sandbox.___serializedResult && msg.sandbox.___serializedResult.serializedValue !== StringLiterals.UNDEFINED) {

                            let result;

                            // If an object of a class defined by the user is returned, we won't be able to
                            // deserialize it and get its value. So we use the displayText embedded in the
                            // serialized data.
                            try {
                                result = serializerDeserializer.deserialize(msg.sandbox.___serializedResult);
                            } catch(err) {
                                result = msg.sandbox.___serializedResult.displayText;
                            }

                            this._stack.pushValue(this._valueFormatter.getDisplayText(result), msg.sandbox.___serializedResult);
                        }

                        this._variables = msg.sandbox.___variables;

                        try {
                            let variableNames = Array.from(serializerDeserializer.deserialize(this._variables).keys());

                            this._variableNames.length = 0;

                            variableNames.forEach(variableName => {
                                this._variableNames.push(variableName);
                            });
                        } catch (err) {
                            console.log(`Error: ${err}`);
                        }
                    }
                }
            });

            childProcess.stdout.on(StringLiterals.DATA, (data) => {
                console.log(`child process stdout ${data}`);
                this._displayLogMessage(data);
            });

            childProcess.stderr.on(StringLiterals.DATA, (data) => {
                console.log(`child process stderr ${data}`);

                this._errorText.setErrorText(`${data}`);
                this.enableUI(true);
                gotError = true;
            });

        } catch (err) {
            this._errorText.setErrorText(`${err}`);
        } finally {
            console.log('completed executeFunction');
            this._topLine.focus();
        }
    }

    _enableCancelButton(enable) {
        this._cancelButton.disabled = !enable;
    }

    _cancel() {
        childProcess.kill();
        this.enableUI(true);

        this._topLine.focus();
    }
};
