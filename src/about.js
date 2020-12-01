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

const {shell, ipcRenderer} = require('electron');
const {config} = require('./package.json');

const StringLiterals = require('./lib/stringLiterals');
const AppInfo = require('./lib/appInfo');
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

            shell.openExternal(link.href).then();
        });
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        }
    });

    licenseTermsButton.addEventListener(StringLiterals.CLICK, () => {
        licenseTermsButton.disabled = true;

        WindowUtils.createWindow('license_terms', () => {licenseTermsButton.disabled = false});
    });

    document.querySelector('#donate').addEventListener(StringLiterals.CLICK, () => {
        shell.openExternal(config.donateUrl).then();
    });

    document.querySelector('#feedback').addEventListener(StringLiterals.CLICK, () => {
        shell.openExternal(config.submitFeedback).then();
    });

    document.querySelector('#check_for_updates').addEventListener(StringLiterals.CLICK, () => {
        ipcRenderer.invoke(StringLiterals.CHECK_FOR_UPDATES).then();
    });
}
