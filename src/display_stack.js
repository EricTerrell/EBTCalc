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

const ipc = require('electron').ipcRenderer;
const StringLiterals = require('./lib/stringLiterals.js');
const {remote, clipboard} = require('electron');
const { Menu, MenuItem } = remote;

const closeButton = document.querySelector('#close');
const stackList = document.querySelector('#stack_list');

ipc.on(StringLiterals.CHILD_WINDOW_CHANNEL, (event, stackItems) => {
    wireUpUI(stackItems);
});

function wireUpUI(stackItems) {
    console.log(`display_stack: stackValues: ${JSON.stringify(stackItems)}`);

    stackItems.forEach(element => {
        const newListItem = document.createElement(StringLiterals.LI);
        newListItem.className = StringLiterals.STACK_ITEM;

        const preItem = document.createElement(StringLiterals.PRE);

        const textNode = document.createTextNode(element);
        preItem.appendChild(textNode);
        newListItem.appendChild(preItem);
        stackList.appendChild(newListItem);

        preItem.addEventListener(StringLiterals.CONTEXTMENU, (event) => {
            const menu = new Menu();

            menu.append(new MenuItem({ role: 'selectall' }));
            menu.append(new MenuItem({ role: 'copy' }));

            if (!this.contextMenuActive) {
                event.preventDefault();

                menu.popup({window: remote.getCurrentWindow()});
            }
        }, false);
    });

    closeButton.addEventListener(StringLiterals.CLICK, () => {
        window.close();
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        }
    });
}