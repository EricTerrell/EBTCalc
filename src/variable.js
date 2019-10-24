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

const ipc = require('electron').ipcRenderer;

const StringLiterals = require('./lib/stringLiterals');
const I18NUtils = require('./lib/i18nUtils');

const title = document.querySelector('#title');
const dropDown = document.querySelector('#dropdown');
const dropDownRadioButton = document.querySelector('#dropdown_radio_button');
const textRadioButton = document.querySelector('#text_radio_button');
const textBox = document.querySelector('#textbox');
const ok = document.querySelector('#ok');
const cancel = document.querySelector('#cancel');

let senderId;

ipc.on(StringLiterals.VARIABLE_WINDOW_CHANNEL, (event, options) => {
    senderId = event.senderId;

    title.innerText = options.prompt;

    if (options.variableNames.length > 0) {
        dropDown.style.display = StringLiterals.INLINE;
    }

    options
        .variableNames
        .sort((a, b) => I18NUtils.localeCompare(a, b, false))
        .forEach(element => {
        const option = document.createElement(StringLiterals.OPTION);
        option.value = option.text = element;

        dropDown.add(option);
    });

    if (options.displayTextBox) {
        textBox.style.display = StringLiterals.INLINE;

        if (options.variableNames.length > 0) {
            dropDownRadioButton.style.display = StringLiterals.INLINE;
            textRadioButton.style.display = StringLiterals.INLINE;

            dropDown.focus();
        } else {
            textBox.focus();
        }
    } else {
        dropDown.focus();
    }

    if (options.variableNames.length === 0) {
        textRadioButton.checked = StringLiterals.CHECKED;
    }

    wireUpUI(options);
});

function wireUpUI(options) {
    function submit() {
        if (!ok.disabled) {
            let variableName;

            const checkedRadioButton = document.querySelector('input[name=radio_button_group]:checked').value;

            if (checkedRadioButton === 'dropdown') {
                variableName = dropDown.value;
            } else {
                variableName = textBox.value;
            }

            if (variableName) {
                ipc.sendTo(senderId, StringLiterals.MAIN_WINDOW_CHANNEL, variableName);
                window.close();
            }
        }
    }

    ok.addEventListener(StringLiterals.CLICK, () => {
        submit();
    });

    cancel.addEventListener(StringLiterals.CLICK, () => {
        window.close();
    });

    dropDownRadioButton.addEventListener(StringLiterals.CHANGE, () => {
        enableDisableUI();
    });

    textRadioButton.addEventListener(StringLiterals.CHANGE, () => {
       enableDisableUI();
    });

    textBox.addEventListener(StringLiterals.KEYUP, () => {
       enableDisableUI();
    });

    enableDisableUI();

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
       if (event.key === StringLiterals.ESCAPE) {
           window.close();
       } else if (event.key === StringLiterals.ENTER) {
           submit();
       }
    });
}

function enableDisableUI() {
    if (dropDownRadioButton.style.display === StringLiterals.INLINE) {
        // Radio buttons
        ok.disabled = (dropDownRadioButton.checked && !dropDown.value) || (textRadioButton.checked && !textBox.value);
    } else {
        // No radio buttons
        ok.disabled =
            (textBox.style.display === StringLiterals.INLINE && !textBox.value) ||
            (dropDown.style.display === StringLiterals.INLINE && !dropDown.value);
    }
}