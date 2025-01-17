'use babel';

// Copyright 2018 Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
//
// This file is part of TerosHDL.
//
// TerosHDL is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TerosHDL is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with TerosHDL.  If not, see <https://www.gnu.org/licenses/>.

import fs from 'fs';
import path from 'path';
import { getTests } from './vunit';
import { runTestArgsI} from './run-args'

var tableTitle
var testsName = []
var buttons = []

export class testsView {
  constructor(runpy) {
    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/run-args-tests.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.tests').cloneNode(true);

    dir        = path.dirname(runpy)
    file       = path.basename(runpy)

    //Exports
    var exp       = ""
    var more      = ""
    var folderSep = ""
    var os = require('os');
    if (os.platform == "win32"){
      exp  = "SET "
      more = "&&"
      folderSep = "\\"
    }
    else{
      exp  = "export "
      more = ";"
      folderSep = "/"
    }
    //
    var checkPath = "";
    if (atom.config.get('TerosHDL.general.simulator') == "ghdl"){
      const fs = require('fs');
      checkPath = atom.config.get('TerosHDL.ghdl.ghdl-path') + folderSep + "ghdl"
      if (fs.existsSync(checkPath)) {
        console.log("ghdl ok");
      }
      else{
        atom.notifications.addWarning("Please, configure correctlyyour ghdl path.");
        return;
      }
    }
    if (atom.config.get('TerosHDL.general.simulator') == "modelsim"){
      const fs = require('fs');
      checkPath = atom.config.get('TerosHDL.modelsim.modelsim-ini')
      if (fs.existsSync(checkPath)) {
        console.log("modelsim-ini ok");
      }
      else{
        atom.notifications.addWarning("Please, configure correctly your modelsim-ini path.");
        return;
      }
    }
    if (atom.config.get('TerosHDL.general.simulator') == "modelsim"){
      const fs = require('fs');
      if (os.platform == "win32"){
        checkPath = atom.config.get('TerosHDL.modelsim.modelsim-path')
      }
      else{
        checkPath = atom.config.get('TerosHDL.modelsim.modelsim-path')
      }
      if (fs.existsSync(checkPath)) {
        console.log("modelsim ok");
      }
      else{
        atom.notifications.addWarning("Please, configure correctly your modelsim path.");
        return;
      }
    }

    var modelsim_path = exp + " VUNIT_MODELSIM_PATH=" + atom.config.get('TerosHDL.modelsim.modelsim-path')
    var modelsim_ini  = exp + " VUNIT_MODELSIM_INI="  + atom.config.get('TerosHDL.modelsim.modelsim-ini')
    var simulator = exp + " VUNIT_SIMULATOR=" + atom.config.get('TerosHDL.general.simulator')
    var ghdlPath  = exp + "VUNIT_GHDL_PATH=" + atom.config.get('TerosHDL.ghdl.ghdl-path')
    var shell = require('shelljs');
    var command = modelsim_path + more + modelsim_ini + more + simulator + more + ghdlPath + more + " cd " + dir + more + " python " + file + " --export-json export.json "

    ////////////////////////////////////////////////////////////////////////////
    // Find important nodes
    this.applyButton  = this.element.querySelector('.controls .do-init');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    var table = this.element.querySelector('.table');
    var load = this.element.querySelector('.load');
    ////////////////////////////////////////////////////////////////////////////
    testsName = []
    load.style.display = 'block';
    var child = shell.exec(command, {async:true}, function(code, stdout, stderr) {
      load.style.display = 'none';
      ////////////////////////////////////////////////////////////////////////////
      tableTitle = table.insertRow(0);
      tableTitle.style.background = "#ffb366"
      nameCell = tableTitle.insertCell(0).innerHTML = "Name"
      selectCell = tableTitle.insertCell(1).innerHTML = "Select"
      tableTitle.style.background =  "#004d00"
      tableTitle.style.fontWeight = "bold"
      ////////////////////////////////////////////////////////////////////////////
      allRow = table.insertRow(1);
      allRow.insertCell(0).innerHTML = "All tests"
      let btnAll = doc.createElement("input");
      btnAll.className = "input-toggle inline-block-tight"
      btnAll.type = "checkbox"
      allRow.insertCell(1).appendChild(btnAll);
      ////////////////////////////////////////////////////////////////////////////
      noneRow = table.insertRow(2);
      noneRow.insertCell(0).innerHTML = "None"
      let btnNone = doc.createElement("input");
      btnNone.className = "input-toggle inline-block-tight"
      btnNone.type = "checkbox"
      noneRow.insertCell(1).appendChild(btnNone);
      ////////////////////////////////////////////////////////////////////////////
      if ( code==0 && fs.existsSync(dir+folderSep+"export.json") ){
        tests = getTests(dir+folderSep+"export.json")
        cellsTestsTable = []
        buttons = []
        for (var i=0;i<tests.length;++i){
          testsName.push(tests[i].name)
          cellsTestsTable.push(table.insertRow(i+3))
          let cell = cellsTestsTable[i].insertCell(0)
          cell.innerHTML = tests[i].name
          cell.style.padding = "1% 5% 1%"
          let btnTxt = doc.createElement("input");
          btnTxt.className = "input-toggle inline-block-tight"
          btnTxt.type = "checkbox"
          buttons.push(btnTxt)
          cellsTestsTable[i].insertCell(1).appendChild(btnTxt);
        }
        fs.unlink(dir+folderSep+"export.json")
      }
      else{
        allRow.deleteCell(0)
        allRow.deleteCell(0)
        tableTitle.deleteCell(0)
        tableTitle.deleteCell(0)
        tableTitle.style.background =  "#990000"
        tableTitle.insertCell(0).innerHTML = "Error: please, select a correct run.py file."
      }
      btnAll.onclick = function () {
        if (this.checked == true){
          for (var i = 0;i<buttons.length;++i){
            buttons[i].checked = true
            buttons[i].disabled = true
          }
        }
        else{
          for (var i = 0;i<buttons.length;++i){
            buttons[i].disabled = false
          }
        }
      };

      btnNone.onclick = function () {
        if (this.checked == true){
          for (var i = 0;i<buttons.length;++i){
            btnAll.checked = false
            btnAll.disabled = true
            buttons[i].checked = false
            buttons[i].disabled = true
          }
        }
        else{
          for (var i = 0;i<buttons.length;++i){
            buttons[i].disabled = false
            btnAll.disabled = false
          }
        }
      };
    });


    //-- Initialize button
    this.applyButton.onclick = () => {
      this.handleInit();
    };
    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();

  } //-- End constructor

  handleInit() {}
  handleCancel() {}
  getElement() {
    return this.element;
  }
  destroy() {
    this.element.remove();
  }
} //-- End class


export function configTests() {
  //-- Open the new project panel
  var view = new testsView(atom.config.get('TerosHDL.others.sim-runpy-new'));
  var panel = atom.workspace.addModalPanel({item: view.getElement()});
  //------------------- Set buttons handlers
  //-- Cancel button pressed: finish
  view.handleCancel = () => {
    panel.destroy();
    runTestArgsI(false)
  }
  //-- Initialize button pressed: both board and project folder has been
  //-- selected
  view.handleInit = () => {
    var names = ""
    for (var i=0; i<testsName.length; ++i) {
      if(buttons[i].checked==true){
        names += testsName[i] + " "
      }
    }
    atom.config.set('TerosHDL.others.sim-tests-new', names)

    panel.destroy();
    runTestArgsI(false)
  };

} //-- Init project
