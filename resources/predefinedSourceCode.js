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

class Main {
    static sign(x) {
        return x >= 0 ? 1 : -1;
    }

    // button Main.absoluteValue "|x|" "(Main)"
    static absoluteValue(x) {
        return Math.abs(x);
    };

    // button Main.integerPart "Integer Part" "(Main)"
    static integerPart(x) {
        return Main.sign(x) * Math.floor(Math.abs(x));
    };

    // button Main.fractionalPart "Fractional Part" "(Main)"
    static fractionalPart(x) {
        return x - Main.integerPart(x);
    };

    // button Main.round "Round" "(Main)"
    static round(x) {
        return Main.sign(x) * Math.floor(Math.abs(x) + 0.5);
    };

    // button Main.floor "⌊x⌋" "(Main)"
    static floor(x) {
        return Math.floor(x);
    };

    // button Main.ceiling "⌈x⌉" "(Main)"
    static ceiling(x) {
        return Math.ceil(x);
    };

    // button Main.log "log" "(Main)"
    static log(x) {
        return Math.log(x) / Math.log(10);
    };

    // button Main.tenToX "10^x" "(Main)"
    static tenToX(x) {
        return Math.pow(10, x);
    };

    // button Main.e "e" "(Main)"
    static e() {
        return Math.E;
    };

    // button Main.ln "ln" "(Main)"
    static ln(x) {
        return Math.log(x);
    };

    // button Main.e_To_x "e^x" "(Main)"
    static e_To_x(x) {
        return Math.pow(Math.E, x);
    };

    // button Main.modulo "modulo" "(Main)"
    static modulo(n, divisor) {
        const remain = n % divisor;
        return Math.floor(remain >= 0 ? remain : remain + divisor);
    };

    // button Main.findFraction "→Fraction" "(Main)"
    static findFraction(number, iterations) {
        const wholePart = Main.integerPart(number);
        const savedSign = wholePart === 0 ? Main.sign(number) : 1;
        const fraction = Math.abs(number - wholePart);
        let numerator = 0;
        let denominator = 1;
        let bn = 0;
        let bd = 0;
        let error = 0;

        for (let i = 0; i < iterations; i++) {
            const tempFraction = numerator / denominator;
            const tempError = Math.abs(tempFraction - fraction);

            if (i === 0 || tempError < error) {
                error = tempError;
                bn = numerator;
                bd = denominator;
            }

            if (tempFraction < fraction) {
                numerator++;
            }
            else {
                denominator++;
            }
        }

        return [wholePart, savedSign * bn, bd];
    }
}

class BaseNumber {
    constructor(base, number) {
        this.base = base;
        this.number = number;
    }

    toString() {
        const baseNames = [];

        baseNames[2] = "BIN";
        baseNames[8] = "OCT";
        baseNames[10] = "DEC";
        baseNames[16] = "HEX";

        return baseNames[this.base] + " " + this.number.toUpperCase();
    };

    length() {
        return this.number.length;
    }

    convertBase(targetBase) {
        let decimal = parseInt(this.number, this.base);
        return new BaseNumber(targetBase, decimal.toString(targetBase));
    };
}

class ComputerMath {
    // button ComputerMath.string2Bin "String →Bin" "Computer Math"
    static string2Bin(numberString) {
        return new BaseNumber(2, numberString);
    }

    // button ComputerMath.string2Oct "String →Oct" "Computer Math"
    static string2Oct(numberString) {
        return new BaseNumber(8, numberString);
    }

    // button ComputerMath.string2Dec "String →Dec" "Computer Math"
    static string2Dec(numberString) {
        return new BaseNumber(10, numberString);
    }

    // button ComputerMath.string2Hex "String →Hex" "Computer Math"
    static string2Hex(numberString) {
        return new BaseNumber(16, numberString);
    }

    static bn(x) {
        return x.constructor.name !== 'BaseNumber' ? new BaseNumber(10, x) : x;
    }


    // button ComputerMath.toBin "→Bin" "Computer Math"
    static toBin(x) {
        return ComputerMath.bn(x).convertBase(2);
    }

    // button ComputerMath.toOct "→Oct" "Computer Math"
    static toOct(x) {
        return ComputerMath.bn(x).convertBase(8);
    }

    // button ComputerMath.toDec "→Dec" "Computer Math"
    static toDec(x) {
        return ComputerMath.bn(x).convertBase(10);
    }

    // button ComputerMath.toHex "→Hex" "Computer Math"
    static toHex(x) {
        return ComputerMath.bn(x).convertBase(16);
    }

    static logicalOperation(a, b, f) {
        a = a.convertBase(2).number;
        b = b.convertBase(2).number;

        const padLength = Math.max(a.length, b.length);

        const aBits = a.padStart(padLength, '0');
        const bBits = b.padStart(padLength, '0');

        let bits = '';

        for (let i = 0; i < padLength; i++) {
            let bit;

            if (f(aBits[i], bBits[i])) {
                bit = '1';
            }
            else {
                bit = '0';
            }

            bits += bit;
        }

        return new BaseNumber(2, bits);
    }

    // button ComputerMath.add "+" "Computer Math"
    static add(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;

        a = ComputerMath.toDecimal(a);
        b = ComputerMath.toDecimal(b);

        return new BaseNumber(10, a + b).convertBase(base);
    };

    // button ComputerMath.subtract "−" "Computer Math"
    static subtract(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;

        a = ComputerMath.toDecimal(a);
        b = ComputerMath.toDecimal(b);

        return new BaseNumber(10, a - b).convertBase(base);
    };

    // button ComputerMath.multiply "×" "Computer Math"
    static multiply(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;

        a = ComputerMath.toDecimal(a);
        b = ComputerMath.toDecimal(b);

        return new BaseNumber(10, a * b).convertBase(base);
    };

    // button ComputerMath.divide "÷" "Computer Math"
    static divide(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;

        a = ComputerMath.toDecimal(a);
        b = ComputerMath.toDecimal(b);

        return new BaseNumber(10, a / b).convertBase(base);
    };

    // button ComputerMath.and "And" "Computer Math"
    static and(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;
        const result = ComputerMath.logicalOperation(a, b, function (a, b) {
            return a === "1" && b === "1";
        });

        return result.convertBase(base);
    }

    // button ComputerMath.or "Or" "Computer Math"
    static or(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;
        const result = ComputerMath.logicalOperation(a, b, function (a, b) {
            return a === "1" || b === "1";
        });

        return result.convertBase(base);
    }

    // button ComputerMath.xor "Xor" "Computer Math"
    static xor(a, b) {
        a = ComputerMath.bn(a);
        b = ComputerMath.bn(b);

        const base = b.base;
        const result = ComputerMath.logicalOperation(a, b, function (a, b) {
            return a !== b;
        });

        return result.convertBase(base);
    }

    // button ComputerMath.complement "Complement" "Computer Math"
    static complement(a) {
        a = ComputerMath.bn(a);

        const originalBase = a.base;

        const bin = a.convertBase(2);

        let newNumber = "";

        for (let i = 0, len = bin.number.length; i < len; i++) {
            const digit = bin.number[i] === "1" ? "0" : "1";
            newNumber += digit;
        }

        bin.number = newNumber;

        return bin.convertBase(originalBase);
    }

    // button ComputerMath.toDecimal "→Double" "Computer Math"
    static toDecimal(n) {
        n = ComputerMath.bn(n);

        return parseInt(n.number, n.base);
    }
}

class Trig {
    // button Trig.radians "Degrees→Radians" "Trig"
    static radians(degrees) {
        return degrees * Math.PI / 180;
    };

    // button Trig.degrees "Radians→Degrees" "Trig"
    static degrees(radians) {
        return radians * 180 / Math.PI;
    };

    // button Trig.sin "Sin" "Trig"
    static sin(degrees) { return Math.sin(Trig.radians(degrees)); };

    // button Trig.asin "ASin" "Trig"
    static asin(x) { return Trig.degrees(Math.asin(x)); };

    // button Trig.cos "Cos" "Trig"
    static cos(degrees) { return Math.cos(Trig.radians(degrees)); };

    // button Trig.acos "ACos" "Trig"
    static acos(x) {
        return Trig.degrees(Math.acos(x));
    };

    // button Trig.tan "Tan" "Trig"
    static tan(degrees) { return degrees !== 90 ? Math.tan(Trig.radians(degrees)) : NaN; };

    // button Trig.atan "ATan" "Trig"
    static atan(x) {
        return Trig.degrees(Math.atan(x));
    };

    // button Trig.sinh "SinH" "Trig"
    static sinh(x) { return (Math.pow(Math.E, x) - Math.pow(Math.E, -x)) / 2; };

    // button Trig.asinh "ASinH" "Trig"
    static asinh(x) { return Math.log(x + Math.sqrt(Math.pow(x, 2) + 1)); };

    // button Trig.cosh "CosH" "Trig"
    static cosh(x) { return (Math.pow(Math.E, x) + Math.pow(Math.E, -x)) / 2; };

    // button Trig.acosh "ACosH" "Trig"
    static acosh(x) { return Math.log(x + Math.sqrt(Math.pow(x, 2) - 1)); };

    // button Trig.tanh "TanH" "Trig"
    static tanh(x) { return Trig.sinh(x) / Trig.cosh(x); };

    // button Trig.tanh "ATanH" "Trig"
    static atanh(x) { return Math.log((1 + x) / (1 - x)) / 2; };
}

class Statistics {
    // button Statistics.mean "Mean(array)" "Statistics"
    static mean(array) {
        return array.reduce(function (a, b) {
            return a + b;
        }) / array.length;
    }

    // button Statistics.median "Median(array)" "Statistics"
    static median(array) {
        array = array.sort(function (a, b) {
            return a - b;
        });

        let result;

        const index = Math.floor(array.length / 2);

        if (array.length % 2 === 1) {
            result = array[index];
        } else {
            result = (array[index - 1] + array[index]) / 2;
        }

        return result;
    }

    // button Statistics.variance "Variance(array)" "Statistics"
    static variance(array) {
        const mean = Statistics.mean(array);

        let sum = 0;

        for (let i = 0, length = array.length; i < length; i++) {
            sum += Math.pow(array[i] - mean, 2);
        }

        return sum / array.length;
    }

    // button Statistics.standardDeviation "Std. Dev.(array)" "Statistics"
    static standardDeviation(array) {
        return Math.sqrt(Statistics.variance(array));
    }
}

class Memory {
    static retrieveVariable(variableName) { return ___variables.get(variableName); }

    static storeVariable(variableValue, variableName) { ___variables.set(variableName, variableValue); }

    static deleteVariable(variableName) { ___variables.delete(variableName); }

    static deleteAllVariables() { ___variables.clear(); }
}

class Dates {
    // button Dates.Now "Now" "Dates"
    static Now() {
        return new Date();
    }

    // button Dates.str2Date "String →Date" "Dates"
    static str2Date(dateString) {
        return new Date(dateString);
    }

    // button Dates.diffInDays "Diff in Days" "Dates"
    static diffInDays(d1, d2) {
        return (d1 - d2) / (1000 * 60 * 60 * 24);
    }
}

class Developer {
    // button Developer.base64Encode "base64Encode" "Developer"
    static base64Encode(unencodedString) {
        return new Buffer(unencodedString).toString('base64');
    }

    // button Developer.base64Decode "base64Decode" "Developer"
    static base64Decode(encodedString) {
        return new Buffer(encodedString, 'base64').toString('utf8');
    }

    // button Developer.jsonPrettyPrint "JSON Pretty Print" "Developer"
    static jsonPrettyPrint(jsonText) {
        jsonText = JSON.parse(jsonText.replace(/\r|\n/g, ' '));
        jsonText = JSON.stringify(jsonText, null, 4);

        return jsonText;
    }

    // button Developer.xmlPrettyPrint "XML Pretty Print" "Developer"
    static xmlPrettyPrint(xml) {
        const pd = require('pretty-data');

        return pd.pd.xml(xml, true);
    }
}
