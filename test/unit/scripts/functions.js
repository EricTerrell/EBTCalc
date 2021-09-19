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

class Whatever {
    static greet() { return 'hello'; };
    hello() { return 'helloWorld'; };
}

function approximatePi() { return 22.0 / 7.0; }

function product(a, b) { return a * b; }

function factorial(n) {
    return (n === 0 || n === 1) ? 1 : n * factorial(n - 1);
}

function restParameterFunction(x, ...y) {
    return null;
}

// this is a line comment

const pi = approximatePi();

const p = product(2, 3);

const f = factorial(10);

class Another {
    hello() { return 'hello'; };
}