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

const { screen } = require('electron/main');
const fs = require('fs');
const StringLiterals = require('./stringLiterals');
const FileUtils = require('./fileUtils');

const defaultWindowInfo = {
    edit: {
        width: 1300,
        height: 900
    },

    main: {
        width: 1270,
        height: 705
    },

    log: {
        width: 800,
        height: 400
    },

    settings_ui: {
        width: 760,
        height: 305
    },

    variable: {
        width: 400,
        height: 202
    },

    display_stack: {
        width: 900,
        height: 600
    },

    about: {
        width: 900,
        height: 570
    },

    license_terms: {
        width: 897,
        height: 608
    },

    check_for_updates: {
        width: 669,
        height: 194
    },

    graph: {
        width: 1024,
        height: 594
    },

    prompt: {
        width: 376,
        height: 163
    }
};

module.exports = class WindowInfo {
    static saveWindowInfo(windowId, window) {
        const bounds = window.getBounds();

        const windowInfo = {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: window.isMaximized()
        };

        WindowInfo._writeWindowInfo(windowId, windowInfo);
    }

    static loadWindowInfo(windowId) {
        try {
            const cachedWindowInfo = WindowInfo._readWindowInfo(windowId);

            if (WindowInfo.#fullyVisible(cachedWindowInfo)) {
                return cachedWindowInfo;
            }
        } catch (error) {
            console.info(`WindowInfo.loadWindowInfo ${windowId} ${error}`);
        }

        return defaultWindowInfo[windowId];
    }

    static _getWindowInfoPath(windowId) {
        return FileUtils.getAppFilePath(`${windowId}_windowInfo.json`);
    }

    static _readWindowInfo(windowId) {
        const windowInfoPath = WindowInfo._getWindowInfoPath(windowId);

        return JSON.parse(fs.readFileSync(windowInfoPath, StringLiterals.ENCODING));
    }

    static _writeWindowInfo(windowId, windowInfo) {
        const windowInfoPath = WindowInfo._getWindowInfoPath(windowId);

        try {
            fs.writeFileSync(windowInfoPath, JSON.stringify(windowInfo));
        } catch (err) {
            console.log(`WindowInfo._writeWindowInfo ${windowId} ${windowInfoPath} ${JSON.stringify(windowInfo)} ${err}`);
        }
    }

    // Determine if the window with the cachedWindowInfo is fully visible. In other words, each corner of the
    // window is visible in a display (user may have multiple monitors).
    static #fullyVisible(cachedWindowInfo) {
        let fullyVisible = cachedWindowInfo.isMaximized;

        if (!fullyVisible) {
            const points = [
                [cachedWindowInfo.x,                            cachedWindowInfo.y],
                [cachedWindowInfo.x + cachedWindowInfo.width,   cachedWindowInfo.y],
                [cachedWindowInfo.x,                            cachedWindowInfo.y + cachedWindowInfo.height],
                [cachedWindowInfo.x + cachedWindowInfo.width,   cachedWindowInfo.y + cachedWindowInfo.height]
            ];

            let pointsVisible = 0;

            let allDisplays;

            // The screen API is only available in Main process. If this method is called from a renderer process,
            // access the screen object via remoting.
            if (screen !== undefined) {
                allDisplays = screen.getAllDisplays();
            } else {
                allDisplays = require('@electron/remote').screen.getAllDisplays();
            }

            points.forEach(point => {
                allDisplays.forEach(display => {
                    if (point[0] >= display.bounds.x &&
                        point[0] <= display.bounds.x + display.bounds.width &&
                        point[1] >= display.bounds.y &&
                        point[1] <= display.bounds.y + display.bounds.height) {
                        pointsVisible++;
                    }
                });
            });

            // If a monitor is mirrored, one point could be visible in multiple monitors.
            fullyVisible = pointsVisible >= points.length;
        }

        return fullyVisible;
    }
};