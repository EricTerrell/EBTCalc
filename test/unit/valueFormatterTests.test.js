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

const expect = require('chai').expect;

const ValueFormatter = require('../../lib/valueFormatter');

describe("ValueFormatter tests", () => {
    let valueFormatter;

    beforeEach(() => {
        valueFormatter = new ValueFormatter();
    });

    it('should format dates', () => {
        const dateString = '2011-10-10T14:48:00';

        const date = new Date(dateString);
        const dateText = valueFormatter.getDisplayText(date);

        expect(dateText).to.equal('Mon Oct 10 2011 14:48:00 GMT-0600 (Mountain Daylight Time)');
    });
});