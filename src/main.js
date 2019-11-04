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

const {app, BrowserWindow} = require('electron');
const StringLiterals = require('../lib/stringLiterals');
const path = require('path');
const WindowInfo = require('../lib/windowInfo');
const {Menu, shell} = require('electron');
const WindowUtils = require('../lib/windowUtils');
const OSUtils = require('../lib/osUtils');
const package = require('../package');
const {checkVersion} = require('../lib/checkVersion');
const files = require('../lib/files');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let aboutEnabled = true;
let checkForUpdatesEnabled = true;

wireUpUI();

function wireUpUI() {
    const gotLock = app.requestSingleInstanceLock();

    if (!gotLock) {
        app.quit();
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }

                mainWindow.focus();
            }
        });
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on(StringLiterals.READY, createWindow);

    // Quit when all windows are closed.
    app.on(StringLiterals.WINDOW_ALL_CLOSED, function () {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== StringLiterals.DARWIN) {
            app.quit()
        }
    });

    app.on(StringLiterals.ACTIVATE, function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow()
    });

    app.commandLine.appendSwitch('remote-debugging-port', '9222');
}

function createMenus(window) {
    const template = [
        {
            label: 'File',
            submenu: [
                OSUtils.isMac() ? { role: 'close' } : { role: 'quit' }
            ]
        },

        {
            role: 'help',
            submenu: [
                {
                    label: 'On-Line Help', click() { onLineHelp(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'Visit EricBT.com', click() { visitEricBT(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'Check for Updates', click() { checkForUpdates(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'Donate', click() { donate(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'EBTCalc for Android', click() { visitEBTCalc(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'Email Feedback', click() { feedback(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: `About ${package.name}`, click() { about(); }
                }
            ]
        }
    ];

    if (WindowUtils.displayCustomMenus()) {
        const menu = Menu.buildFromTemplate(template);

        if (process.platform !== StringLiterals.DARWIN) {
            // Don't use Menu.setApplicationMenu: if you do, on Linux, every window will have the menu.
            window.setMenu(menu);
        } else {
            Menu.setApplicationMenu(menu);
        }
    }
}

function createWindow() {
    Menu.setApplicationMenu(null);

    // Create the browser window.
    const windowId = 'main';

    const windowInfo = WindowInfo.loadWindowInfo(windowId);

    mainWindow = new BrowserWindow({
        width: windowInfo.width,
        height: windowInfo.height,
        x: windowInfo.x,
        y: windowInfo.y,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on(StringLiterals.CLOSED, function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    mainWindow.on(StringLiterals.RESIZE, (event) => {
        WindowInfo.saveWindowInfo(windowId, event.sender);
    });

    mainWindow.on(StringLiterals.MOVE, (event) => {
        WindowInfo.saveWindowInfo(windowId, event.sender);
    });

    createMenus(mainWindow);

    const settings = files.getSettings();

    if (settings.checkForUpdates) {
        checkVersion(errorCallback, notEqualsCallback, equalsCallback);
    }
}

function notifySourceCodeChanged() {
    console.info('notifySourceCodeChanged');

    mainWindow.webContents.send(StringLiterals.UPDATE_SOURCE_CODE);
}

function notifySettingsChanged() {
    console.info('notifySettingsChanged');

    mainWindow.webContents.send(StringLiterals.SETTINGS_CHANGED);
}

function onLineHelp() {
    shell.openExternal(package.config.onLineHelpUrl);
}

function visitEricBT() {
    shell.openExternal(package.config.websiteUrl);
}

function donate() {
    shell.openExternal(package.config.donateUrl);
}

function feedback() {
    shell.openExternal(package.config.submitFeedback);
}

function visitEBTCalc() {
    shell.openExternal(package.config.ebtCalcUrl);
}

function checkForUpdates() {
    if (checkForUpdatesEnabled) {
        checkForUpdatesEnabled = false;

        const windowId = 'check_for_updates';

        const windowInfo = WindowInfo.loadWindowInfo(windowId);

        const checkForUpdatesWindow = new BrowserWindow({
            width: windowInfo.width,
            height: windowInfo.height,
            parent: mainWindow,
            modal: false,
            x: windowInfo.x,
            y: windowInfo.y,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        WindowUtils.disableMenus(checkForUpdatesWindow);

        // and load the index.html of the app.
        checkForUpdatesWindow.loadFile('check_for_updates.html');

        checkForUpdatesWindow.on(StringLiterals.RESIZE, (event) => {
            WindowInfo.saveWindowInfo(windowId, event.sender);
        });

        checkForUpdatesWindow.on(StringLiterals.MOVE, (event) => {
            WindowInfo.saveWindowInfo(windowId, event.sender);
        });

        checkForUpdatesWindow.on(StringLiterals.CLOSE, () => {
            checkForUpdatesEnabled = true;
        });
    }
}

function about() {
    if (aboutEnabled) {
        aboutEnabled = false;

        const windowId = 'about';

        const windowInfo = WindowInfo.loadWindowInfo(windowId);

        const aboutWindow = new BrowserWindow({
            width: windowInfo.width,
            height: windowInfo.height,
            parent: mainWindow,
            modal: false,
            x: windowInfo.x,
            y: windowInfo.y,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        WindowUtils.disableMenus(aboutWindow);

        // and load the index.html of the app.
        aboutWindow.loadFile('about.html');

        aboutWindow.on(StringLiterals.RESIZE, (event) => {
            WindowInfo.saveWindowInfo(windowId, event.sender);
        });

        aboutWindow.on(StringLiterals.MOVE, (event) => {
            WindowInfo.saveWindowInfo(windowId, event.sender);
        });

        aboutWindow.on(StringLiterals.CLOSE, () => {
            aboutEnabled = true;
        });
    }
}

function errorCallback() {
    console.log('errorCallback');
}

function notEqualsCallback() {
    console.log('notEqualsCallback');

    checkForUpdates();
}

function equalsCallback() {
    console.log('equalsCallback');
}

module.exports = {notifySourceCodeChanged, notifySettingsChanged};
