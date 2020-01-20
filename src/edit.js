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

const parser = require('./lib/parser');
const StringLiterals = require('./lib/stringLiterals');
const TextAreaUtils = require('./lib/textAreaUtils');
const SelectUtils = require('./lib/selectUtils');
const StringUtils = require('./lib/stringUtils');
const Constants = require('./lib/constants');
const WindowUtils = require('./lib/windowUtils');
const {remote} = require('electron');
const {dialog} = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const Files = require('./lib/files');
const prettier = require('prettier');
const Settings = require('./lib/settings');
const {addContextMenu} = require('./lib/htmlElementUtils');

let settings = Files.getSettings();

const ProcessTab = require('./lib/processTab');
const processTab = new ProcessTab(settings.tabWidth);

const sourceCode = document.querySelector('#source_code');
const save = document.querySelector('#save');
const cancel = document.querySelector('#cancel');
const syntaxCheck = document.querySelector('#syntax_check');
const prettyPrint = document.querySelector('#pretty_print');
const settingsButton = document.querySelector('#settings');
const cursorPosition = document.querySelector('#cursor_position');
const errorPosition = document.querySelector('#error_position');
const errorDescription = document.querySelector('#error_description');
const goToError = document.querySelector('#go_to_error');
const goToLine = document.querySelector('#go_to_line');
const searchText = document.querySelector('#search_text');
const searchPrevious = document.querySelector('#search_previous');
const searchNext = document.querySelector('#search_next');
const matchCase = document.querySelector('#match_case');

let preventWindowClose = true;
let previousSourceCodeValue;
let goToLineWindow;

// If user uses the Go To Line feature, keep track of it so that the next keystroke doesn't replace the entire
// selection.
let userWentToLine = false;

let errorLine;
let errorColumn;

const MAX_LINES_ABOVE = 10;

ipc.on(StringLiterals.CHILD_WINDOW_CHANNEL, (event, commentLocation) => {
    if (commentLocation) {
        console.info(`edit.js: offset: ${JSON.stringify(commentLocation)}`);

        const characterPosition = TextAreaUtils.getCharacterPosition(sourceCode, commentLocation.line + 1, 1);
        const textToSearch = sourceCode.value.slice(characterPosition);
        const lengthOfLine = textToSearch.indexOf(StringLiterals.NEWLINE);

        TextAreaUtils.scrollToLine(sourceCode, commentLocation.line + 1, lengthOfLine, 10);

        userWentToLine = true;
    }
});

wireUpUI();

function displayCursorPos() {
    const cursorPos = TextAreaUtils.getCursorPos(sourceCode);

    cursorPosition.innerText = `${cursorPos.line}:${cursorPos.character}`;
}

function goToLineUI() {
    if (!goToLineWindow || goToLineWindow.isDestroyed()) {
        goToLineWindow = WindowUtils.createWindow('prompt');
    }

    ipc.removeAllListeners(StringLiterals.MAIN_WINDOW_CHANNEL);
    ipc.once(StringLiterals.MAIN_WINDOW_CHANNEL, (event, lineNumberString) => {
        const lineNumber = Number.parseInt(lineNumberString);

        const line1Position = TextAreaUtils.getCharacterPosition(sourceCode, lineNumber, 1);
        const line2Position = TextAreaUtils.getCharacterPosition(sourceCode, lineNumber + 1, 1);

        TextAreaUtils.scrollToLine(sourceCode, lineNumber, line2Position - line1Position, MAX_LINES_ABOVE);
        displayCursorPos();

        userWentToLine = true;
    });

    const windowId = goToLineWindow.id;

    const windowOptions = {
        title: 'Go to Line',
        prompt: 'Line Number:',
        regExString: '^[\\d]+$',
        errorTitle: 'Invalid line number',
        errorMessage: 'Specify an (integer) line number.',
        defaultValue: StringLiterals.EMPTY_STRING
    };

    goToLineWindow.webContents.once(StringLiterals.DID_FINISH_LOAD, () => {
        ipc.sendTo(windowId, StringLiterals.VARIABLE_WINDOW_CHANNEL, windowOptions);
    });
}

function wireUpButtons() {
    cancel.addEventListener(StringLiterals.CLICK, () => {
        const window = remote.getCurrentWindow();
        window.close();
    });

    save.addEventListener(StringLiterals.CLICK, () => {
        Files.saveUserSourceCode(sourceCode.value);
        previousSourceCodeValue = sourceCode.value;

        save.disabled = true;

        updateUIPerSourceCode(false);
    });

    settingsButton.addEventListener(StringLiterals.CLICK, () => {
        settingsButton.disabled = true;

        Settings.launchSettingsUI(() => {
            settings = Files.getSettings();

            processTab.tabWidth = settings.tabWidth;

            settingsButton.disabled = false;
        });
    });

    syntaxCheck.addEventListener(StringLiterals.CLICK, () => {
        try {
            errorPosition.innerText = errorDescription.innerText = StringLiterals.EMPTY_STRING;
            goToError.disabled = true;

            updateUIPerSourceCode(false);
            parser.extract(sourceCode.value, StringLiterals.EMPTY_STRING);
        } catch (err) {
            errorLine = err.lineNumber;
            errorColumn = Math.max(1, err.column);

            goToError.disabled = false;
            errorPosition.innerText = `Syntax Error: ${err.lineNumber}:${err.column}`;
            errorDescription.innerText = `${err.description}`;
        }
    });

    goToError.addEventListener(StringLiterals.CLICK, () => {
        const pos = TextAreaUtils.getCharacterPosition(sourceCode, errorLine, errorColumn);
        TextAreaUtils.scrollToCharacterPosition(sourceCode, pos, 0, MAX_LINES_ABOVE);

        displayCursorPos();
    });

    goToLine.addEventListener(StringLiterals.CLICK, () => {
        goToLineUI();
    });

    sourceCode.addEventListener(StringLiterals.KEYDOWN, () => {
        displayCursorPos();

        if (userWentToLine) {
            sourceCode.selectionEnd = sourceCode.selectionStart;
            userWentToLine = false;
        }
    });

    sourceCode.addEventListener(StringLiterals.KEYUP, () => {
        userWentToLine = false;

        displayCursorPos();
    });

    sourceCode.addEventListener(StringLiterals.MOUSEDOWN, () => {
        userWentToLine = false;

        displayCursorPos();
    });

    sourceCode.addEventListener(StringLiterals.MOUSEUP, () => {
        userWentToLine = false;

        displayCursorPos();
    });

    sourceCode.addEventListener(StringLiterals.INPUT_EVENT, () => {
        enableDisableSaveButton();
    });

    prettyPrint.addEventListener(StringLiterals.CLICK, () => {
        const options = {
            cursorOffset: sourceCode.selectionStart,
            parser: 'babel',
            tabWidth: Files.getSettings().tabWidth
        };

        try {
            const result = prettier.formatWithCursor(sourceCode.value, options);

            sourceCode.value = result.formatted;

            sourceCode.focus();
            sourceCode.selectionStart = sourceCode.selectionEnd = result.cursorOffset;

            enableDisableSaveButton();
        } catch (error) {
            console.error(error);

            const options = {
                type: StringLiterals.DIALOG_ERROR,
                title: 'Error: Pretty-Print',
                message: 'Click Syntax Check button to find and fix syntax errors',
                buttons: []
            };

            dialog.showMessageBox(remote.getCurrentWindow(), options);
        }
    });

    searchPrevious.addEventListener(StringLiterals.CLICK, () => {
        if (sourceCode.selectionStart > 0) {
            const pos = StringUtils.lastIndexOf(sourceCode.value.slice(0, sourceCode.selectionStart), searchText.value, matchCase.checked);

            if (pos !== -1) {
                TextAreaUtils.scrollToCharacterPosition(sourceCode, pos, searchText.value.length, MAX_LINES_ABOVE);
                displayCursorPos();
                userWentToLine = true;
            }
        }
    });

    searchNext.addEventListener(StringLiterals.CLICK, () => {
        if (sourceCode.selectionStart + 1 < sourceCode.value.length) {
            const pos = StringUtils.indexOf(sourceCode.value, searchText.value, sourceCode.selectionStart + 1, matchCase.checked);

            if (pos !== -1) {
                TextAreaUtils.scrollToCharacterPosition(sourceCode, pos, searchText.value.length, MAX_LINES_ABOVE);
                displayCursorPos();
                userWentToLine = true;
            }
        }
    });
}

function allowClose() {
    const options = {
        type: StringLiterals.DIALOG_QUESTION,
        title: 'Exit',
        message: 'Custom button code has changed. Save changes?',
        buttons: Constants.YES_NO_CANCEL,
        defaultId: 0,
        cancelId: 2
    };

    preventWindowClose = true;

    dialog.
    showMessageBox(remote.getCurrentWindow(), options)
        .then(response => {
        console.log(`response: ${response}`);

        switch(response.response) {
            // Yes
            case 0: {
                Files.saveUserSourceCode(sourceCode.value);

                preventWindowClose = false;
                this.window.close();
            }
                break;

            // No
            case 1: {
                preventWindowClose = false;
                this.window.close();
            }
                break;
        }
    });
}

function wireUpUI() {
    addContextMenu(sourceCode);
    addContextMenu(searchText);

    sourceCode.value = Files.getUserSourceCode();
    previousSourceCodeValue = sourceCode.value;

    this.window.onbeforeunload = (event) => {
        if (preventWindowClose && sourceCode.value !== previousSourceCodeValue) {
            allowClose();

            event.preventDefault();
            return false;
        }
    };

    processTab.process(sourceCode);

    wireUpButtons();

    updateUIPerSourceCode();

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        }
    });
}

function updateUIPerSourceCode(setSelection = true) {
    try {
        errorPosition.innerText = errorDescription.innerText = StringLiterals.EMPTY_STRING;
        goToError.disabled = true;

        const extract = parser.extract(sourceCode.value, StringLiterals.EMPTY_STRING);

        wireUpClasses(extract.classes);
        wireUpMethods(extract.classes);
        wireUpFunctions(extract.functions);
    } catch (err) {
        console.log(err);
    }

    sourceCode.focus();

    if (setSelection) {
        sourceCode.setSelectionRange(0, 0);
        sourceCode.scrollTop = 0;
    }

    displayCursorPos();
}

function wireUpClasses(classes) {
    const selectClass = document.querySelector('#select_class');

    SelectUtils.removeAllItems(selectClass);

    const option = document.createElement(StringLiterals.OPTION);
    option.value = StringLiterals.DROP_DOWN_SELECT_VALUE;
    option.text = StringLiterals.DROP_DOWN_SELECT_TEXT;

    selectClass.add(option);

    classes
        .sort((a, b) => (a.id.name > b.id.name ? 1 : -1))
        .forEach(classInfo => {
            const option = document.createElement(StringLiterals.OPTION);
            option.value = option.text = classInfo.id.name;

            selectClass.add(option);
        });

    selectClass.addEventListener(StringLiterals.CHANGE, (event) => {
        if (event.target.value !== StringLiterals.DROP_DOWN_SELECT_VALUE) {
           try {
                const extract = parser.extract(sourceCode.value, StringLiterals.EMPTY_STRING);

                wireUpMethods(extract.classes);
            } catch (err) {
                console.log(err);
            }
        }
    });
}

function wireUpFunctions(functions) {
    const selectFunction = document.querySelector('#select_function');

    SelectUtils.removeAllItems(selectFunction);

    const option = document.createElement(StringLiterals.OPTION);
    option.value = StringLiterals.DROP_DOWN_SELECT_VALUE;
    option.text = StringLiterals.DROP_DOWN_SELECT_TEXT;

    selectFunction.add(option);

    functions
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .forEach(functionInfo => {
            const option = document.createElement(StringLiterals.OPTION);
            option.value = option.text = functionInfo.name;

            selectFunction.add(option);
        });

    selectFunction.addEventListener(StringLiterals.CHANGE, (event) => {
        if (event.target.value !== StringLiterals.DROP_DOWN_SELECT_VALUE) {
            const regex = new RegExp(`function\\s*${selectFunction.value}`);
            const index = sourceCode.value.search(regex);

            if (index !== -1) {
                const match = sourceCode.value.match(regex)[0];

                TextAreaUtils.scrollToCharacterPosition(sourceCode, index, match.length, MAX_LINES_ABOVE);
                displayCursorPos();

                userWentToLine = true;
            }
        }
    });
}

function wireUpMethods(classes) {
    function selectMethodChange() {
        const location = JSON.parse(selectMethod.value);

        TextAreaUtils.scrollToLine(sourceCode, location.line, location.length, MAX_LINES_ABOVE, location.column);
        displayCursorPos();

        userWentToLine = true;
    }

    const selectClass = document.querySelector('#select_class');
    const selectMethod = document.querySelector('#select_method');

    SelectUtils.removeAllItems(selectMethod);

    if (selectClass.value !== StringLiterals.DROP_DOWN_SELECT_VALUE) {
        const option = document.createElement(StringLiterals.OPTION);
        option.value = StringLiterals.DROP_DOWN_SELECT_VALUE;
        option.text = StringLiterals.DROP_DOWN_SELECT_TEXT;

        selectMethod.add(option);

        classes
            .filter(classInfo => classInfo.id.name === selectClass.value)
            .sort((a, b) => (a.key.name > b.key.name ? 1 : -1))
            .forEach(classInfo => {
                classInfo.body.body
                    .sort((a, b) => (a.key.name > b.key.name ? 1 : -1))
                    .forEach(methodDefinition => {
                        console.log(methodDefinition.key.name);

                        const option = document.createElement(StringLiterals.OPTION);
                        option.text = methodDefinition.key.name;

                        let location = {
                            line: methodDefinition.key.loc.start.line,
                            column: methodDefinition.key.loc.start.column + 1,
                            length: methodDefinition.key.name.length
                        };

                        option.value = JSON.stringify(location);

                        selectMethod.add(option);
                    })
            });

        selectMethod.addEventListener(StringLiterals.CHANGE, (event) => {
            if (event.target.value !== StringLiterals.DROP_DOWN_SELECT_VALUE) {
                selectMethodChange();
            }
        });

        selectMethodChange();
    }
}

function enableDisableSaveButton() {
    save.disabled = sourceCode.value === previousSourceCodeValue;
}