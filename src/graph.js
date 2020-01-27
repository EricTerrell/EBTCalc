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

const StringLiterals = require('./lib/stringLiterals');
const Chart = require('chart.js');
const ipc = require('electron').ipcRenderer;

const graph = document.querySelector('#graph');

ipc.on(StringLiterals.CHILD_WINDOW_CHANNEL, (event, whatToGraph) => {
    console.log(`graph.js ipc.on ${whatToGraph}`);

    renderGraph(JSON.parse(whatToGraph));
});

wireUpUI();

function wireUpUI() {
    document.querySelector('#close').addEventListener(StringLiterals.CLICK, () => {
        window.close();
    });

    document.addEventListener(StringLiterals.KEYDOWN, (event) => {
        if (event.key === StringLiterals.ESCAPE) {
            window.close();
        }
    });
}

function renderGraph(whatToGraph) {
    const ctx = graph.getContext('2d');

    const chart = new Chart(ctx, {
        // The type of chart we want to create
        type: whatToGraph.type,

        // The data for our dataset
        data: whatToGraph.data,

        // Configuration options go here
        options: whatToGraph.options
    });
}