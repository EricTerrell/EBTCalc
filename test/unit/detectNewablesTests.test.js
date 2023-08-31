/*
  EBTCalc
  (C) Copyright 2023, Eric Bergman-Terrell

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

const detectBuiltIns = require('../../lib/detectNewables');

describe("DetectBuiltIns tests", () => {
    it('should handle null', () => {
        expect(detectBuiltIns.isNewable(null)).to.be.true;
    });

    it('should handle Number', () => {
        expect(detectBuiltIns.isNewable('Number')).to.be.true;
    });

    it('should handle non built-in', () => {
        expect(detectBuiltIns.isNewable('Whatever')).to.be.false;
    });
});