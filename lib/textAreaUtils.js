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

const StringLiterals = require('./stringLiterals');

module.exports = class TextAreaUtils {
    static scrollToCharacterPosition(textArea, characterPosition, selectionLength, maxLinesAbove) {
        const lineHeight = TextAreaUtils.getLineHeight(textArea);
        const line = TextAreaUtils.getLineNumber(textArea, characterPosition);

        textArea.scrollTop = lineHeight * Math.max(0, line - 1 - maxLinesAbove);
        textArea.setSelectionRange(characterPosition, characterPosition + selectionLength);
        textArea.focus();
    }

    static scrollToLine(textArea, lineNumber, selectionLength, maxLinesAbove, column = 1) {
        const characterPosition = TextAreaUtils.getCharacterPosition(textArea, lineNumber, column);
        TextAreaUtils.scrollToCharacterPosition(textArea, characterPosition, selectionLength, maxLinesAbove);
    }

    static getCharacterPosition(textArea, line, column) {
        let startPosition = 0;
        let lines = 0;

        if (line > 1) {
            for (let char of textArea.value) {
                startPosition++;

                if (char === StringLiterals.NEWLINE) {
                    lines++;

                    if (lines === line - 1) {
                        break;
                    }
                }
            }
        }

        startPosition += (column - 1);

        return startPosition;
    }

    static getLineNumber(textArea, characterPosition) {
        const text = textArea.value.slice(0, characterPosition);

        let lines = 1;

        for (let char of text) {
            if (char === StringLiterals.NEWLINE) {
                lines++;
            }
        }

        return lines;
    }

    static getCursorPos(textArea) {
        const selectionStart = textArea.selectionStart;

        const text = textArea.value.slice(0, selectionStart);

        let lines = 1;

        for (let char of text) {
            if (char === StringLiterals.NEWLINE) {
                lines++;
            }
        }

        let characters = 1;

        for (let i = text.length - 1; i >= 0; i--) {
            if (text[i] !== StringLiterals.NEWLINE) {
                characters++;
            } else {
                break;
            }
        }

        return {
            line: lines,
            character: characters
        };
    }

    static getLineHeight(textArea) {
        let lines = 1;

        for (let char of textArea.value) {
            if (char === StringLiterals.NEWLINE) {
                lines++;
            }
        }

        return textArea.scrollHeight / lines;
    }
};
