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

const remote = require('@electron/remote/main');

remote.initialize();

const {dialog, app, BrowserWindow} = require('electron');
const StringLiterals = require('../lib/stringLiterals');
const Constants = require('../lib/constants');
const files = require('../lib/files');
const {name} = require('../package');
const path = require('path');
const WindowInfo = require('../lib/windowInfo');
const {Menu, shell, ipcMain} = require('electron');
const MenuUtils = require('../lib/menuUtils');
const OSUtils = require('../lib/osUtils');
const pkg = require('../package');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let aboutEnabled = true;
let checkForUpdatesEnabled = true;

wireUpUI();

function wireUpUI() {
    const gotLock = app.requestSingleInstanceLock();

    if (!gotLock) {
        console.info(`wireUpUI: restricting app to single instance - stopping this instance`);

        app.quit();
    } else {
        app.on(StringLiterals.SECOND_INSTANCE, (event, commandLine, workingDirectory) => {
            console.info(`wireUpUI: ${StringLiterals.SECOND_INSTANCE}`);

            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }

                mainWindow.focus();
            }
        });

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
    }

    ipcMain.handle(StringLiterals.CHECK_FOR_UPDATES, async () => {
        checkForUpdates();
    });

    ipcMain.handle(StringLiterals.REJECT_LICENSE_TERMS, async () => {
        rejectLicenseTerms();
    });

    ipcMain.handle(StringLiterals.ACCEPT_LICENSE_TERMS, async () => {
        acceptLicenseTerms();
    });

    ipcMain.handle(StringLiterals.RELAY_TO_RENDERER, async(event, targetWindowId, targetChannel, data) => {
        if (!targetWindowId) {
            targetWindowId = mainWindow.id;
        }

        console.info(`main.js ${StringLiterals.RELAY_TO_RENDERER} targetWindowId: ${targetWindowId} targetChannel: ${targetChannel} data: ${JSON.stringify(data)}`);

        const window = BrowserWindow.getAllWindows().find((element) => element.id === targetWindowId);

        if (window) {
            window.webContents.send(targetChannel, data);
        } else {
            console.error('could not find target window');
        }
    });
}

function createMenus(window) {
    const template = [
        {
            label: '&File',
            submenu: [
                OSUtils.isMac() ? { role: 'close' } : { label: 'E&xit', role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: '&Help',
            submenu: [
                {
                    label: 'On-Line &Help', click() { onLineHelp(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: '&Visit EricBT.com', click() { visitEricBT(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'Check for &Updates', click() { checkForUpdates(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: '&Support EBTCalc Development', click() { donate(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: '&EBTCalc for Android', click() { visitEBTCalc(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: 'Email &Feedback', click() { feedback(); }
                },
                {
                    type: StringLiterals.MENU_SEPARATOR
                },
                {
                    label: `&About ${pkg.name}`, click() { about(); }
                }
            ]
        }
    ];

    if (!OSUtils.isMac()) {
        const editIndex = template.findIndex((element) => element.label === 'Edit');

        delete template[editIndex];
    }

    if (MenuUtils.displayCustomMenus()) {
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
    if (MenuUtils.displayCustomMenus()) {
        Menu.setApplicationMenu(null);
    }

    // Create the browser window.
    const windowId = 'main';

    const windowInfo = WindowInfo.loadWindowInfo(windowId);

    mainWindow = new BrowserWindow({
        width: windowInfo.width,
        height: windowInfo.height,
        x: windowInfo.x,
        y: windowInfo.y,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (windowInfo.isMaximized) {
        mainWindow.maximize();
    }

    remote.enable(mainWindow.webContents);

    // and load the index.html of the app.
    mainWindow.loadFile('index.html').then();

    // Emitted when the window is closed.
    mainWindow.on(StringLiterals.CLOSED, function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    mainWindow.on(StringLiterals.RESIZE, (event) => {
        WindowInfo.saveWindowInfo(windowId, mainWindow);
    });

    mainWindow.on(StringLiterals.MOVE, (event) => {
        WindowInfo.saveWindowInfo(windowId, mainWindow);
    });

    createMenus(mainWindow);
}

ipcMain.handle(StringLiterals.NOTIFY_SOURCE_CODE_CHANGED, async(event) => {
    console.info(StringLiterals.NOTIFY_SOURCE_CODE_CHANGED);

    mainWindow.webContents.send(StringLiterals.UPDATE_SOURCE_CODE);
});

ipcMain.handle(StringLiterals.NOTIFY_SETTINGS_CHANGED, async (event) => {
    console.info(StringLiterals.NOTIFY_SETTINGS_CHANGED);

    mainWindow.webContents.send(StringLiterals.SETTINGS_CHANGED);
});

function onLineHelp() {
    shell.openExternal(pkg.config.onLineHelpUrl).then();
}

function visitEricBT() {
    shell.openExternal(pkg.config.websiteUrl).then();
}

function donate() {
    shell.openExternal(pkg.config.donateUrl).then();
}

function feedback() {
    shell.openExternal(pkg.config.submitFeedback).then();
}

function visitEBTCalc() {
    shell.openExternal(pkg.config.ebtCalcUrl).then();
}

function checkForUpdates() {
    if (checkForUpdatesEnabled) {
        checkForUpdatesEnabled = false;

        const windowId = 'check_for_updates';

        const windowInfo = WindowInfo.loadWindowInfo(windowId);

        const checkForUpdatesWindow = new BrowserWindow({
            width: windowInfo.width,
            height: windowInfo.height,
            parent: BrowserWindow.getFocusedWindow(),
            modal: true,
            x: windowInfo.x,
            y: windowInfo.y,
            minimizable: false,
            maximizable: true,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        if (windowInfo.isMaximized) {
            checkForUpdatesWindow.maximize();
        }

        MenuUtils.disableMenus(checkForUpdatesWindow);

        // and load the index.html of the app.
        checkForUpdatesWindow.loadFile('check_for_updates.html').then();

        checkForUpdatesWindow.on(StringLiterals.RESIZE, (event) => {
            WindowInfo.saveWindowInfo(windowId, checkForUpdatesWindow);
        });

        checkForUpdatesWindow.on(StringLiterals.MOVE, (event) => {
            WindowInfo.saveWindowInfo(windowId, checkForUpdatesWindow);
        });

        checkForUpdatesWindow.on(StringLiterals.CLOSED, () => {
            console.log(`Destroying window ${windowId}`);
            checkForUpdatesWindow.destroy();

            checkForUpdatesEnabled = true;
        });
    }
}

function about() {
    if (aboutEnabled) {
        aboutEnabled = false;

        const windowId = 'about';

        const windowInfo = WindowInfo.loadWindowInfo(windowId);

        console.log(`creating window id: ${windowId}`);

        const aboutWindow = new BrowserWindow({
            width: windowInfo.width,
            height: windowInfo.height,
            parent: mainWindow,
            modal: true,
            x: windowInfo.x,
            y: windowInfo.y,
            minimizable: false,
            maximizable: true,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        if (windowInfo.isMaximized) {
            aboutWindow.maximize();
        }

        remote.enable(aboutWindow.webContents);

        MenuUtils.disableMenus(aboutWindow);

        // and load the index.html of the app.
        aboutWindow.loadFile('about.html').then();

        aboutWindow.on(StringLiterals.RESIZE, (event) => {
            WindowInfo.saveWindowInfo(windowId, aboutWindow);
        });

        aboutWindow.on(StringLiterals.MOVE, (event) => {
            WindowInfo.saveWindowInfo(windowId, aboutWindow);
        });

        aboutWindow.on(StringLiterals.CLOSED, () => {
            console.log(`Destroying window ${windowId}`);
            aboutWindow.destroy();
            
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

function rejectLicenseTerms() {
    const options = {
        type: StringLiterals.DIALOG_INFO,
        title: `Rejected ${name} License Terms`,
        message: `You rejected the ${name} license terms. Please uninstall ${name} immediately.`,
        buttons: Constants.OK
    };

    dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), options);

    files.saveLicenseTerms({userAccepted: false});

    app.exit(0);
}

function acceptLicenseTerms() {
    files.saveLicenseTerms({userAccepted: true});
}

module.exports = {checkForUpdates};
