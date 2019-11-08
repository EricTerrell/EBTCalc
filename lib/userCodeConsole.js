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

const StringLiterals = require('../lib/stringLiterals');

module.exports = class UserCodeConsole {
    static log(message) {
        process.stdout.write(`${StringLiterals.USER_LOG_MESSAGE_DELIMITER}${message}${StringLiterals.USER_LOG_MESSAGE_DELIMITER}`);
    }

    static logWithoutDelimiters(message) {
        process.stdout.write(`${message}`);
    }

    static trace(message) {
        UserCodeConsole.logWithoutDelimiters(`TRACE: ${message}`);
    }

    static debug(message) {
        UserCodeConsole.logWithoutDelimiters(`DEBUG: ${message}`);
    }

    static info(message) {
        UserCodeConsole.logWithoutDelimiters(`INFO: ${message}`);
    }

    static warn(message) {
        UserCodeConsole.logWithoutDelimiters(`WARN: ${message}`);
    }

    static error(message) {
        UserCodeConsole.logWithoutDelimiters(`${StringLiterals.ERROR_DELIMITER}${message}${StringLiterals.ERROR_DELIMITER}`);
    }
};