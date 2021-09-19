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

const expect = require('chai').expect;

const StringUtils = require('../../lib/stringUtils');
const StringLiterals = require('../../lib/stringLiterals');

describe("StringUtils tests", () => {
    it('should not consider blank string, undefined, or null to be a number', () => {
        expect(StringUtils.isNumber(StringLiterals.EMPTY_STRING)).to.be.false;
        expect(StringUtils.isNumber(null)).to.be.false;
        expect(StringUtils.isNumber(undefined)).to.be.false;
    });

    it('should not consider legit number strings to be numbers', () => {
        expect(StringUtils.isNumber('3.14159')).to.be.true;
        expect(StringUtils.isNumber('0')).to.be.true;
        expect(StringUtils.isNumber('12312312312')).to.be.true;
    });
});