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
const path = require('path');
const fs = require('fs');
const StringLiterals = require('../../lib/stringLiterals');

describe("default Source Code tests", () => {
    let Main, ComputerMath, Trig, Statistics, Developer;

    before(() => {
        const originalPath = path.join(__dirname, '../../resources/predefinedSourceCode.js');
        const newPath = path.join(__dirname, '../../resources/defaultSourceCodeModule.js');

        const originalSourceCode = fs.readFileSync(originalPath, StringLiterals.ENCODING);
        const newSourceCode =
`${originalSourceCode}

module.exports = [Main, ComputerMath, Trig, Statistics, Developer, Dates, BaseNumber, ComputerMath];`;

        fs.writeFileSync(newPath, newSourceCode);

        [Main, ComputerMath, Trig, Statistics, Developer, Dates, BaseNumber, ComputerMath] = require(newPath);
    });

    describe('Main Tests', () => {
        it('should calculate absolute value', () => {
            expect(Main.absoluteValue(-3)).to.eql(3);
            expect(Main.absoluteValue(3)).to.eql(3);
            expect(Main.absoluteValue(0)).to.eql(0);
        });

        it('should calculate integer part', () => {
            expect(Main.integerPart(Math.PI)).to.eql(3);
        });

        it('should calculate fractional part', () => {
            const originalNumber = 3.14159;
            const result = Main.fractionalPart(originalNumber);

            expect(result.toPrecision(5)).to.equal(0.14159.toPrecision(5));
        });

        it('should calculate ceiling', () => {
            const originalNumber = 3.00001;
            const result = Main.ceiling(originalNumber);

            expect(result).to.equal(4);
        });

        it('should calculate floor', () => {
            const originalNumber = 3.00001;
            const result = Main.floor(originalNumber);

            expect(result).to.equal(3);
        });

        it('should calculate toFraction', () => {
            const originalNumber = Math.PI;
            const result = Main.findFraction(originalNumber, 100);

            expect(result).to.eql([3, 12, 85]);
        });

        it('should calculate 10^x', () => {
            const result = Main.tenToX(2.5);
            expect(result.toPrecision(8)).to.equal(316.227766.toPrecision(8));
        });

        it('should calculate e', () => {
            expect(Main.e()).to.equal(Math.E);
        });

        it('should calculate e^x', () => {
            expect(Main.e_To_x(2.5).toPrecision(5)).to.equal(12.18249396.toPrecision(5));
        });

        it('should calculate ln', () => {
            expect(Main.ln(2.5).toPrecision(5)).to.equal(0.9162907319.toPrecision(5));
        });

        it('should calculate log', () => {
            expect(Main.log(2.5).toPrecision(5)).to.equal(0.3979400087.toPrecision(5));
        });

        it('should calculate modulo', () => {
            expect(Main.modulo(100, 22)).to.equal(100 % 22);
        });

        it('should calculate round', () => {
            expect(Main.round(Math.PI)).to.equal(3);
            expect(Main.round(3.51)).to.equal(4);
        });
    });

    describe('Trig tests', () => {
        it('should calculate cos', () => {
            expect(Trig.cos(33.33).toPrecision(4)).to.equal('0.8355');
        });

        it('should calculate acos', () => {
            expect(Trig.acos(0.83551977913546183913951758890315).toPrecision(4)).to.equal('33.33');
        });

        it('should calculate cosh', () => {
            expect(Trig.cosh(0.33).toPrecision(5)).to.equal('1.0549');
        });

        it('should calculate acosH', () => {
            expect(Trig.acosh(1.0549459309478532178990831405318).toPrecision(2)).to.equal('0.33');
        });

        it('should calculate sin', () => {
            expect(Trig.sin(33.33).toPrecision(5)).to.equal('0.54946')
        });

        it('should calculate asin', () => {
            expect(Trig.asin(0.5494603704303241806091535023955).toPrecision(4)).to.equal('33.33');
        });

        it('should calculate sinh', () => {
            expect(Trig.sinh(0.33).toPrecision(5)).to.equal('0.33602');
        });

        it('should calculate asinh', () => {
            expect(Trig.asinh(0.33602219751592704834366466442135).toPrecision(2)).to.equal('0.33');
        });

        it('should calculate tan', () => {
            expect(Trig.tan(33.33).toPrecision(4)).to.equal('0.6576')
        });

        it('should calculate atan', () => {
            expect(Trig.atan(0.65762700554960867894617461928834).toPrecision(4)).to.equal('33.33');
        });

        it('should calculate tanh', () => {
            expect(Trig.tanh(0.33).toPrecision(4)).to.equal('0.3185');
        });

        it('should calculate atanh', () => {
            expect(Trig.atanh(0.3185207769027708415242261427052).toPrecision(2)).to.equal('0.33');
        });

        it('should calculate degrees to radians', () => {
            expect(Trig.radians(360).toPrecision(7)).to.equal('6.283185');
        });

        it('should calculate radians to degrees', () => {
            expect(Trig.degrees(6.283185).toPrecision(6)).to.equal('360.000');
        });
    });

    describe('Statistics Tests', () => {
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

    describe('developer tests', () => {
        const encodedValue = 'aGVsbG8gZXJpYw==';
        const decodedValue = 'hello eric';

        it('should base64Encode', () => {
            const result = Developer.base64Encode(decodedValue);
            expect(result).to.equal(encodedValue);
        });

        it('should base64Decode', () => {
            const result = Developer.base64Decode(encodedValue);
            expect(result).to.equal(decodedValue);
        });

        it('should JSON pretty print', () => {
            const jsonText = JSON.stringify({ "hello": "eric" });
            const result = Developer.jsonPrettyPrint(jsonText);

            expect(result).to.equal('{\n    "hello": "eric"\n}');
        });

        it('should XML pretty print', () => {
            const xmlText = '<hello><eric/></hello>';
            const result = Developer.xmlPrettyPrint(xmlText);

            expect(result).to.equal('<hello>\n  <eric/>\n</hello>');
        })
    });

    describe('Dates tests', () => {
        it('should calculate Now', () => {
            const now = new Date();
            const result = Dates.Now();
            const diff = Dates.diffInDays(result, now);

            expect(diff < 0.001).to.be.true;
        });

        it('should calculate diff in days', () => {
           const startDate = Date.parse('2019-01-01');
           const endDate = Date.parse('2020-01-01');

           const diff = Dates.diffInDays(endDate, startDate);

           expect(diff).to.equal(365);
        });

        it('should handle string->date', () => {
            const result = Dates.str2Date('2020-01-01');

            expect(result).to.be.a('date');
        });
    });

    describe('ComputerMath tests', () => {
        it('should calculate ->Bin', () => {
            const baseNumber = new BaseNumber(10, 7);
            const result = ComputerMath.toBin(baseNumber);

            expect(result.base).to.equal(2);
            expect(result.number).to.equal('111');
        });

        it('should calculate ->Dec', () => {
            const baseNumber = new BaseNumber(2, '111');
            const result = ComputerMath.toDec(baseNumber);

            expect(result.base).to.equal(10);
            expect(result.number).to.equal('7');
        });

        it('should calculate ->Double', () => {
            const baseNumber = new BaseNumber(2, '111');
            const decNumber = ComputerMath.toDec(baseNumber);
            const result = ComputerMath.toDecimal(decNumber);

            expect(result).to.equal(7);
        });

        it('should calculate ->Hex', () => {
            const baseNumber = new BaseNumber(2, '1111000011110000');
            const result = ComputerMath.toHex(baseNumber);

            expect(result.base).to.equal(16);
            expect(result.number).to.equal('f0f0');
        });

        it('should calculate ->Oct', () => {
            const baseNumber = new BaseNumber(10, '10');
            const result = ComputerMath.toOct(baseNumber);

            expect(result.base).to.equal(8);
            expect(result.number).to.equal('12');
        });

        it('should calculate +', () => {
            const a = new BaseNumber(16, 'F');
            const b = new BaseNumber(10, '10');

            const result = ComputerMath.add(a, b);

            expect(result.base).to.equal(b.base);
            expect(result.number).to.equal('25');
        });

        it('should calculate -', () => {
            const a = new BaseNumber(16, 'F');
            const b = new BaseNumber(10, '2');

            const result = ComputerMath.subtract(a, b);

            expect(result.base).to.equal(b.base);
            expect(result.number).to.equal('13');
        });

        it('should calculate *', () => {
            const a = new BaseNumber(16, 'F');
            const b = new BaseNumber(10, '10');

            const result = ComputerMath.multiply(a, b);

            expect(result.base).to.equal(b.base);
            expect(result.number).to.equal('150');
        });

        it('should calculate /', () => {
            const a = new BaseNumber(16, 'E');
            const b = new BaseNumber(10, '2');

            const result = ComputerMath.divide(a, b);

            expect(result.base).to.equal(b.base);
            expect(result.number).to.equal('7');
        });

        it('should calculate And', () => {
            const a = new BaseNumber(2, '111');
            const b = new BaseNumber(2, '101');

            const result = ComputerMath.and(a, b);

            expect(result.base).to.equal(2);
            expect(result.number).to.equal('101');
        });

        it('should calculate Complement', () => {
            const a = new BaseNumber(2, '101');

            const result = ComputerMath.complement(a);

            expect(result.base).to.equal(2);
            expect(result.number).to.equal('10');
        });

        it('should calculate Or', () => {
            const a = new BaseNumber(2, '101');
            const b = new BaseNumber(2, '10');

            const result = ComputerMath.or(a, b);

            expect(result.base).to.equal(2);
            expect(result.number).to.equal('111');
        });

        it('should calculate string->Bin', () => {
            const result = ComputerMath.string2Bin('101');

            expect(result.base).to.equal(2);
            expect(result.number).to.equal('101');
        });

        it('should calculate string->Dec', () => {
            const result = ComputerMath.string2Dec('101');

            expect(result.base).to.equal(10);
            expect(result.number).to.equal('101');
        });

        it('should calculate string->Oct', () => {
            const result = ComputerMath.string2Oct('101');

            expect(result.base).to.equal(8);
            expect(result.number).to.equal('101');
        });

        it('should calculate string->Hex', () => {
            const result = ComputerMath.string2Hex('fff');

            expect(result.base).to.equal(16);
            expect(result.number).to.equal('fff');
        });

        it('should calculate Xor', () => {
            const a = new BaseNumber(2, '101');
            const b = new BaseNumber(2, '110');

            const result = ComputerMath.xor(a, b);

            expect(result.base).to.equal(2);
            expect(result.number).to.equal('11');
        });
    });
});