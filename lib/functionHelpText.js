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

module.exports = class FunctionHelpText {
    static getText(functionItem) {
        function formatLiteral(literal) {
            return typeof literal.value === 'string' ? `'${literal.value}'` : literal.value;
        }

        function formatAssignmentPattern(param) {
            return (param.right.value !== undefined) ? formatLiteral(param.right) : '?';
        }

        function formatParameter(param) {
            if (param.type === 'Identifier') {
                return param.name;
            } else if (param.type === 'AssignmentPattern') {
                return `${param.left.name} = ${formatAssignmentPattern(param)}`;
            } else if (param.type === 'RestElement') {
                return `...${param.argument.name}`;
            }
        }

        const argList = functionItem.params
            .map(param => formatParameter(param))
            .join(', ');

        return `${functionItem.name}(${argList})`;
    }
};
