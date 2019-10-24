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
const path = require('path');
const fs = require('fs');
const StringLiterals = require('../lib/stringLiterals');

describe("default Source Code tests", () => {
    let Main, ComputerMath, Trig, Statistics;

    before(() => {
        const originalPath = path.join(__dirname, '../resources/predefinedSourceCode.js');
        const newPath = path.join(__dirname, '../resources/defaultSourceCodeModule.js');

        const originalSourceCode = fs.readFileSync(originalPath, StringLiterals.ENCODING);
        const newSourceCode =
`${originalSourceCode}

module.exports = [Main, ComputerMath, Trig, Statistics];`;

        fs.writeFileSync(newPath, newSourceCode);

        [Main, ComputerMath, Trig, Statistics] = require(newPath);
    });

    it('should calculate absolute value', () => {
        const originalNumber = -3;
        const result = Main.absoluteValue(originalNumber);

        expect(result).to.eql(3);
    });

    it('should calculate integer part', () => {
        const originalNumber = 3.14159;
        const result = Main.integerPart(originalNumber);

        expect(result).to.eql(3);
    });

    it('should calculate fractional part', () => {
        const originalNumber = 3.14159;
        const result = Main.fractionalPart(originalNumber);

        expect(result.toPrecision(5)).to.equal(0.14159.toPrecision(5));
    });

    it('should calculate mean', () => {
        const array = [3, 4, 5];
        const result = Statistics.mean(array);

        expect(result).to.equal(4);
    });

    it('should calculate median', () => {
        const array = [3, 4, 5, 6, 7];
        const result = Statistics.median(array);

        expect(result).to.equal(5);
    });

    it('should calculate variance', () => {
        const array = [67, 72, 85, 93, 98];
        const result = Statistics.variance(array);

        expect(result).to.equal(141.2);
    });

    it('should calculate standard deviation', () => {
        const array = [600, 470, 170, 430, 300];

        let result = Statistics.mean(array);
        expect(result).to.equal(394);

        result = Statistics.variance(array);
        expect(result).to.equal(21704);

        result = Statistics.standardDeviation(array);

        expect(result).to.equal(147.32277488562318);
    });
});