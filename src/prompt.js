/*
  EBTCalc
  (C) Copyright 2025, Eric Bergman-Terrell

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

const remote = require('@electron/remote');
const {ipcRenderer} = require('electron');
const {dialog} = remote;
const StringLiterals = require('./lib/stringLiterals.js');
const {addContextMenu} = require('./lib/htmlElementUtils');

const promptLabel = document.querySelector('#prompt_label');
const title = document.querySelector('#title');
const textBox = document.querySelector('#textbox');
const ok = document.querySelector('#ok');
const cancel = document.querySelector('#cancel');

ipcRenderer.on(StringLiterals.VARIABLE_WINDOW_CHANNEL, (event, options) => {
    title.innerText = options.title;
    promptLabel.innerText = options.prompt;
    textBox.value = options.defaultValue;

    textBox.focus();

    wireUpUI(options);
});

function wireUpUI(options) {
    function submit() {
        ipcRenderer.invoke(StringLiterals.RELAY_TO_RENDERER, undefined, StringLiterals.MAIN_WINDOW_CHANNEL, textBox.value).then();
        window.close();
    }

    addContextMenu(textBox);
    
    ok.addEventListener(StringLiterals.CLICK, () => {
        if (textBox.value.search(new RegExp(options.regExString)) === 0) {
            submit();
        } else {
            const dialogOptions = {
                type: StringLiterals.MESSAGE_BOX_ERROR_TYPE,
                title: 'Error',
                detail: options.errorMessage,
                message: options.errorTitle,
                buttons: [ 'OK'],
                defaultId: 0
            };

            dialog.showMessageBox(remote.getCurrentWindow(), dialogOptions).then();
        }
    });

    cancel.addEventListener(StringLiterals.CLICK, () => {
        window.close();
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
       if (event.key === StringLiterals.ESCAPE) {
           window.close();
       } else if (event.key === StringLiterals.ENTER) {
           submit();
       }
    });
}
