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

const path = require('path');
const {remote} = require('electron');

const WindowUtils = require('./windowUtils');
const WindowInfo = require('./windowInfo');
const mainProcess = remote.require('./main');

module.exports = class Settings {
    static launchSettingsUI(afterCloseCallback) {
        const windowId = 'settings';
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

        const filePath = path.join(__dirname, '../settings_ui.html');
        const theUrl = `file:///${filePath}`;

        window.loadURL(theUrl);

        window.webContents.once(StringLiterals.DESTROYED, () => {
            mainProcess.notifySettingsChanged();

            afterCloseCallback();
        });

        window.on(StringLiterals.RESIZE, (event) => {
            WindowInfo.saveWindowInfo(windowId, event.sender);
        });

        window.on(StringLiterals.MOVE, (event) => {
            WindowInfo.saveWindowInfo(windowId, event.sender);
        });
    }
};