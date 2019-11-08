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
const {Menu, MenuItem} = remote;
const StringLiterals = require('./stringLiterals');

function addContextMenu(element) {
    element.addEventListener(StringLiterals.CONTEXTMENU, (event) => {
        const menu = new Menu();

        menu.append(new MenuItem({ label: StringLiterals.MENU_UNDO, accelerator: 'CmdOrCtrl+Z', role: 'undo' }));
        menu.append(new MenuItem({ type: StringLiterals.MENU_SEPARATOR }));
        menu.append(new MenuItem({ label: StringLiterals.MENU_CUT, accelerator: 'CmdOrCtrl+X', role: 'cut' }));
        menu.append(new MenuItem({ label: StringLiterals.MENU_COPY, accelerator: 'CmdOrCtrl+C', role: 'copy' }));
        menu.append(new MenuItem({ label: StringLiterals.MENU_PASTE, accelerator: 'CmdOrCtrl+V', role: 'paste' }));
        menu.append(new MenuItem({ label: StringLiterals.MENU_SELECT_ALL, accelerator: 'CmdOrCtrl+A', role: 'selectAll' }));

        event.preventDefault();

        menu.popup({window: remote.getCurrentWindow()});
    }, false);
}

module.exports = {addContextMenu};