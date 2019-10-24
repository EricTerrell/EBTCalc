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

const BigNumber = require('bignumber.js');
const Constants = require('./constants');

module.exports = class BigNumberFormatter {
    constructor(minimumFractionDigits = Constants.DEFAULT_MINIMUM_FRACTION_DIGITS,
                scientificNotationDigits = Constants.DEFAULT_SCIENTIFIC_NOTATION_DIGITS,
                maxFloatDigits = Constants.DEFAULT_MAX_FLOAT_DIGITS) {
        this.minimumFractionDigits = minimumFractionDigits;
        this.scientificNotationDigits = scientificNotationDigits;
        this.maxFloatDigits = maxFloatDigits;
    }

    get options() {
        return {
            minimumFractionDigits: this.minimumFractionDigits,
            scientificNotationDigits: this.scientificNotationDigits,
            maxFloatDigits: this.maxFloatDigits
        }
    }

    set options(options) {
        this.minimumFractionDigits = options.minimumFractionDigits;
        this.scientificNotationDigits = options.scientificNotationDigits;
        this.maxFloatDigits = options.maxFloatDigits;
    }

    setFormatFixed(digits) {
        this.minimumFractionDigits = new BigNumber(digits).toNumber();
    }

    setFormatFloat() {
        this.minimumFractionDigits = 0;
    }

    _isScientificNotation(value) {
        const valueText = `${value}`;

        return valueText.indexOf('e+') !== -1 || valueText.indexOf('e-') !== -1;
    }

    _stripRedundantZeros(value) {
        let result = `${value}`;

        while (result.indexOf('.') !== -1 && result.endsWith('0')) {
            result = result.slice(0, result.length - 1);
        }

        return result;
    }

    getDisplayText(value) {
        if (value.toString() === 'Infinity') {
            return '∞';
        } else if (value.toString() === '-Infinity') {
            return '-∞';
        } else if (this._isScientificNotation(value)) {
            return `${value.toExponential(this.minimumFractionDigits > 0 ? this.minimumFractionDigits : this.scientificNotationDigits)}`;
        } else if (this.minimumFractionDigits > 0) {
            // Fix
            return `${value.toFormat(this.minimumFractionDigits)}`;
        } else {
            // Float
            return `${this._stripRedundantZeros(value.toFormat(this.maxFloatDigits))}`;
        }
    }
};
