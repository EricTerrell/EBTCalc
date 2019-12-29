const Application = require('spectron').Application
const assert = require('assert')
const path = require('path');

// https://github.com/electron-userland/spectron

describe('Built-in Operations', function () {
    this.timeout(10000);

    before(async function () {
        this.app = new Application({
            // Your electron path can be any binary
            path: 'C:\\Users\\Eric Terrell\\Documents\\EBTCalc-win32-x64\\EBTCalc.exe',

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

        const client = this.app.client;

        await client.click('#clear_all');

        await client.click('#button_8');
        await client.click('#fix');

        return app;
    });

    beforeEach(async function() {
        const client = this.app.client;

        await client.click('#clear_all');

        await client.click('#button_8');
        await client.click('#fix');
    });

    after(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    });

    it('should add correctly', async function() {
        const client = this.app.client;

        await client.click('#clear_all');

        await client.click('#button_2');
        await client.click('#enter');

        await client.click('#button_2');
        await client.click('#add');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '4.00000000');
    });

    it('should subtract correctly', async function() {
        const client = this.app.client;

        await client.click('#clear_all');

        await client.click('#button_5');
        await client.click('#enter');

        await client.click('#button_3');
        await client.click('#subtract');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '2.00000000');
    });

    it('should multiply correctly', async function() {
        const client = this.app.client;

        await client.click('#clear_all');

        await client.click('#button_5');
        await client.click('#enter');

        await client.click('#button_3');
        await client.click('#multiply');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '15.00000000');
    });

    it('should divide correctly', async function() {
        const client = this.app.client;

        await client.click('#clear_all');

        await client.click('#button_1');
        await client.click('#enter');

        await client.click('#button_3');
        await client.click('#divide');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '0.33333333');
    });

    it('should calculate square root correctly', async function() {
        const client = this.app.client;

        await client.click('#button_2');
        await client.click('#square_root');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '1.41421356');
    });

    it('should calculate change sign correctly', async function() {
        const client = this.app.client;

        await client.click('#button_3');
        await client.click('#change_sign');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '-3.00000000');
    });

    it('should handle fix correctly', async function() {
        const client = this.app.client;

        await client.click('#pi');

        let stackText = await client.getText('#stack');

        assert.equal(stackText, '3.14159265');
    });

    it('should handle float correctly', async function() {
        const client = this.app.client;

        await client.click('#pi');

        let stackText = await client.getText('#stack');

        assert.equal('3.14159265', stackText);

        await client.click('#float');

        stackText = await client.getText('#stack');

        assert.equal(stackText, '3.141592653589793');
    });

    it('should handle scientific notation correctly', async function() {
        const client = this.app.client;

        await client.click('#button_6');
        await client.click('#decimal_point');
        await client.click('#button_0');
        await client.click('#button_2');
        await client.click('#button_2');
        await client.click('#enter');

        await client.click('#button_2');
        await client.click('#button_3');

        await client.click('#scientific_notation');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '6.02200000e+23');
    });

    it('should calculate reciprocal correctly', async function() {
        const client = this.app.client;

        await client.click('#button_8');
        await client.click('#reciprocal');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '0.12500000');
    });

    it('should calculate factorial correctly', async function() {
        const client = this.app.client;

        await client.click('#button_6');
        await client.click('#factorial');

        const stackText = await client.getText('#stack');

        assert.equal(stackText, '720.00000000');
    });

    it('should handle [...] → correctly', async function() {
        const client = this.app.client;

        await client.click('#button_6');
        await client.click('#enter');
        await client.click('#button_7');
        await client.click('#stack_to_array');

        let stackText = await client.getText('#stack');
        assert.equal(stackText, '[6.00000000, 7.00000000]');

        await client.click('#array_to_stack');

        stackText = await client.getText('#stack');
        assert.equal('6.00000000\n7.00000000', stackText);
    });

    it('should handle → [...] correctly', async function() {
        const client = this.app.client;

        await client.click('#button_6');
        await client.click('#enter');
        await client.click('#button_7');
        await client.click('#stack_to_array');

        const stackText = await client.getText('#stack');
        assert.equal(stackText, '[6.00000000, 7.00000000]');
    });

    it('should handle x → [...] correctly', async function() {
        const client = this.app.client;

        await client.click('#button_6');
        await client.click('#enter');
        await client.click('#button_7');
        await client.click('#enter');
        await client.click('#button_8');
        await client.click('#enter');

        await client.click('#button_2');
        await client.click('#top_x_values_to_array');

        const stackText = await client.getText('#stack');
        assert.equal(stackText, '6.00000000\n[7.00000000, 8.00000000]');
    });

    it('should raise to exponent correctly', async function() {
        const client = this.app.client;

        await client.click('#button_2');
        await client.click('#enter');

        await client.click('#button_1');
        await client.click('#button_0');
        await client.click('#raise');

        const stackText = await client.getText('#stack');
        assert.equal(stackText, '1,024.00000000');
    });

    it('should calculate % correctly', async function() {
        const client = this.app.client;

        await client.click('#button_2');
        await client.click('#percent');

        const stackText = await client.getText('#stack');
        assert.equal(stackText, '0.02000000');
    });

    it('should calculate square correctly', async function() {
        const client = this.app.client;

        await client.click('#button_2');
        await client.click('#square');

        const stackText = await client.getText('#stack');
        assert.equal(stackText, '4.00000000');
    });

    it('should calculate pi correctly', async function() {
        const client = this.app.client;

        await client.click('#pi');

        const stackText = await client.getText('#stack');
        assert.equal(stackText, '3.14159265');
    });
});