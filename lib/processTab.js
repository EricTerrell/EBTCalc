/*
  EBTCalc
  (C) Copyright 2025, Eric Bergman-Terrell

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

function tabText(tabWidth) {
    return StringLiterals.EMPTY_STRING.padEnd(tabWidth, StringLiterals.SPACE);
}

module.exports = class ProcessTab {
    constructor(tabWidth) {
        this._spacesPerTab = tabText(tabWidth);
    }

    set tabWidth(tabWidth) {
        this._spacesPerTab = tabText(tabWidth);
    }

    _processTabPartOfLine(event, textArea) {
        let beforeSelectionText = StringLiterals.EMPTY_STRING;

        if (textArea.selectionStart > 0) {
            beforeSelectionText = textArea.value.slice(0, textArea.selectionStart);
        }

        let afterSelectionText = StringLiterals.EMPTY_STRING;

        if (textArea.selectionEnd < textArea.value.length) {
            afterSelectionText = textArea.value.slice(textArea.selectionEnd);
        }

        if (!event.shiftKey) {
            textArea.value = `${beforeSelectionText}${this._spacesPerTab}${afterSelectionText}`;
            textArea.setSelectionRange(beforeSelectionText.length + this._spacesPerTab.length, beforeSelectionText.length + this._spacesPerTab.length);
        } else {
            if (beforeSelectionText.slice(-this._spacesPerTab.length) === this._spacesPerTab) {
                beforeSelectionText = beforeSelectionText.slice(0, beforeSelectionText.length - this._spacesPerTab.length);

                textArea.value = `${beforeSelectionText}${afterSelectionText}`;
                textArea.setSelectionRange(beforeSelectionText.length, beforeSelectionText.length);
            }
        }
    }

    _processTabLines(event, textArea) {
        let beforeSelectionText = StringLiterals.EMPTY_STRING;
        let selectionText = StringLiterals.EMPTY_STRING;
        let afterSelectionText = StringLiterals.EMPTY_STRING;
        const selectionTextLines = [];

        textArea.value.split('\n').forEach(line => {
            const lineWithNewline = `${line}${StringLiterals.NEWLINE}`;

            const textLengthIncludingCurrentLine = beforeSelectionText.length + selectionText.length +
                afterSelectionText.length + lineWithNewline.length;

            if (textLengthIncludingCurrentLine <= textArea.selectionStart) {
                beforeSelectionText = `${beforeSelectionText}${lineWithNewline}`;
            } else if (selectionText.length === 0 || textLengthIncludingCurrentLine <= textArea.selectionEnd) {
                selectionTextLines.push(lineWithNewline);

                selectionText = `${selectionText}${lineWithNewline}`;
            } else {
                afterSelectionText = `${afterSelectionText}${lineWithNewline}`;
            }
        });

        selectionText = StringLiterals.EMPTY_STRING;

        selectionTextLines.forEach(lineWithNewline => {
            if (!event.shiftKey) {
                selectionText = `${selectionText}${this._spacesPerTab}${lineWithNewline}`;
            } else {
                const regexPattern = `^${this._spacesPerTab}`;
                const regex = new RegExp(regexPattern);

                lineWithNewline = lineWithNewline.replace(regex, StringLiterals.EMPTY_STRING);
                selectionText = `${selectionText}${lineWithNewline}`;
            }
        });

        const emptySelection = textArea.selectionEnd === textArea.selectionStart;
        const selectionEnd = !emptySelection ? beforeSelectionText.length + selectionText.length : beforeSelectionText.length;

        textArea.value = `${beforeSelectionText}${selectionText}${afterSelectionText}`;
        textArea.setSelectionRange(beforeSelectionText.length, selectionEnd);
    }

    process(textArea) {
        textArea.addEventListener(StringLiterals.KEYDOWN, (event) => {
            if (event.key === StringLiterals.TAB) {
                const initialSelectedText = textArea.value.slice(textArea.selectionStart, textArea.selectionEnd);

                if (!initialSelectedText.includes(StringLiterals.NEWLINE)) {
                    this._processTabPartOfLine(event, textArea);
                } else {
                    this._processTabLines(event, textArea);
                }

                event.preventDefault();
            }
        });
    }
};
