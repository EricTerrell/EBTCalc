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

module.exports = class SpectronUtils {
    constructor(client) {
        this._client = client;
    }
    async getElement(selector) {
        return await this._client.$(selector);
    }

    async click(selector) {
        const element = await this.getElement(selector);

        await element.click();
    }

    async getText(selector) {
        const element = await this.getElement(selector);

        return await element.getText();
    }

    async getValue(selector) {
        const element = await this.getElement(selector);

        return await element.getValue();
    }

};
