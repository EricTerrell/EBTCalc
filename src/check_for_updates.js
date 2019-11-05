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

const {remote} = require('electron');
const shell = remote.shell;
const {config} = require('./package.json');
const AppInfo = require('./lib/appInfo');
const {checkVersion} = require('./lib/checkVersion');

const StringLiterals = require('./lib/stringLiterals');

const closeButton = document.querySelector('#close');
const downloadButton = document.querySelector('#download');

const currentVersion = document.querySelector('#current_version');
const obsoleteVersion = document.querySelector('#obsolete_version');

wireUpUI();

function wireUpUI() {
    document.querySelector('#app_and_version').innerText = `${AppInfo.getInfo.name} version ${AppInfo.getInfo.version}`;

    closeButton.addEventListener(StringLiterals.CLICK, () => {
        window.close();
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        }
    });

    document.querySelector('#donate').addEventListener(StringLiterals.CLICK, () => {
        shell.openExternal(config.donateUrl);
    });

    downloadButton.addEventListener(StringLiterals.CLICK, () => {
        shell.openExternal(config.downloadUrl);
    });

    checkVersion(errorCallback, notEqualsCallback, equalsCallback);
}

function errorCallback() {
    notEqualsCallback();
}

function notEqualsCallback() {
    obsoleteVersion.style.display = 'block';

    downloadButton.disabled = false;
}

function equalsCallback() {
    currentVersion.style.display = 'block';
}
