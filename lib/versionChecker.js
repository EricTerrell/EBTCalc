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

const child_process = require('child_process');
const {ipcRenderer} = require('electron');
const StringLiterals = require('./stringLiterals');
const path = require('path');

module.exports = class VersionChecker {
    static checkVersion() {
        console.log(`VersionChecker: checkVersion __dirname: ${__dirname}`);

        const scriptPath = path.join(__dirname, '../src/checkVersion.js');

        const childProcess = child_process.fork(scriptPath, [], {silent: true});

        childProcess.on(StringLiterals.CLOSE, function (code) {
            const message = `child process exited with code ${code}`;
            console.log(message);
        });

        childProcess.stdout.on(StringLiterals.DATA, (data) => {
            console.log(`child process stdout ${data}`);

            if (data.includes(StringLiterals.NOT_EQUAL)) {
                ipcRenderer.invoke(StringLiterals.CHECK_FOR_UPDATES).then();
            }
        });

        childProcess.stderr.on(StringLiterals.DATA, (data) => {
            console.log(`child process stderr ${data}`);
        });
    }
};
