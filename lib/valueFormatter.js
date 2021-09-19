/*
  EBTCalc
  (C) Copyright 2021, Eric Bergman-Terrell

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

    isInFloatMode() {
        return this.options.minimumFractionDigits === undefined;
    }

    set options(options) {
        bigNumberFormatter.options = options;
    }

    getArrayDisplayText(array) {
        const elements = array
            .map((element) => this.getDisplayText(element))
            .join(', ');

        return `[${elements}]`;
    }

    getDisplayText(value) {
        let displayText = `${value}`;

        if (value !== null && value !== undefined && value.constructor) {
            if (value.constructor === String) {
                displayText = `'${value}'`;
            } else if (value.constructor.name === 'BigNumber') {
                displayText = bigNumberFormatter.getDisplayText(value);
            } else if (Array.isArray(value)) {
                displayText = this.getArrayDisplayText(value);
            } else if (value.constructor.name === 'Number') {
                displayText = bigNumberFormatter.getDisplayText(new BigNumber(value));
            }
        }

        return displayText;
    }
};
