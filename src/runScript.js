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

const UserCodeConsole = require('../lib/userCodeConsole');
const vm = require('vm');
const StringLiterals = require('../lib/stringLiterals');
const BigNumber = require('bignumber.js');

const code = process.argv[2];

console.log(`runScript: ${code}`);

/*
RegExp, Date, Map, and Set are added to the sandbox's global context so that the uses of the instanceof operator
in the serialize-javascript component are successful.
 */
const sandbox = {
    require: require,
    console: UserCodeConsole,
    RegExp: RegExp,
    Date: Date,
    Map: Map,
    Set: Set,
    Buffer: Buffer,
    BigNumber,
    pushValue
};

const options = {
    codeGeneration: {
        strings: true
    }
};

process.on(StringLiterals.MESSAGE, (msg) => {
    console.log('Message from parent:', msg);
});

try {
    vm.createContext(sandbox, options);

    console.log(`runScript: created context`);

    const runInContextOptions = {
        filename: StringLiterals.USER_SOURCE_CODE,
        lineOffset: 0,
        columnOffset: 0,
    };

    vm.runInContext(code, sandbox, runInContextOptions);

    console.log('runScript: completed runInContext');
} catch (err) {
    sandbox.err = err;
    console.log(`runScript: error: ${err}`);

    process.send(`Message from parent:${err}`);
}

process.send({sandbox: sandbox});

function pushValue(value) {
    process.send({push: value});
}