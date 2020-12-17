import * as Blockly from 'blockly';
// import { CodeJar } from 'CodeJar';
// import { withLineNumbers } from 'codejar/linenumbers';
import { withLineNumbers } from './linenumbers.js';
import { initBlocks, functions, functionCodes } from './blocks.js';
import {ContinuousToolbox} from '../continuous-toolbox/src/ContinuousToolbox';
import {ContinuousFlyout} from '../continuous-toolbox/src/ContinuousFlyout';
import './procedures.js';
import html2canvas from 'html2canvas';

function genPhoto() {
  html2canvas(document.body, {logging: false}).then(function(canvas) {
      document.body.appendChild(canvas);
  });
}

var isDark = false;
var isFirst = true;
var code = null;
let workspace;

function createWorkspace(blocklyDiv, options) {
  workspace = Blockly.inject(blocklyDiv, options);
  workspace.addChangeListener(function(event) {
    if (localStorage.getItem('mode') == 'block') {
      runCode();
    }
  });
  return workspace;
}

export { Blockly };

import './genCode.js';
import { DarkTheme, LightTheme } from './themes.js';
import './toolbox.js'

function injectBlockly() {
  var xml;
  if (!isFirst) {
    xml = Blockly.Xml.workspaceToDom(workspace);
  }
  const options = {
    toolbox: document.getElementById('toolbox'),
    theme: isDark? DarkTheme : LightTheme,
    renderer: 'zelos',
    collapse : true,
    comments : false,
    disable : true,
    maxBlocks : Infinity,
    trashcan : true,
    css : true,
    // media : 'http://localhost:3000',
    rtl : false,
    scrollbars : true,
    sounds : false,
    oneBasedIndex : true,
    grid : {
      spacing : 20,
      length : 2,
      colour : isDark? 'rgba(255, 255, 255, 0.12)':'rgba(150, 150, 150, 0.2)',
      snap : true
    },
    zoom : {
      controls : true,
      wheel : true,
      startScale : 1,
      maxScale : 2,
      minScale : 0.5,
      scaleSpeed : 1.2,
      controls: true,
    },
    scrollbars: true,
    move: {
        drag: true,
        wheel: true
    }
  };
  let element = document.getElementById('style');
  if (element != null) element.remove();
  let sheet = document.createElement('style');
  sheet.setAttribute('id', 'style');
  if(window.innerHeight > window.innerWidth){
    options['horizontalLayout'] = true;
    options['toolboxPosition'] = 'end';
    sheet.innerHTML = ".blocklyTreeRowContentContainer{padding: 5px !important;}";
  } else {
    options['plugins'] = {
      'toolbox': ContinuousToolbox,
      'flyoutsVerticalToolbox': ContinuousFlyout,
    }
    sheet.innerHTML = "";
  }
  document.body.appendChild(sheet);
  createWorkspace(document.getElementById('root'), options);
  if (isFirst) {
    isFirst = false;
    try {
      const xml = Blockly.Xml.textToDom(sessionStorage.getItem("blocks"));
      Blockly.Xml.domToWorkspace(xml, workspace);
    } catch (e) {}
  } else {
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
}

window.onresize = function(event) {
  changeViewWithoutSwap();
  changeViewWithoutSwap();
}

document.addEventListener('DOMContentLoaded', function() {
  initBlocks();
  Blockly.Msg["MATH_POWER_SYMBOL"] = "**";
  injectBlockly();
});

function runCode() {
  code = Blockly.genCode.workspaceToCode(workspace);
  // jar.updateCode(code);
  localStorage.setItem('code', code);
  if (localStorage.getItem("mode") == "code") {
    // document.getElementById("callColor").click();
  }
}

window.onbeforeunload = function (e) {
  localStorage.setItem('allVariables', allVariables);
  const xml = Blockly.Xml.workspaceToDom(workspace);
  sessionStorage.setItem("blocks", Blockly.Xml.domToPrettyText(xml));
};

allVariables = localStorage.getItem('allVariables');
var tmp = []
let data = allVariables.split(',')
allVariables = []
for (var i of data) {
  tmp.push(i);
  if (tmp.length == 2) {
    allVariables.push(tmp)
    tmp = []
  }
}

const highlight = (editor) => {
  if (localStorage.getItem("mode") == "code") {
    // document.getElementById("callColor").click();
  }
}
// let jar = CodeJar(document.querySelector('#editor'), withLineNumbers(highlight));
if (localStorage.getItem('code') == null) localStorage.setItem('code', '');

var langTools = ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai0");
editor.session.setMode("ace/mode/javascript");
editor.setHighlightActiveLine(false);
editor.renderer.setShowGutter(true);
editor.getSession().setUseWorker(false);
editor.session.setTabSize(2);
editor.renderer.setAnimatedScroll(true);
editor.setFontSize(18);
editor.setShowPrintMargin(false);
editor.setOptions({
    enableSnippets: true,
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
    copyWithEmptySelection: true,
    cursorStyle: 'smooth',
    fadeFoldWidgets: true
});

langTools.setCompleters([langTools.snippetCompleter])

var config = ace.require("ace/config");
var event = ace.require("ace/lib/event");
event.addListener(editor.container, "dragover", function(e) {
    var types = e.dataTransfer.types;
    if (types && Array.prototype.indexOf.call(types, 'Files') !== -1)
        return event.preventDefault(e);
});

event.addListener(editor.container, "drop", function(e) {
    var file;
    try {
        file = e.dataTransfer.files[0];
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = function() {
                // var mode = modelist.getModeForPath(file.name);
                editor.session.doc.setValue(reader.result);
                // editor.session.setMode(mode.mode);
                // editor.session.modeName = mode.name;
            };
            reader.readAsText(file);
        }
        return event.preventDefault(e);
    } catch(err) {
        return event.stopEvent(e);
    }
});

editor.setKeyboardHandler('ace/keyboard/sublime')
editor.commands.addCommands([{
//     name: "showKeyboardShortcuts",
//     bindKey: {win: "Ctrl-Alt-h", mac: "Command-Alt-h"},
//     exec: function(editor) {
//         config.loadModule("ace/ext/keybinding_menu", function(module) {
//             module.init(editor);
//             editor.showKeyboardShortcuts();
//         });
//     }
// }, {
    name: "increaseFontSize",
    bindKey: "Ctrl-=|Ctrl-+",
    exec: function(editor) {
        var size = parseInt(editor.getFontSize(), 10) || 18;
        editor.setFontSize(size + 1);
    }
}, {
    name: "decreaseFontSize",
    bindKey: "Ctrl+-|Ctrl-_",
    exec: function(editor) {
        var size = parseInt(editor.getFontSize(), 10) || 18;
        editor.setFontSize(Math.max(size - 1 || 1));
    }
}, {
    name: "resetFontSize",
    bindKey: "Ctrl+0|Ctrl-Numpad0",
    exec: function(editor) {
        editor.setFontSize(18);
    }
}]);
editor.commands.removeCommands(['showSettingsMenu', 'goToNextError', 'goToPreviousError',
                                'centerselection', 'fold', 'unfold', 'toggleFoldWidget',
                                'toggleParentFoldWidget', 'foldall', 'foldAllComments',
                                'foldOther', 'unfoldall', 'overwrite'])

editor.session.setValue(localStorage.getItem('code'));
editor.session.on('change', function(delta) {
  localStorage.setItem('code', editor.getValue());
  document.getElementById("genBlocks").click();
});

function changeThemeWithoutSwap() {
  // if (isDark) document.getElementsByClassName('codejar-linenumbers')[0].style.color = 'white';
  // else document.getElementsByClassName('codejar-linenumbers')[0].style.color = 'gray';
  if (isDark) editor.setTheme("ace/theme/monokai0");
  else editor.setTheme("ace/theme/xcode0");
  document.getElementById("editor").classList.toggle('dark');
  document.getElementById("console").classList.toggle('dark');
  document.getElementById("console2").classList.toggle('dark');
  isDark = !isDark;
}

function changeTheme() {
  changeThemeWithoutSwap();
  var tmp = localStorage.getItem('theme');
  if (tmp == "light")
      localStorage.setItem('theme', 'dark');
  else
      localStorage.setItem('theme', 'light');
}

// jar.updateCode(localStorage.getItem('code'))
// jar.onUpdate(code => {
  // localStorage.setItem('code', code)
// });

if (!(localStorage.getItem('mode') == "block" || localStorage.getItem('mode') == "code")) {
  localStorage.setItem('mode', "code");
}
if (localStorage.getItem('mode') == "block") {
  changeViewWithoutSwap();
}
if (!(localStorage.getItem('theme') == "dark" || localStorage.getItem('theme') == "light")) {
  localStorage.setItem('theme', "dark");
}
if (localStorage.getItem('theme') == "light") {
  changeThemeWithoutSwap();
}

function changeViewWithoutSwap() {
  try {
    document.getElementById("editor2").hidden = !document.getElementById("editor2").hidden;
    document.getElementById("root").hidden = !document.getElementById("root").hidden;
    if (isDark) editor.setTheme("ace/theme/monokai0");
    else editor.setTheme("ace/theme/xcode0");
    isDark = !isDark;
    document.getElementById('root').removeChild(Blockly.getMainWorkspace().injectionDiv_);
    injectBlockly();
    // document.getElementById("callColor").click();
    document.getElementById("genBlocks").click();
  } catch(e) {}
  document.getElementById("gotocode").classList.toggle('selected');
  document.getElementById("gotoblock").classList.toggle('selected');
  if (!document.getElementById("editor2").hidden && code != null) {
    editor.setValue(code);
    code = null;
    editor.session.selection.moveTo(0, 0);
  }
}

function changeView() {
  changeViewWithoutSwap();
  var tmp = localStorage.getItem('mode');
  if (tmp == "code")
      localStorage.setItem('mode', 'block');
  else
      localStorage.setItem('mode', 'code');
  workspace.trashcan.emptyContents();
  Blockly.getMainWorkspace().cleanUp();
}

if (localStorage.getItem('theme') == 'dark') document.getElementById('theme').checked = true;
else document.getElementById('theme').checked = false;

export { workspace, changeTheme, changeView, genPhoto, injectBlockly, runCode, editor };
