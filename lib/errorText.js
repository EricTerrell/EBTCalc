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

module.exports = class ErrorText {
    constructor() {
        this.errorTextElement = document.querySelector("#error");
    }

    setErrorText(text) {
        this.errorTextElement.style.background = text ? 'red' : 'transparent';

        this.errorTextElement.innerText = text;
    }
};