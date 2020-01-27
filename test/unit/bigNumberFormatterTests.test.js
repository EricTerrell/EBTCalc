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

const expect = require('chai').expect;
const BigNumber = require('bignumber.js');
const BigNumberFormatter = require('../../lib/bigNumberFormatter');

describe("BigNumberFormatter tests", () => {
    let bigNumberFormatter;

    beforeEach(() => {
        bigNumberFormatter = new BigNumberFormatter();
    });

    it('should format fixed (small number)', () => {
        const value = new BigNumber('3.14159');
        bigNumberFormatter.setFormatFixed(4);
        const valueText = bigNumberFormatter.getDisplayText(value);

        expect(valueText).to.equal('3.1416');
    });

    it('should format exponential notation number (should ignore minimum fraction digits)', () => {
        const value = new BigNumber('-735.0918e-430');
        bigNumberFormatter.setFormatFixed(2);
        const valueText = bigNumberFormatter.getDisplayText(value);

        expect(valueText).to.equal('-7.35e-428');
    });
});