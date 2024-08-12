/*
  EBTCalc
  (C) Copyright 2024, Eric Bergman-Terrell

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

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects

const newableClassNames = new Set([
    null,
    'Function',
    'Number', 'BigInt', 'Math', 'Date',
    'String', 'RegExp',
    'Array',
    'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
    'Int16Array', 'Uint16Array',
    'Int32Array', 'Uint32Array',
    'Float32Array', 'Float64Array',
    'BigInt64Array', 'BigUint64Array',
    'Map', 'Set', 'WeakMap', 'WeakSet',
    'ArrayBuffer', 'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON',
    'Promise', 'Generator', 'GeneratorFunction', 'AsyncFunction',
    'Reflect', 'Proxy',
    'Intl', 'Intl.Collator', 'Intl.DateTimeFormat', 'Intl.ListFormat', 'Intl.NumberFormat', 'Intl.PluralRules',
    'Intl.RelativeTimeFormat', 'Intl.Locale',
    'WebAssembly', 'WebAssembly.Module', 'WebAssembly.Instance', 'WebAssembly.Memory', 'WebAssembly.Table',
    'WebAssembly.CompileError', 'WebAssembly.LinkError', 'WebAssembly.RuntimeError',
    'arguments',
    'BigNumber', 'Boolean'
]);

module.exports = class DetectBuiltIns {
    static isNewable(className) {
        return newableClassNames.has(className)
    }
};
