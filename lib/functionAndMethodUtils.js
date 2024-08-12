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

const StringLiterals = require('../lib/stringLiterals');

module.exports = class FunctionAndMethodUtils {
    static getRequiredParamInfo(functionOrMethodInfo) {
        const result = {
            minParameters: 0,
            maxParameters: 0,
        };

        functionOrMethodInfo.params.forEach(parameterInfo => {
            if (parameterInfo.type === StringLiterals.PARSER_IDENTIFIER) {
                result.minParameters++;
                result.maxParameters++;
            } else if (parameterInfo.type === StringLiterals.PARSER_ASSIGNMENT_PATTERN) {
                result.maxParameters++;
            }

            if (parameterInfo.type === StringLiterals.PARSER_REST_ELEMENT) {
                result.maxParameters = Infinity;
            }
        });

        return result;
    }
};
