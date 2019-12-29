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

const expect = require('chai').expect;

const BaseNumber = require('./baseNumber');

describe("BaseNumber tests", () => {
    it('should handle binary, decimal, and hex numbers, and base conversions', () => {
        const binary = new BaseNumber(2, '11111111');
        expect(binary.toString()).to.equal('BIN 11111111');

        let decimal = binary.convertBase(10);
        expect(decimal.toString()).to.equal('DEC 255');

        decimal = new BaseNumber(10, '65536');
        expect(decimal.toString()).to.equal('DEC 65536');

        let hex = binary.convertBase(16);
        expect(hex.toString()).to.equal('HEX FF');

        hex = new BaseNumber(16, 'DEADBEEF');
        expect(hex.toString()).to.equal('HEX DEADBEEF');

        decimal = hex.convertBase(10);
        expect(decimal.toString()).to.equal('DEC 3735928559');
    });
});