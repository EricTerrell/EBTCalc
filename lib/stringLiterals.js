/*
  EBTCalc
  (C) Copyright 2021, Eric Bergman-Terrell

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

module.exports = class StringLiterals {
    // Misc
    static get EMPTY_STRING() { return ''; }
    static get ENCODING() { return 'utf8'; }
    static get DATA() { return 'data'; }
    static get BIG_NUMBER() { return 'BigNumber'; }
    static get USER_LOG_MESSAGE_DELIMITER() { return '___USER_CODE_PREFIX___'; }

    static get ERROR_DELIMITER() { return '___ERROR___'; }

    static get NEWLINE() { return '\n'; }

    static get USER_SOURCE_CODE() { return 'sourceCode.js'; }
    static get PREDEFINED_SOURCE_CODE() { return 'predefinedSourceCode.js'; }

    static get LICENSE_TERMS() { return 'licenseTerms.json'; }

    static get SETTINGS_FILENAME() { return 'settings.json'; }
    static get STACK_FILENAME() { return 'stack.json'; }
    static get VARIABLES_FILENAME() { return 'variables.json'; }

    static get REGEX_GLOBAL_FLAG() { return 'g'; }

    static get UPDATE_SOURCE_CODE() { return 'update-source-code'; }
    static get SETTINGS_CHANGED() { return 'settings-changed'; }

    static get UNDEFINED() { return 'undefined'; }

    static get DECIMAL_POINT() { return '.'; }
    static get DEFAULT_THOUSANDS_SEPARATOR() { return ','; }
    static get SPACE() { return ' '; };

    static get MESSAGE() { return 'message'; }

    static get DROP_DOWN_SELECT_TEXT() { return '(Select)'; }
    static get DROP_DOWN_SELECT_VALUE() { return '---select---'; }

    static get NOT_EQUAL() { return '___NOT_EQUAL___'; }

    static get MESSAGE_BOX_ERROR_TYPE() { return 'error'; }

    // Menus
    static get MENU_CUT() { return 'Cut'; }
    static get MENU_COPY() { return 'Copy'; }
    static get MENU_PASTE() { return 'Paste'; }
    static get MENU_SEPARATOR() { return 'separator'; }
    static get MENU_SELECT_ALL() { return 'Select All'; }
    static get MENU_UNDO() { return 'Undo'; }

    // Dialog Boxes
    static get DIALOG_QUESTION() { return 'question'; }
    static get DIALOG_ERROR() { return 'error'; }
    static get DIALOG_INFO() { return 'info'; }

    // keydown/keyup character values
    static get TAB() { return 'Tab'; }
    static get ESCAPE() { return 'Escape'; }
    static get ENTER() { return 'Enter'; }

    // Parser
    static get PARSER_FUNCTION_DECLARATION() { return 'FunctionDeclaration' }
    static get PARSER_CLASS_DECLARATION() { return 'ClassDeclaration'; }
    static get PARSER_METHOD_DEFINITION() { return 'MethodDefinition'; }
    static get PARSER_IDENTIFIER() { return 'Identifier'; }
    static get PARSER_ASSIGNMENT_PATTERN() { return 'AssignmentPattern'; }
    static get PARSER_REST_ELEMENT() { return 'RestElement'; }

    // HTML Elements
    static get LI() { return 'LI'; }
    static get BUTTON() { return 'BUTTON'; }
    static get INPUT() { return 'input'; }
    static get TABLE_CELL() { return 'td'; }
    static get PRE() { return 'pre'; }
    static get HTML_PRE_ELEMENT() { return 'HTMLPreElement'; }

    // HTML Attributes
    static get VALUE() { return 'value'; }
    static get TYPE() { return 'type'; }
    static get TITLE() { return 'title'; }
    static get OPTION() { return 'option'; }
    static get CLASS() { return 'class'; }
    static get HREF() { return 'href'; }

    // HTML Element Events
    static get CLICK() { return 'click'; }
    static get KEYDOWN() { return 'keydown'; }
    static get KEYUP() { return 'keyup'; }
    static get MOUSEDOWN() { return 'mousedown'; }
    static get MOUSEUP() { return 'mouseup'; }
    static get CHANGE() { return 'change'; }
    static get INPUT_EVENT() { return 'input'; }
    static get CLOSE() { return 'close'; }
    static get CLOSED() { return 'closed'; }
    static get READY() { return 'ready'; }
    static get WINDOW_ALL_CLOSED() { return 'window-all-closed'; }
    static get ACTIVATE() { return 'activate'; }
    static get CONTEXTMENU() { return 'contextmenu'; }

    // HTML Attributes
    static get CHECKED() { return 'checked'; }

    // CSS Classes
    static get CUSTOM_BUTTON() { return 'custom-button'; }
    static get SELECT_CATEGORY() { return 'select-category'; }
    static get TOP_LINE() { return 'top-line'; }
    static get FUNCTION_TABLE_ROW() { return 'function-table-row'; }
    static get CUSTOM_BUTTON_TABLE_CELL() { return 'custom-button-table-cell'; }
    static get STACK_ITEM() { return 'stack-item'; }

    // CSS Styles
    static get INLINE() { return 'inline'; }

    // Window events
    static get DID_FINISH_LOAD() { return 'did-finish-load'; }
    static get DESTROYED() { return 'destroyed'; }
    static get RESIZE() { return 'resize'; }
    static get MOVE() { return 'move'; }
    static get SECOND_INSTANCE() { return 'second-instance'; }

    // Channels
    static get VARIABLE_WINDOW_CHANNEL() { return 'variable-window-channel'; }
    static get MAIN_WINDOW_CHANNEL() { return 'main-window-channel'; }
    static get CHILD_WINDOW_CHANNEL() { return 'child-window-channel'; }
    static get NOTIFY_SETTINGS_CHANGED() { return 'notifySettingsChanged'; }
    static get NOTIFY_SOURCE_CODE_CHANGED() { return 'notifySourceCodeChanged'; }
    static get CHECK_FOR_UPDATES() { return 'check-for-updates'; }
    static get REJECT_LICENSE_TERMS() { return 'reject-license-terms'; }
    static get ACCEPT_LICENSE_TERMS() { return 'accept-license-terms'; }

    // Platforms
    static get DARWIN() { return 'darwin'; }

    // Application Paths
    static get USERDATA() { return 'userData'; }

    // Characters
    static get NON_BREAKING_SPACE() { return '\xa0'; }
};
