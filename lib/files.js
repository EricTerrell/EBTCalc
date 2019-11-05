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

const Constants = require('./constants');
const fs = require('fs');
const FileUtils = require('./fileUtils');
const StringLiterals = require('./stringLiterals');

module.exports = class Files {
    static _getStackPath() { return FileUtils.getAppFilePath(StringLiterals.STACK_FILENAME); }

    static loadStack() {
        try {
            return JSON.parse(fs.readFileSync(Files._getStackPath(), StringLiterals.ENCODING));
        } catch (err) {
            console.log(`loadStack ${Files._getStackPath()} ${err}`);
            return {
                stackItems: [],
                topLine: '',
                options: {
                    minimumFractionDigits: Constants.DEFAULT_MINIMUM_FRACTION_DIGITS,
                    scientificNotationDigits: Constants.DEFAULT_SCIENTIFIC_NOTATION_DIGITS,
                    maxFloatDigits: Constants.DEFAULT_MAX_FLOAT_DIGITS
                }
            };
        }
    }

    static saveStack(stackData) {
        console.info(`saveStack: ${Files._getStackPath()} ${stackData}`);

        try {
            fs.writeFileSync(Files._getStackPath(), JSON.stringify(stackData));
        } catch (err) {
            console.log(`saveStack ${Files._getStackPath()} ${JSON.stringify(stackData)} ${err}`);
        }
    }
    static _getVariablesPath() {
        return FileUtils.getAppFilePath(StringLiterals.VARIABLES_FILENAME);
    }

    static loadVariables() {
        try {
            return JSON.parse(fs.readFileSync(Files._getVariablesPath(), StringLiterals.ENCODING));
        } catch (err) {
            console.log(`loadVariables ${Files._getVariablesPath()} ${err}`);
            return {
                variables: null
            };
        }
    }

    static saveVariables(variables) {
        console.info(`saveVariables: ${Files._getVariablesPath()} ${variables}`);

        try {
            fs.writeFileSync(Files._getVariablesPath(), JSON.stringify(variables));
        } catch (err) {
            console.log(`saveVariables ${Files._getVariablesPath()} ${JSON.stringify(variables)} ${err}`);
        }
    }

    static _getSettingsPath() {
        return FileUtils.getAppFilePath(StringLiterals.SETTINGS_FILENAME);
    }

    static getDefaultSettings() {
        return {
            decimalPoint: StringLiterals.DECIMAL_POINT,
            thousandsSeparator: StringLiterals.DEFAULT_THOUSANDS_SEPARATOR,
            tabWidth: 2,
            checkForUpdates: true
        };
    }

    static getSettings() {
        try {
            const settings = JSON.parse(fs.readFileSync(Files._getSettingsPath(), StringLiterals.ENCODING));

            if (!settings.decimalPoint) {
                throw 'getSettings: decimalPoint not specified';
            }

            if (!settings.thousandsSeparator) {
                throw 'getSettings: thousandsSeparator not specified';
            }

            if (!settings.tabWidth) {
                throw 'getSettings: tabWidth not specified';
            }

            if (settings.checkForUpdates === undefined || settings.checkForUpdates === null) {
                throw 'getSettings: checkForUpdates not specified';
            }

            return settings;
        } catch (err) {
            console.log(`getSettings ${Files._getSettingsPath()} ${err}`);

            return Files.getDefaultSettings();
        }
    }

    static saveSettings(settings) {
        try {
            fs.writeFileSync(Files._getSettingsPath(), JSON.stringify(settings));
        } catch (err) {
            console.log(`saveSettings ${Files._getSettingsPath()} ${JSON.stringify(settings)} ${err}`);
        }
    }

    static _getUserSourceCodePath() {
        return FileUtils.getAppFilePath(StringLiterals.USER_SOURCE_CODE);
    }

    static saveUserSourceCode(sourceCode) {
        try {
            fs.writeFileSync(Files._getUserSourceCodePath(), sourceCode);

            const {remote} = require('electron');
            const mainProcess = remote.require('./main');

            mainProcess.notifySourceCodeChanged();
        } catch (err) {
            console.log(`saveUserSourceCode: path: ${Files._getUserSourceCodePath()} ${err}`);
        }
    }

    static getUserSourceCode() {
        try {
            return fs.readFileSync(Files._getUserSourceCodePath(), StringLiterals.ENCODING);
        } catch (err) {
            console.log(`getUserSourceCode: ${err}`);

            return StringLiterals.EMPTY_STRING;
        }
    }

    static getPredefinedSourceCode() {
        let defaultSourceCodePath;

        try {
            defaultSourceCodePath = path.join(__dirname, `../resources/${StringLiterals.PREDEFINED_SOURCE_CODE}`);
            return fs.readFileSync(defaultSourceCodePath, StringLiterals.ENCODING);
        } catch (err) {
            console.log(`getDefaultSourceCode defaultSourceCodePath: ${defaultSourceCodePath} ${err}`);
            return StringLiterals.EMPTY_STRING;
        }
    }

    static getMergedSourceCode() {
        return `${Files.getPredefinedSourceCode()}\n\n${Files.getUserSourceCode()}`;
    }

    static _getLicenseTermsPath() {
        return FileUtils.getAppFilePath(StringLiterals.LICENSE_TERMS);
    }

    static getLicenseTerms() {
        try {
            return JSON.parse(fs.readFileSync(Files._getLicenseTermsPath(), StringLiterals.ENCODING));
        } catch (err) {
            console.log(`getLicenseTerms ${Files._getLicenseTermsPath()} ${err}`);

            return {
                userAccepted: false
            }
        }
    }

    static saveLicenseTerms(licenseTerms) {
        try {
            fs.writeFileSync(Files._getLicenseTermsPath(), JSON.stringify(licenseTerms));
        } catch (err) {
            console.log(`saveLicenseTerms: path: ${Files._getLicenseTermsPath()} ${err}`);
        }
    }
};