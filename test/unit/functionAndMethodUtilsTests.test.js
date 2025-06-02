/*
  EBTCalc
  (C) Copyright 2025, Eric Bergman-Terrell

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

const FunctionAndMethodUtils = require('../../lib/functionAndMethodUtils');
const parser = require('../../lib/parser');
const fs = require('fs');
const path = require('path');

const StringLiterals = require('../../lib/stringLiterals');

const expect = require('chai').expect;

describe("functionAndMethodUtils tests", () => {
    let parserResults;

    beforeEach(() => {
        const filePath = path.join(__dirname, './scripts/functionParameters.js');
        const code = fs.readFileSync(filePath, StringLiterals.ENCODING);

        parserResults = parser.extract(code, StringLiterals.EMPTY_STRING);
    });

    it('should handle ordinary parameters', () => {
        const result = FunctionAndMethodUtils.getRequiredParamInfo(parserResults.classes[0].body.body[0].value);

        expect(result.minParameters).to.equal(3);
        expect(result.maxParameters).to.equal(3);
    });

    it('should handle defaulted parameters', () => {
        const result = FunctionAndMethodUtils.getRequiredParamInfo(parserResults.classes[0].body.body[1].value);

        expect(result.minParameters).to.equal(2);
        expect(result.maxParameters).to.equal(3);
    });

    it('should handle spread parameters', () => {
        const result = FunctionAndMethodUtils.getRequiredParamInfo(parserResults.classes[0].body.body[2].value);

        expect(result.minParameters).to.equal(2);
        expect(result.maxParameters).to.equal(Infinity);
    });
});