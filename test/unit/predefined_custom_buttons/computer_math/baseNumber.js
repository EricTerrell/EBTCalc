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

module.exports = class BaseNumber {
    constructor(base, number) {
        this.base = base;
        this.number = number;
    }

    toString() {
        const baseNames = [];

        baseNames[2] = "BIN";
        baseNames[8] = "OCT";
        baseNames[10] = "DEC";
        baseNames[16] = "HEX";

        return baseNames[this.base] + " " + this.number.toUpperCase();
    };

    length() {
        return this.number.length;
    }

    convertBase(targetBase) {
        let decimal = parseInt(this.number, this.base);
        return new BaseNumber(targetBase, decimal.toString(targetBase));
    };
};