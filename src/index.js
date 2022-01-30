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

const remote = require('@electron/remote');
const ipc = require('electron').ipcRenderer;
const serializerDeserializer = require('./lib/serializerDeserializer');
const StringLiterals = require('./lib/stringLiterals');
const Constants = require('./lib/constants');

const WindowUtils = require('./lib/windowUtils');
const Files = require('./lib/files');
const Settings = require('./lib/settings');
const BigNumberUtils = require('./lib/bigNumberUtils');
const AppInfo = require('./lib/appInfo');

const VersionChecker = require('./lib/versionChecker');

const ValueFormatter = require('./lib/valueFormatter');
const valueFormatter = new ValueFormatter();

const ErrorText = require('./lib/errorText');
const errorText = new ErrorText();

const TopLine = require('./lib/topLine');
const Stack = require('./lib/stack');

const topLine = new TopLine(valueFormatter, errorText, enableDisableButtons.bind(this));
const stack = new Stack(valueFormatter, enableDisableButtons.bind(this));

topLine.stack = stack;
stack.topLine = topLine;

let variables = serializerDeserializer.serialize(new Map());
let variableNames = [];

const FunctionExecutor = require('./lib/functionExecutor');
const functionExecutor = new FunctionExecutor(topLine, stack, errorText, valueFormatter, variables, variableNames,
    displayLogMessage.bind(this), graph.bind(this),
    enableDisableButtons.bind(this));

const Category = require('./lib/category');
const category = new Category(functionExecutor, topLine, enableDisableButtons.bind(this));

const BuiltInFunctions = require('./lib/builtInFunctions');
const builtInFunctions = new BuiltInFunctions(stack, topLine, valueFormatter, errorText, variableNames, functionExecutor, enableDisableButtons.bind(this));

const editButton = document.querySelector('#edit');
const settingsButton = document.querySelector('#settings');
const logButton = document.querySelector('#log');

let logWindow, graphWindow;

BigNumberUtils.configure();

wireUpUI();

function wireUpUI() {
    require('electron').ipcRenderer.on(StringLiterals.SETTINGS_CHANGED, () => {
        console.info('index.js: settings changed');

        BigNumberUtils.configure();

        stack.formatValues();
    });

    document.querySelector("#title").innerText = AppInfo.getInfo.name;

    builtInFunctions.wireUpButtons();

    category.renderCustomButtonUI();

    editButton.addEventListener(StringLiterals.CLICK, () => {
        editButton.disabled = true;

        const editWindow = WindowUtils.createWindow('edit', () => {editButton.disabled = false});

        // https://github.com/electron/remote/pull/72#issuecomment-924933800
        remote.require("@electron/remote/main").enable(editWindow.webContents)
    });

    settingsButton.addEventListener(StringLiterals.CLICK, () => {
        settingsButton.disabled = true;

        Settings.launchSettingsUI(() => {
            stack.formatValues();

            settingsButton.disabled = false;
        })
    });

    logButton.addEventListener(StringLiterals.CLICK, () => {
        logButton.disabled = true;

        const onDestroyedCallback = function() {
            logButton.disabled = false;
            logWindow = null;
        };

        logWindow = WindowUtils.createWindow('log', onDestroyedCallback);
    });

    this.window.onbeforeunload = (event) => {
        saveData();

        delete event['returnValue'];
    };

    addMinMaxDataToPredefinedButtons();

    loadData();

    enableDisableButtons(stack.stackSize());

    const licenseTermsData = Files.getLicenseTerms();

    if (!licenseTermsData.userAccepted) {
        const licenseTermsWindow = WindowUtils.createWindow('license_terms');

        // https://github.com/electron/remote/pull/72#issuecomment-924933800
        remote.require("@electron/remote/main").enable(licenseTermsWindow.webContents)
    } else if (Files.getSettings().checkForUpdates) {
        if (needToCheckVersion()) {
            VersionChecker.checkVersion();
        }
    }
}

function addMinMaxDataToPredefinedButtons() {
    const minMaxInfo = [
        {buttonId: 'drop', minParameters: 1},
        {buttonId: 'swap', minParameters: 2},
        {buttonId: 'clear_entry', topLineNonBlank: true},
        {buttonId: 'clear_all', minParameters: 1},
        {buttonId: 'square_root', minParameters: 1},
        {buttonId: 'change_sign', minParameters: 1},
        {buttonId: 'fix', minParameters: 1},
        {buttonId: 'float', minParameters: 0},
        {buttonId: 'scientific_notation', minParameters: 2},
        {buttonId: 'reciprocal', minParameters: 1},
        {buttonId: 'string', minParameters: 0},
        {buttonId: 'factorial', minParameters: 1},
        {buttonId: 'array_to_stack', minParameters: 1},
        {buttonId: 'stack_to_array', minParameters: 1},
        {buttonId: 'top_x_values_to_array', minParameters: 2},
        {buttonId: 'store_variable', minParameters: 1},
        {buttonId: 'load_variable', minParameters: 0, minVariables: 1},
        {buttonId: 'delete_variable', minParameters: 0, minVariables: 1},
        {buttonId: 'delete_all_variables', minParameters: 0, minVariables: 1}
    ];

    minMaxInfo.forEach((element) => {
        document.querySelector(`#${element.buttonId}`).___requiredParameterInfo = {
            minParameters: element.minParameters,
            topLineNonBlank: element.topLineNonBlank,
            maxParameters: Infinity,
            minVariables: element.minVariables
        }
    });
}

function saveData() {
    try {
        Files.saveStack(stack.getStackData());
        Files.saveVariables(functionExecutor.variables);
    } catch(error) {
        console.info(`saveData: error: ${error}`);
    }
}

function loadData() {
    try {
        const stackData = Files.loadStack();
        topLine.value = stackData.topLine;
        valueFormatter.options = stackData.options;

        stackData.stackItems.forEach(item => {
            stack.pushValue(item.serializedValue.displayText, item.serializedValue);
        });

        stack.formatValues();

        const variables = Files.loadVariables();
        const deserializedVariables = serializerDeserializer.deserialize(variables);
        variableNames = Array.from(deserializedVariables.keys());

        functionExecutor.variables = variables;
        functionExecutor.variableNames = variableNames;

        builtInFunctions.variableNames = variableNames;
    } catch (error) {
        console.error(error);
    }
}

function enableDisableButtons() {
    // If there is something in the top line, we count it as a stack item, since it will be automatically pushed.
    let stackSize = stack.stackSize() + (topLine.value.trim().length > 0 ? 1 : 0);

    enableDisableOperationButtons(stackSize);
    enableDisableBackspace();

    console.info(`index.js enableDisableFunctionButtons stackSize=${stackSize} variables: ${JSON.stringify(variableNames)} topLine: '${topLine.value}' topLine length: ${topLine.value.length}`);

    const customButtons = document.querySelectorAll(`.${StringLiterals.CUSTOM_BUTTON}`);
    const builtInButtons = document.querySelectorAll(`.predefined-wide-button`);

    Array.from(customButtons).concat(Array.from(builtInButtons)).forEach(button => {
        if (button.___requiredParameterInfo) {
            if (button.___requiredParameterInfo.topLineNonBlank) {

                button.disabled = topLine.value.length === 0;
            } else {
                button.disabled = button.___requiredParameterInfo.minParameters > stackSize;

                if (button.___requiredParameterInfo.minVariables && button.___requiredParameterInfo.minVariables > variableNames.length) {
                    console.log(`disabling button ${button.id}`);
                    button.disabled = true;
                }
            }
        }
    });

    document.querySelector('#mode_indicator').innerText = `Mode: ${getModeString()}`;
}

function getModeString() {
    return valueFormatter.isInFloatMode() ? 'FLOAT' : 'FIX';
}

function enableDisableOperationButtons(stackSize) {
    const binaryButtonInfo = ['divide', 'multiply', 'add', 'subtract', 'raise'];

    binaryButtonInfo.forEach(element => {
        const button = document.querySelector('#' + element);

        button.disabled = stackSize < 2;
    });

    const unaryButtonInfo = ['percent', 'square'];

    unaryButtonInfo.forEach(element => {
        const button = document.querySelector('#' + element);

        button.disabled = stackSize < 1;
    })
}

function enableDisableBackspace() {
    const backspaceButton = document.querySelector('#backspace');

    backspaceButton.disabled = topLine.value.length === 0;
}

function displayLogMessage(message) {
    if (logWindow) {
        logWindow.webContents.send('log-message', message.toString());
    }
}

function graph(whatToGraph) {
    if (!graphWindow || graphWindow.isDestroyed()) {
        graphWindow = WindowUtils.createWindow('graph');
    }

    const numericalWindowId = graphWindow.id;

    graphWindow.webContents.once(StringLiterals.DID_FINISH_LOAD, () => {
        console.info(`sending ${whatToGraph} to graph window`);
        ipc.sendTo(numericalWindowId, StringLiterals.CHILD_WINDOW_CHANNEL, whatToGraph);
    });
}

function needToCheckVersion() {
    const settings = Files.getSettings();

    console.info(`needToCheckVersion: settings: ${JSON.stringify(settings)}`);

    const lastVersionCheck = new Date(settings.lastVersionCheck).getTime();
    const now = new Date().getTime();

    const elapsedTimeDays = (now - lastVersionCheck) / (1000 * 60 * 60 * 24);

    const result = elapsedTimeDays >= Constants.VERSION_CHECK_INTERVAL_DAYS;

    console.info(`needToCheckVersion: lastVersionCheck: ${lastVersionCheck} now: ${now} elapsedTimeDays: ${elapsedTimeDays} result: ${result}`);

    return result;
}