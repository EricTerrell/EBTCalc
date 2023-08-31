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

const Application = require('spectron').Application;
const assert = require('assert');
const path = require('path');
const StringLiterals = require('../../lib/stringLiterals');
const SpectronUtils = require('./spectronUtils');

let client;

describe('Built-in Operations', function () {
    this.timeout(60000);

    let spectronUtils = null;

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

            spectronUtils = new SpectronUtils(client);

            return app;
        } catch(error) {
            console.log(`Error: ${error}`);
        }
    });

    beforeEach(async function() {
        await spectronUtils.click('#clear_all');

        await spectronUtils.click('#button_8');
        await spectronUtils.click('#fix');
    });

    after(function () {
        if (this.app && this.app.isRunning()) {
            this.app.stop();
            this.app.mainProcess.exit(0);
        }
    });

    it('should add correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_2');
        await spectronUtils.click('#add');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '4.00000000');
    });

    it('should subtract correctly', async function() {
        await spectronUtils.click('#button_5');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_3');
        await spectronUtils.click('#subtract');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '2.00000000');
    });

    it('should multiply correctly', async function() {
        await spectronUtils.click('#button_5');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_3');
        await spectronUtils.click('#multiply');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '15.00000000');
    });

    it('should divide correctly', async function() {
        await spectronUtils.click('#button_1');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_3');
        await spectronUtils.click('#divide');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '0.33333333');
    });

    it('should calculate square root correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#square_root');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '1.41421356');
    });

    it('should calculate change sign correctly', async function() {
        await spectronUtils.click('#button_3');
        await spectronUtils.click('#change_sign');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '-3.00000000');
    });

    it('should handle fix correctly', async function() {
        await spectronUtils.click('#pi');

        let stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '3.14159265');
    });

    it('should handle float correctly', async function() {
        await spectronUtils.click('#pi');

        let stackText = await spectronUtils.getText('#stack');

        assert.equal('3.14159265', stackText);

        await spectronUtils.click('#float');

        stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '3.141592653589793');
    });

    it('should handle scientific notation correctly', async function() {
        await spectronUtils.click('#button_6');
        await spectronUtils.click('#decimal_point');
        await spectronUtils.click('#button_0');
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_2');
        await spectronUtils.click('#button_3');

        await spectronUtils.click('#scientific_notation');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '6.02200000e+23');
    });

    it('should calculate reciprocal correctly', async function() {
        await spectronUtils.click('#button_8');
        await spectronUtils.click('#reciprocal');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '0.12500000');
    });

    it('should calculate factorial correctly', async function() {
        await spectronUtils.click('#button_6');
        await spectronUtils.click('#factorial');

        const stackText = await spectronUtils.getText('#stack');

        assert.equal(stackText, '720.00000000');
    });

    it('should handle [...] → correctly', async function() {
        await spectronUtils.click('#button_6');
        await spectronUtils.click('#enter');
        await spectronUtils.click('#button_7');
        await spectronUtils.click('#stack_to_array');

        let stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '[6.00000000, 7.00000000]');

        await spectronUtils.click('#array_to_stack');

        stackText = await spectronUtils.getText('#stack');
        assert.equal('6.00000000\n7.00000000', stackText);
    });

    it('should handle → [...] correctly', async function() {
        await spectronUtils.click('#button_6');
        await spectronUtils.click('#enter');
        await spectronUtils.click('#button_7');
        await spectronUtils.click('#stack_to_array');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '[6.00000000, 7.00000000]');
    });

    it('should handle x → [...] correctly', async function() {
        await spectronUtils.click('#button_6');
        await spectronUtils.click('#enter');
        await spectronUtils.click('#button_7');
        await spectronUtils.click('#enter');
        await spectronUtils.click('#button_8');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_2');
        await spectronUtils.click('#top_x_values_to_array');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '6.00000000\n[7.00000000, 8.00000000]');
    });

    it('should raise to exponent correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_1');
        await spectronUtils.click('#button_0');
        await spectronUtils.click('#raise');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '1,024.00000000');
    });

    it('should calculate % correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#percent');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '0.02000000');
    });

    it('should calculate square correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#square');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '4.00000000');
    });

    it('should calculate pi correctly', async function() {
        await spectronUtils.click('#pi');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '3.14159265');
    });

    it('should handle drop correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_7');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#drop');

        const stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '2.00000000');
    });

    it('should handle swap correctly', async function() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_7');
        await spectronUtils.click('#enter');

        let stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        await spectronUtils.click('#swap');

        stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '7.00000000\n2.00000000');
    });

    async function _clearEntryClearAllSetup() {
        await spectronUtils.click('#button_2');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_7');
        await spectronUtils.click('#enter');

        await spectronUtils.click('#button_3');
        await spectronUtils.click('#decimal_point');
        await spectronUtils.click('#button_1');
        await spectronUtils.click("#button_4");

        const topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, '3.14');
    }

    it('should handle clear entry correctly', async function() {
        await _clearEntryClearAllSetup();

        let stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        await spectronUtils.click('#clear_entry');

        // Stack should still be intact.
        stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        // Top Line should be clear.
        const topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);
    });

    it('should handle clear all correctly', async function() {
        await _clearEntryClearAllSetup();

        let stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '2.00000000\n7.00000000');

        await spectronUtils.click('#clear_all');

        // Stack should be empty.
        stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, StringLiterals.EMPTY_STRING);

        // Top Line should be clear.
        const topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);
    });

    it('should handle backspace correctly', async function() {
        let topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);

        await spectronUtils.click('#button_3');
        await spectronUtils.click('#decimal_point');
        await spectronUtils.click('#button_1');
        await spectronUtils.click('#button_4');

        topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, '3.14');

        await spectronUtils.click('#backspace');
        topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, '3.1');
    });

    it('should handle invalid inputs correctly', async function() {
        const topLineText = await spectronUtils.getValue('#topLine');
        assert.equal(topLineText, StringLiterals.EMPTY_STRING);

        // Enter floating-point number with multiple decimal points.
        await spectronUtils.click('#button_3');
        await spectronUtils.click('#decimal_point');
        await spectronUtils.click('#decimal_point');
        await spectronUtils.click('#button_1');
        await spectronUtils.click('#button_4');
        await spectronUtils.click('#enter');

        const errorText = await spectronUtils.getText('#error');
        assert.equal(errorText, "Error: invalid value: '3..14'.");
    });

    it('should handle enter correctly', async function() {
        await spectronUtils.click('#button_9');
        await spectronUtils.click('#enter');

        let stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '9.00000000');

        // Pressing Enter again should duplicate the value.
        await spectronUtils.click('#enter');

        stackText = await spectronUtils.getText('#stack');
        assert.equal(stackText, '9.00000000\n9.00000000');
    });
});