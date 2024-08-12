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

const {version, config} = require('../package.json');
const https = require('https');
const StringLiterals = require('../lib/stringLiterals');
const Files = require('../lib/files');

function checkVersion(errorCallback, notEqualsCallback, equalsCallback) {
    console.log(`checkVersion: url: ${config.versionFileUrl}`);

    try {
        https.get(config.versionFileUrl, (res) => {
            const {statusCode} = res;
            console.log(`checkVersion statusCode: ${statusCode}`);

            if (statusCode === 200) {
                res.setEncoding(StringLiterals.ENCODING);

                let retrievedData = StringLiterals.EMPTY_STRING;

                res.on('data', (chunk) => {
                    console.log(`checkVersion: chunk: ${chunk}`);

                    retrievedData += chunk;
                });

                res.on('end', () => {
                    console.log(`checkVersion: retrieved ${retrievedData} current version: ${version}`);

                    if (retrievedData.trim() === version) {
                        console.log(`checkVersion: version is equal`);
                        equalsCallback();
                    } else {
                        console.log(`checkVersion: version is NOT equal`);
                        notEqualsCallback();
                    }

                    updateLastVersionCheck();
                });

                res.on('error', (error) => {
                    console.info(`checkVersion: error: ${error}`);

                    errorCallback();
                })
            } else {
                errorCallback();
            }
        });
    } catch (error) {
        console.error(`checkVersion: error ${error}`);
    }
}

function updateLastVersionCheck() {
    const settings = Files.getSettings();
    settings.lastVersionCheck = new Date();
    Files.saveSettings(settings);
}

module.exports = {checkVersion};