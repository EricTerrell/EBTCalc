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

const StringLiterals = require('./stringLiterals');
const BigNumber = require('bignumber.js');

const BigNumberFormatter = require('./bigNumberFormatter');
const bigNumberFormatter = new BigNumberFormatter();

module.exports = class ValueFormatter {
    setNumberFormatFixed(minimumFractionDigits) {
        bigNumberFormatter.setFormatFixed(minimumFractionDigits);
    }

    setNumberFormatFloat() {
        bigNumberFormatter.setFormatFloat();
    }

    get options() {
        return bigNumberFormatter.options;
    }

    set options(options) {
        bigNumberFormatter.options = options;
    }

    getDisplayText(value) {
        let displayText = `${value}`;

        if (value && value.constructor) {
            if (value.constructor === String) {
                displayText = `'${value}'`;
            } else if (value.constructor.name === 'BigNumber') {
                displayText = bigNumberFormatter.getDisplayText(value);
            } else if (Array.isArray(value)) {
                const regex = new RegExp(',', StringLiterals.REGEX_GLOBAL_FLAG);

                displayText = `[${value}]`.replace(regex, ', ');
            } else if (value.constructor.name === 'Number') {
                displayText = bigNumberFormatter.getDisplayText(new BigNumber(value));
            }
        }

        return displayText;
    }
};