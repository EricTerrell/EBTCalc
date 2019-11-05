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
const mainProcess = remote.require('./main');
const shell = remote.shell;
const path = require('path');
const {config} = require('./package.json');

const StringLiterals = require('./lib/stringLiterals');
const AppInfo = require('./lib/appInfo');
const WindowInfo = require('./lib/windowInfo');
const WindowUtils = require('./lib/windowUtils');

const licenseTermsButton = document.querySelector('#license_terms');
const closeButton = document.querySelector('#close');

wireUpUI();

function wireUpUI() {
    document.querySelector('#github').setAttribute(StringLiterals.HREF, config.githubUrl);
    document.querySelector('#website_link').innerText = config.websiteUrl;
    document.querySelector('#website_link').setAttribute(StringLiterals.HREF, config.websiteUrl);
    document.querySelector('#ebt_calc').setAttribute(StringLiterals.HREF, config.ebtCalcUrl);

    const title = document.querySelector('#title');
    title.innerText = `About ${AppInfo.getInfo.name}`;

    document.querySelector('#app_and_version').innerText = `${AppInfo.getInfo.name} version ${AppInfo.getInfo.version}`;

    closeButton.addEventListener(StringLiterals.CLICK, () => {
        window.close();
    });

    document.querySelectorAll(".link").forEach(link => {
        link.addEventListener(StringLiterals.CLICK, (event) => {
            event.preventDefault();

            shell.openExternal(link.href);
        });
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        }
    });

    licenseTermsButton.addEventListener(StringLiterals.CLICK, () => {
        licenseTerms();
    });

    document.querySelector('#donate').addEventListener(StringLiterals.CLICK, () => {
        shell.openExternal(config.donateUrl);
    });

    document.querySelector('#feedback').addEventListener(StringLiterals.CLICK, () => {
        shell.openExternal(config.submitFeedback);
    });

    document.querySelector('#check_for_updates').addEventListener(StringLiterals.CLICK, () => {
        mainProcess.checkForUpdates();
    });
}

function licenseTerms() {
    const windowId = 'license_terms';
    const windowInfo = WindowInfo.loadWindowInfo(windowId);

    const window = new remote.BrowserWindow({
        width: windowInfo.width,
        height: windowInfo.height,
        x: windowInfo.x,
        y: windowInfo.y,
        parent: remote.getCurrentWindow(),
        modal: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, './src/preload.js')
        }
    });

    WindowUtils.disableMenus(window);

    const contentPath = path.join(__dirname, './license_terms.html');

    const theUrl = `file:///${contentPath}`;
    window.loadURL(theUrl);

    licenseTermsButton.disabled = true;

    window.webContents.once(StringLiterals.DESTROYED, () => {
        licenseTermsButton.disabled = false;
    });

    window.on(StringLiterals.RESIZE, (event) => {
        WindowInfo.saveWindowInfo(windowId, event.sender);
    });

    window.on(StringLiterals.MOVE, (event) => {
        WindowInfo.saveWindowInfo(windowId, event.sender);
    });

    return window;
}
