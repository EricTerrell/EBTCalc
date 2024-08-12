/*
  EBTCalc
  (C) Copyright 2024, Eric Bergman-Terrell

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

const StringLiterals = require('./lib/stringLiterals');
const {ipcRenderer} = require('electron');

const okButton = document.querySelector('#ok');
let preventWindowClose = true;

wireUpUI();

function wireUpUI() {
    this.window.onbeforeunload = () => {
        if (preventWindowClose) {
            rejectOrAcceptTerms();

            window.close();
        }
    };

    okButton.addEventListener(StringLiterals.CLICK, () => {
        rejectOrAcceptTerms();

        preventWindowClose = false;
        window.close();
    });
}

function rejectOrAcceptTerms() {
    const checkedRadioButton = document.querySelector('input[name=radio_button_group]:checked').value;

    if (checkedRadioButton === 'reject') {
        ipcRenderer.invoke(StringLiterals.REJECT_LICENSE_TERMS).then();
    } else {
        ipcRenderer.invoke(StringLiterals.ACCEPT_LICENSE_TERMS).then();
    }
}