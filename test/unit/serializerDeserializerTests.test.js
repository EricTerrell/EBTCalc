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
const expect = require('chai').expect;

const serializerDeserializer = require('../../lib/serializerDeserializer');

const Whatever = require('./whatever');
const whatever = new Whatever();

describe("serializerDeserializer tests", () => {
    function ___evalFunction(expression) {
        console.log('___evalFunction: expression: ' + expression);

        return eval(expression);
    }

    it('should serialize and deserialize class object', () => {
        const result = serializerDeserializer.serialize(whatever);
        const deserializedResult = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result.className).to.equal('Whatever');
        expect(deserializedResult).to.eql(whatever);
    });

    it('should serialize and deserialize function', () => {
        const f = function func() { return 'func'; };

        const result = serializerDeserializer.serialize(f);
        const deserializedResult = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result.className).to.equal('Function');
        expect(deserializedResult()).to.equal(f());
    });

    it('should serialize and deserialize int', () => {
        const intValue = Number(42);

        let result = serializerDeserializer.serialize(intValue);
        result = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result).to.equal(intValue);
    });

    it('should serialize and deserialize a Number', () => {
        const number = Number('3.14');

        let result = serializerDeserializer.serialize(number);
        result = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result).to.equal(number);
    });

    it('should serialize and deserialize null', () => {
        let result = serializerDeserializer.serialize(null);
        result = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result).to.be.null;
    });

    it('should serialize and deserialize undefined', () => {
        let result = serializerDeserializer.serialize(undefined);
        result = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result).to.be.undefined;
    });

    it('should serialize and deserialize Date object', () => {
        const date = new Date('04 Dec 1995 00:12:00 GMT');

        let result = serializerDeserializer.serialize(date);
        result = serializerDeserializer.deserialize(result, ___evalFunction);

        expect(result.toString()).to.equal(date.toString());
        expect(result.getDate()).to.equal(date.getDate());
    });

    it('should deserialize class object', () => {
        const whatever = new Whatever();

        const serializedValue = serializerDeserializer.serialize(whatever);

        const deserializedValue = serializerDeserializer.deserialize(serializedValue, ___evalFunction);

        expect(deserializedValue.greet()).to.equal('hello');
        expect(deserializedValue.now).to.not.be.null;
    });

    it('should deserialize array', () => {
        const array = [1, 2, 3];

        const serializedValue = serializerDeserializer.serialize(array);

        const deserializedValue = serializerDeserializer.deserialize(serializedValue, ___evalFunction);

        expect(deserializedValue).to.eql(array);
    });

    it('should deserialize array', () => {
        const array = [ 1, 2, 3 ];

        const serializedValue = serializerDeserializer.serialize(array);

        const deserializedValue = serializerDeserializer.deserialize(serializedValue, ___evalFunction);

        expect(deserializedValue).to.eql(array);
    });

    it('should use default eval function', () => {
        const result = serializerDeserializer.serialize(whatever);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(result.className).to.equal('Whatever');
        expect(deserializedResult).to.eql(whatever);
    });

    it('should handle large numbers', () => {
        const value = Number.MAX_VALUE;

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult).to.equal(value);
    });

    it('should handle overflow', () => {
        const value = Number.MAX_VALUE * 2.0;

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult).to.equal(value);
    });

    it('should handle overflow (negative infinity)', () => {
        const value = -Number.MAX_VALUE * 2.0;

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult).to.equal(value);
    });

    it('should handle a Map', () => {
        const value = new Map();
        value.set('eric', 'terrell');

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult.get('eric')).to.equal('terrell');
    });

    it('should handle a Map containing a Date', () => {
        const value = new Map();
        value.set('d', new Date('1995-12-17T03:24:00'));

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult.get('d').getFullYear()).to.equal(1995);
    });

    it('should handle a BigNumber', () => {
        const value = new BigNumber('3.14159');

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult).to.eql(value);
    });

    it('should handle a string', () => {
        const value = 'hello world';

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult).to.eql(value);
    });

    it('should handle NaN', () => {
        const value = NaN;

        const result = serializerDeserializer.serialize(value);
        const deserializedResult = serializerDeserializer.deserialize(result);

        expect(deserializedResult).to.eql(value);
    });
});