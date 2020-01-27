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

const fs = require('fs');
const path = require('path');
const StringLiterals = require('./stringLiterals');
const AppInfo = require('./appInfo');

module.exports = class FileUtils {
    static getAppFilePath(fileName) {
        const rootPath = process.env.APPDATA || (process.platform === StringLiterals.DARWIN ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
        const fullFolderPath = `${rootPath}${path.sep}${AppInfo.getInfo.name}`;

        if (!fs.existsSync(fullFolderPath)) {
            fs.mkdirSync(fullFolderPath, { recursive: true });
        }

        return `${fullFolderPath}${path.sep}${fileName}`;
    }
};
