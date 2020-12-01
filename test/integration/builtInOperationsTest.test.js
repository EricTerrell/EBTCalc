/*
  EBTCalc
  (C) Copyright 2020, Eric Bergman-Terrell

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

const Application = require('spectron').Application;
const assert = require('assert');
const path = require('path');
const StringLiterals = require('../../lib/stringLiterals');

let client;

describe('Built-in Operations', function () {
    this.timeout(60000);

    before(async function () {
        try {
            this.app = new Application({
                // Your electron path can be any binary. Specify a path value that points to where you installed EBTCalc.
                path: 'C:\\Users\\Eric Terrell\\Documents\\software development\\EBTCalc-build\\EBTCalc-win32-x64\\EBTCalc.exe',

                // Assuming you have the following directory structure

                //  |__ my project
                //     |__ ...
                //     |__ main.js
                //     |__ package.json
                //     |__ index.html
                //     |__ ...
                //     |__ test
                //        |__ spec.js  <- You are here! ~ Well you should be.

                // The following line tells spectron to look and use the main.js file
                // and the package.json located 1 level above.
                args: [path.join(__dirname, '..')]
            });

            const app = await this.app.start();

            client = this.app.client;

            await click('#clear_all');

            await click('#button_8');
            await click('#fix');

            return app;
        } catch(error) {
            console.log(`Error: ${error}`);
        }
    });

    async function getElement(selector) {
        return await client.$(selector);
    }

    async function click(selector) {
        const element = await getElement(selector);

        await element.click();
    }

    async function getText(selector) {
        const element = await getElement(selector);

        return await element.getText();
    }

    async function getValue(selector) {
        const element = await getElement(selector);

        return await element.getValue();
    }

    beforeEach(async function() {
        await click('#clear_all');

        await click('#button_8');
        await click('#fix');
    });

    after(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    });

    it('should add correctly', async function() {
        await click('#button_2');
        await click('#enter');

        await click('#button_2');
        await click('#add');

        const stackText = await getText('#stack');

        assert.equal(stackText, '4.00000000');
    });

    it('should subtract correctly', async function() {
        await click('#button_5');
        await click('#enter');

        await click('#button_3');
        await click('#subtract');

        const stackText = await getText('#stack');

        assert.equal(stackText, '2.00000000');
    });

    it('should multiply correctly', async function() {
        await click('#button_5');
        await click('#enter');

        await click('#button_3');
        await click('#multiply');

        const stackText = await getText('#stack');

        assert.equal(stackText, '15.00000000');
    });

    it('should divide correctly', async function() {
        await click('#button_1');
        await click('#enter');

        await click('#button_3');
        await click('#divide');

        const stackText = await getText('#stack');

        assert.equal(stackText, '0.33333333');
    });

    it('should calculate square root correctly', async function() {
        await click('#button_2');
        await click('#square_root');

        const stackText = await getText('#stack');

        assert.equal(stackText, '1.41421356');
    });

    it('should calculate change sign correctly', async function() {
        await click('#button_3');
        await click('#change_sign');

        const stackText = await getText('#stack');

        assert.equal(stackText, '-3.00000000');
    });

    it('should handle fix correctly', async function() {
        await click('#pi');

        let stackText = await getText('#stack');

        assert.equal(stackText, '3.14159265');
    });

    it('should handle float correctly', async function() {
        await click('#pi');

        let stackText = await getText('#stack');

        assert.equal('3.14159265', stackText);

        await click('#float');

        stackText = await getText('#stack');

        assert.equal(stackText, '3.141592653589793');
    });

    it('should handle scientific notation correctly', async function() {
        await click('#button_6');
        await click('#decimal_point');
        await click('#button_0');
        await click('#button_2');
        await click('#button_2');
        await click('#enter');

        await click('#button_2');
        await click('#button_3');

        await click('#scientific_notation');

        const stackText = await getText('#stack');

        assert.equal(stackText, '6.02200000e+23');
    });

    it('should calculate reciprocal correctly', async function() {
        await click('#button_8');
        await click('#reciprocal');

        const stackText = await getText('#stack');

        assert.equal(stackText, '0.12500000');
    });

    it('should calculate factorial correctly', async function() {
        await click('#button_6');
        await click('#factorial');

        const stackText = await getText('#stack');

        assert.equal(stackText, '720.00000000');
    });

    it('should handle [...] → correctly', async function() {
        await click('#button_6');
        await click('#enter');
        await click('#button_7');
        await click('#stack_to_array');

        let stackText = await getText('#stack');
        assert.equal(stackText, '[6.00000000, 7.00000000]');

        await click('#array_to_stack');

        stackText = await getText('#stack');
        assert.equal('6.00000000\n7.00000000', stackText);
    });

    it('should handle → [...] correctly', async function() {
        await click('#button_6');
        await click('#enter');
        await click('#button_7');
        await click('#stack_to_array');

        const stackText = await getText('#stack');
        assert.equal(stackText, '[6.00000000, 7.00000000]');
    });

    it('should handle x → [...] correctly', async function() {
        await click('#button_6');
        await click('#enter');
        await click('#button_7');
        await click('#enter');
        await click('#button_8');
        await click('#enter');

        await click('#button_2');
        await click('#top_x_values_to_array');

        const stackText = await getText('#stack');
        assert.equal(stackText, '6.00000000\n[7.00000000, 8.00000000]');
    });

    it('should raise to exponent correctly', async function() {
        await click('#button_2');
        await click('#enter');

        await click('#button_1');
        await click('#button_0');
        await click('#raise');

        const stackText = await getText('#stack');
        assert.equal(stackText, '1,024.00000000');
    });

    it('should calculate % correctly', async function() {
        await click('#button_2');
        await click('#percent');

        const stackText = await getText('#stack');
        assert.equal(stackText, '0.02000000');
    });

    it('should calculate square correctly', async function() {
        await click('#button_2');
        await click('#square');

        const stackText = await getText('#stack');
        assert.equal(stackText, '4.00000000');
    });

    it('should calculate pi correctly', async function() {
        await click('#pi');

        const stackText = await getText('#stack');
        assert.equal(stackText, '3.14159265');
    });

    it('should handle drop correctly', async function() {
        await click('#button_2');
        await click('#enter');

        await click('#button_7');
        await click('#enter');

        await click('#drop');

        const stackText = await getText('#stack');
        assert.equal(stackText, '2.00000000');
    });

    it('should handle swap correctly', async function() {
        await click('#button_2');
        await click('#enter');

        await click('#button_7');
        await click('#enter');

        let stackText = await getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        await click('#swap');

        stackText = await getText('#stack');
        assert.equal(stackText, '7.00000000\n2.00000000');
    });

    async function _clearEntryClearAllSetup() {
        await click('#button_2');
        await click('#enter');

        await click('#button_7');
        await click('#enter');

        await click('#button_3');
        await click('#decimal_point');
        await click('#button_1');
        await click("#button_4");

        const topLineText = await getValue('#topLine');
        assert.equal(topLineText, '3.14');
    }

    it('should handle clear entry correctly', async function() {
        await _clearEntryClearAllSetup();

        let stackText = await getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        await click('#clear_entry');

        // Stack should still be intact.
        stackText = await getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        // Top Line should be clear.
        const topLineText = await getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);
    });

    it('should handle clear all correctly', async function() {
        await _clearEntryClearAllSetup();

        let stackText = await getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        await click('#clear_all');

        // Stack should be empty.
        stackText = await getText('#stack');
        assert.equal(stackText, StringLiterals.EMPTY_STRING);

        // Top Line should be clear.
        const topLineText = await getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);
    });

    it('should handle backspace correctly', async function() {
        let topLineText = await getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);

        await click('#button_3');
        await click('#decimal_point');
        await click('#button_1');
        await click('#button_4');

        topLineText = await getValue('#topLine');
        assert.equal(topLineText, '3.14');

        await click('#backspace');
        topLineText = await getValue('#topLine');
        assert.equal(topLineText, '3.1');
    });

    it('should handle invalid inputs correctly', async function() {
        const topLineText = await getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);

        // Enter floating-point number with multiple decimal points.
        await click('#button_3');
        await click('#decimal_point');
        await click('#decimal_point');
        await click('#button_1');
        await click('#button_4');
        await click('#enter');

        const errorText = await getText('#error');
        assert.equal(errorText, "Error: invalid value: '3..14'.");
    });

    it('should handle enter correctly', async function() {
        await click('#button_9');
        await click('#enter');

        let stackText = await getText('#stack');
        assert.equal(stackText, '9.00000000');

        // Pressing Enter again should duplicate the value.
        await click('#enter');

        stackText = await getText('#stack');
        assert.equal(stackText, '9.00000000\n9.00000000');
    });
});