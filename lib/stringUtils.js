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

module.exports = class StringUtils {
    static lastIndexOf(text, searchText, caseSensitive = true) {
        if (caseSensitive) {
            return text.lastIndexOf(searchText);
        } else {
            return text.toUpperCase().lastIndexOf(searchText.toUpperCase());
        }
    }

    static indexOf(text, searchText, startIndex, caseSensitive = true) {
        if (caseSensitive) {
            return text.indexOf(searchText);
        } else {
            return text.toUpperCase().indexOf(searchText.toUpperCase(), startIndex);
        }
    }

    static replaceAll(text, searchText, replacementText) {
        let result = text;

        if (searchText !== replacementText) {
            while (result.indexOf(searchText) !== -1) {
                result = result.replace(searchText, replacementText);
            }
        }

        return result;
    }

    static isQuotedString(value) {
        value = value.trim();

        let result = false;

        if (value.length >= 2) {
            result = (value.startsWith("'") && value.endsWith("'")) ||
                (value.startsWith('"') && value.endsWith('"'));
        }

        return result;
    }

    static isNumber(value) {
        return value !== undefined && value != null && value.trim().length > 0 && !isNaN(value.trim());
    }

    static isBoolean(value) {
        return value.trim() === 'true' || value.trim() === 'false';
    }

    static isNull(value) {
        return value.trim() === 'null';
    }
};
