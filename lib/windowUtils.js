/*
  EBTCalc
  (C) Copyright 2023, Eric Bergman-Terrell

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
const WindowInfo = require('./windowInfo');
const MenuUtils = require('./menuUtils');
const path = require('path');
const StringLiterals = require("./stringLiterals");

module.exports = class WindowUtils {
    static createWindow(windowName, modal = true, onDestroyedCallback = undefined) {
        const windowId = windowName;
        const windowInfo = WindowInfo.loadWindowInfo(windowId);

        const options = {
            width: windowInfo.width,
            height: windowInfo.height,
            x: windowInfo.x,
            y: windowInfo.y,
            modal,
            minimizable: !modal,
            maximizable: true,
            resizable: true,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, './src/preload.js')
            }
        };

        if (modal) {
            options.parent = remote.getCurrentWindow();
        }

        const window = new remote.BrowserWindow(options);

        if (windowInfo.isMaximized) {
            window.maximize();
        }

        MenuUtils.disableMenus(window);

        const htmlFilePath = path.join(__dirname, `../${windowName}.html`);
        const theUrl = `file:///${htmlFilePath}`;
        console.info(`WindowUtils.createWindow: ${theUrl}`);
        window.loadURL(theUrl).then();

        window.webContents.once(StringLiterals.DESTROYED, (event) => {
            if (onDestroyedCallback) {
                onDestroyedCallback();
            }
        });

        window.on(StringLiterals.RESIZE, (event) => {
            WindowInfo.saveWindowInfo(windowId, window);
        });

        window.on(StringLiterals.MOVE, (event) => {
            WindowInfo.saveWindowInfo(windowId, window);
        });

        return window;
    }
};
