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

const parser = require('../lib/parser');
const fs = require('fs');
const path = require('path');

const StringLiterals = require('../lib/stringLiterals');

describe("parser tests", () => {
    it('should find functions, methods, and parameters', () => {
        const filePath = path.join(__dirname, './scripts/functions.js');
        const code = fs.readFileSync(filePath, StringLiterals.ENCODING);

        const results = parser.extract(code, StringLiterals.EMPTY_STRING);

        expect(results.functions.length).to.equal(4);
        expect(results.methods.length).to.equal(3);

        const approximatePi = results.functions.filter(item => item.name === 'approximatePi')[0];
        expect(approximatePi.className).to.be.null;
        expect(approximatePi.params.length).to.equal(0);
        expect(approximatePi.isStatic).to.be.false;

        const factorial = results.functions.filter(item => item.name === 'factorial')[0];
        expect(factorial.className).to.be.null;
        expect(factorial.params.length).to.equal(1);
        expect(approximatePi.isStatic).to.be.false;

        const restParameterFunction = results.functions.filter(item => item.name === 'restParameterFunction')[0];
        expect(restParameterFunction.className).to.be.null;
        expect(restParameterFunction.isStatic).to.be.false;
        expect(restParameterFunction.params.length).to.equal(2);

        expect(restParameterFunction.params[0].type).to.equal(StringLiterals.PARSER_IDENTIFIER);
        expect(restParameterFunction.params[0].name).to.equal('x');

        expect(restParameterFunction.params[1].type).to.equal(StringLiterals.PARSER_REST_ELEMENT);
        expect(restParameterFunction.params[1].argument.name).to.equal('y');

        const greetMethod = results.methods.filter(item => item.name === 'greet')[0];
        expect(greetMethod.className).to.equal('Whatever');
        expect(greetMethod.params.length).to.equal(0);
        expect(greetMethod.isStatic).to.be.true;

        const helloMethod = results.methods.filter(item => item.name === 'hello')[0];
        expect(helloMethod.className).to.equal('Whatever');
        expect(helloMethod.params.length).to.equal(0);
        expect(helloMethod.isStatic).to.be.false;
    });

    it('should find classes and methods', () => {
        const filePath = path.join(__dirname, './scripts/functions.js');
        const code = fs.readFileSync(filePath, StringLiterals.ENCODING);

        const classes = parser.extract(code, StringLiterals.EMPTY_STRING).classes;

        expect(classes.length).to.equal(2);
        expect(classes[0].id.name).to.equal('Whatever');
        expect(classes[1].id.name).to.equal('Another');
    });

    it('should find line comments', () => {
        const filePath = path.join(__dirname, './scripts/functions.js');
        const code = fs.readFileSync(filePath, StringLiterals.ENCODING);

        const comments = parser.extract(code, StringLiterals.EMPTY_STRING).comments;

        expect(comments.length).to.equal(2);

        expect(comments[0].type).to.equal('Block');

        expect(comments[1].type).to.equal('Line');
        expect(comments[1].value).to.equal(' this is a line comment');
    });

    it('should find syntax error', () => {
        const filePath = path.join(__dirname, './scripts/syntaxError.js');
        const code = fs.readFileSync(filePath, StringLiterals.ENCODING);

        expect(function() { parser.extract(code, StringLiterals.EMPTY_STRING) }).to.throw("Line 33: Unexpected token ?");
    });
});