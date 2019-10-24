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

const StringLiterals = require('./lib/stringLiterals');

const logMessagesText = document.querySelector('#log_messages_text');

require('electron').ipcRenderer.on('log-message', (event, message) => {
    let index = message.toString().indexOf(StringLiterals.USER_LOG_MESSAGE_DELIMITER);

    if (index !== -1) {
        message = message.toString().slice(index + StringLiterals.USER_LOG_MESSAGE_DELIMITER.length);

        index = message.indexOf(StringLiterals.USER_LOG_MESSAGE_DELIMITER);

        if (index !== -1) {
            message = message.slice(0, index);
        }

        if (logMessagesText.innerText) {
            logMessagesText.innerText += StringLiterals.NEWLINE;
        }

        logMessagesText.innerText = `${logMessagesText.innerText}${message}`;

        logMessagesText.scrollTop = logMessagesText.scrollHeight;
    }
});

document.querySelector('#close').addEventListener(StringLiterals.CLICK, () => {
    window.close();
});

document.querySelector('#clear').addEventListener(StringLiterals.CLICK, () => {
    logMessagesText.innerText = StringLiterals.EMPTY_STRING;
});

document.addEventListener(StringLiterals.KEYDOWN, (event) => {
    if (event.key === StringLiterals.ESCAPE) {
        window.close();
    }
});
