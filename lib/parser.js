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

const esprima = require('esprima');
const Timer = require('./timer');
const StringLiterals = require('./stringLiterals');

class FunctionOrMethodInfo {
    constructor(name, className, isStatic, params) {
        this.name = name;
        this.className = className;
        this.isStatic = isStatic;
        this.params = params;
    }
}

module.exports = class Parser {
    static _extract(code) {
        const startTime = Timer.start();

        const config = {
            comment: true,
            loc: true
        };

        const syntaxTree = esprima.parseScript(code, config);

        let classes = [];
        let comments = [];
        let functions = [];
        let methods = [];

        if (syntaxTree.body) {
            functions = syntaxTree.body.filter(item => item.type === StringLiterals.PARSER_FUNCTION_DECLARATION)
                .map(item => new FunctionOrMethodInfo(item.id.name,null, false, item.params));

            syntaxTree.body.filter(classDeclaration => classDeclaration.type === StringLiterals.PARSER_CLASS_DECLARATION)
                .forEach(function(classDeclarationItem) {
                    classDeclarationItem.body.body.forEach(function(methodDefinitionItem) {
                        if (methodDefinitionItem.type === StringLiterals.PARSER_METHOD_DEFINITION && methodDefinitionItem.key.type === StringLiterals.PARSER_IDENTIFIER) {
                            const methodInfo = new FunctionOrMethodInfo(methodDefinitionItem.key.name, classDeclarationItem.id.name, methodDefinitionItem.static, methodDefinitionItem.value.params);

                            methods.push(methodInfo);
                        }
                    });
                });

            classes = syntaxTree.body.filter(item => item.type === StringLiterals.PARSER_CLASS_DECLARATION);
            comments = syntaxTree.comments;

            console.log(`Parser.extract elapsed time: ${Timer.getElapsedTimeText(Timer.stop(startTime))}`);
        }

        return {
            functions: functions,
            methods: methods,
            classes: classes,
            comments: comments
        };
    }

    static extract(predefinedSourceCode, userSourceCode) {
        let errorMessage = 'Predefined source code:';

        try {
            const extracts = [Parser._extract(predefinedSourceCode)];

            errorMessage = StringLiterals.EMPTY_STRING;
            extracts.push(Parser._extract(userSourceCode));

            for (let i = 0; i < extracts.length; i++) {
                extracts[i].comments.forEach(element => {
                    element.isUserDefined = i === 1;
                });
            }

            return {
                functions: extracts[0].functions.concat(extracts[1].functions),
                methods: extracts[0].methods.concat(extracts[1].methods),
                classes: extracts[0].classes.concat(extracts[1].classes),
                comments: extracts[0].comments.concat(extracts[1].comments)
            }
        } catch (error) {
            if (errorMessage) {
                const originalString = error.toString();
                error.toString = () => { return `${errorMessage}\n${originalString}`; }
            }

            throw error;
        }
    }
};
