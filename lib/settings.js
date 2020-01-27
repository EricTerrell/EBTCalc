/*
  EBTCalc
  (C) Copyright 2020, Eric Bergman-Terrell

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

const {ipcRenderer} = require('electron');
const WindowUtils = require('./windowUtils');
const StringLiterals = require('./stringLiterals');

module.exports = class Settings {
    static launchSettingsUI(afterCloseCallback) {
        const onDestroyedCallback = () => {
            ipcRenderer.invoke(StringLiterals.NOTIFY_SETTINGS_CHANGED)
                .then(() => {
                    afterCloseCallback();
                });
        };

        WindowUtils.createWindow('settings_ui', onDestroyedCallback);
    }
};