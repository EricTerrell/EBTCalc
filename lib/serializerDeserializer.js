/*
  EBTCalc
  (C) Copyright 2022, Eric Bergman-Terrell

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

const serialize = require('serialize-javascript');
const detectBuiltIns = require('./detectNewables');
const BigNumber = require('bignumber.js');

// A user-defined class used in the unit test
const Whatever = require('../test/unit/whatever');

module.exports = class SerializerDeserializer {
    static _extractClassName(value) {
        if (value != null) {
            return value.constructor && value.constructor.name;
        } else {
            return null;
        }
    }

    static _serializeAllValues(value) {
        if (typeof value === 'number' && isNaN(value)) {
            return 'NaN';
        } else {
            return serialize(value);
        }
    }

    /**
     * Converts an object or value into an object that can be subsequently converted back to the original object
     * or value
     * @param value the object or value being saved for later use
     * @return {displayText: string, serializedValue: (*|an), className: *} object that can be subsequently converted back to the original object
     */
    static serialize(value) {
        if (value && value.constructor && value.constructor.name === 'BigNumber') {
            return {
                displayText: value.toString(),
                serializedValue: `new BigNumber('${value.toString()}')`,
                className: this._extractClassName(value)
            }
        } else {
            return {
                displayText: `${value}`,
                serializedValue: this._serializeAllValues(value),
                className: this._extractClassName(value)
            }
        }
    }

    static _evalFunction(expression) {
        console.log(`___evalFunction: ${expression}`);

        return eval(expression);
    }

    /**
     * Converts a value returned by Serializer.serialize into the original value
     * @param value the value returned by Serializer.serialize
     * @param evalFunction a callback that simply calls eval with the specified argument. Used because calling eval
     * inside this (compiled) module will not find a user-defined class.
     * @return the original value passed to Serializer.serialize
     */
    static deserialize(value, evalFunction = SerializerDeserializer._evalFunction) {
        console.log(`deserialize: value: ${JSON.stringify(value)}`);

        if (value.serializedValue === 'NaN' && value.className === 'Number') {
            return NaN;
        }

        let stringToEval = `(${value.serializedValue})`;
        let deserializedValue = evalFunction(stringToEval);

        console.log(`Eval returned: ${JSON.stringify(deserializedValue)}`);

        if (!detectBuiltIns.isNewable(value.className)) {
            console.log(`className: ${value.className}`);

            const stringToEval = `new ${value.className}()`;
            console.log(`stringToEval: ${stringToEval}`);

            const classObject = evalFunction(stringToEval);
            console.log(`classObject: ${JSON.stringify(classObject)}`);

            deserializedValue = Object.assign(classObject, deserializedValue);
            console.log(`deserializedValue: ${JSON.stringify(deserializedValue)}`);
        }

        console.log(`deserialize: returning: ${deserializedValue}`);

        return deserializedValue;
    }
};
