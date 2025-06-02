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

const StringLiterals = require('./lib/stringLiterals');
const Constants = require('./lib/constants');
const StringUtils = require('./lib/stringUtils');
const Files = require('./lib/files');

const decimalPointCharacter = document.querySelector('#decimal_point_character');
const thousandsSeparator = document.querySelector('#thousands_separator');
const tabWidth = document.querySelector('#tab_width');
const checkForUpdates = document.querySelector('#check_for_updates');

const ok = document.querySelector('#ok');
const cancel = document.querySelector('#cancel');
const defaults = document.querySelector('#defaults');

const settings = Files.getSettings();

wireUpUI();

function wireUpUI() {
    function submit() {
        settings.decimalPoint = decimalPointCharacter.value;
        settings.thousandsSeparator = thousandsSeparator.value;
        settings.tabWidth = Number.parseInt(tabWidth.value);
        settings.checkForUpdates = checkForUpdates.checked;

        Files.saveSettings(settings);

        window.close();
    }

    decimalPointCharacter.value = settings.decimalPoint;
    thousandsSeparator.value = settings.thousandsSeparator;
    tabWidth.value = settings.tabWidth;
    checkForUpdates.checked = settings.checkForUpdates;

    decimalPointCharacter.focus();

    ok.addEventListener(StringLiterals.CLICK, () => {
        submit();
    });

    cancel.addEventListener(StringLiterals.CLICK, () => {
       window.close();
    });

    defaults.addEventListener(StringLiterals.CLICK, () => {
        const defaultSettings = Files.getDefaultSettings();

        decimalPointCharacter.value = defaultSettings.decimalPoint;
        thousandsSeparator.value = defaultSettings.thousandsSeparator;
        tabWidth.value = defaultSettings.tabWidth.toString();

        enableDisableOKButton();
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        } else if (event.key === StringLiterals.ENTER && !ok.disabled) {
            submit();
        }
    });

    [ decimalPointCharacter, thousandsSeparator, tabWidth ].forEach(element => {
        element.addEventListener(StringLiterals.KEYUP, () => {
            enableDisableOKButton();
        })
    });

    enableDisableOKButton();
}

function enableDisableOKButton() {
    function isNumberCharacter(character) {
        return '0123456789e+-'.includes(character);
    }

    function isOperator(char) {
        return Constants.OPERATOR_CHARS.includes(char);
    }

    const enabled =
        decimalPointCharacter.value.length === 1
        && thousandsSeparator.value.length === 1
        && decimalPointCharacter.value !== thousandsSeparator.value
        && !isOperator(decimalPointCharacter.value) && !isOperator(thousandsSeparator.value)
        && !isNumberCharacter(decimalPointCharacter.value[0])
        && !isNumberCharacter(thousandsSeparator.value[0])
        && StringUtils.isNumber(tabWidth.value) && Number.parseInt(tabWidth.value) > 0;

    ok.disabled = !enabled;
}