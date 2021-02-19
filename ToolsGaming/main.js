/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


pg = require("PhysicsGaming");
fs = require('fs');

var loadWorld = function(jsonFile) {
  // Need to add JSON loading - for now just builds simple world

  var contents = fs.readFileSync(jsonFile);
  var worldobj = JSON.parse(contents);
  var pgw = pg.loadFromDict(worldobj);
  return pgw;
};

var saveWorld = function(pgw, fileName) {
  var jsonObj = pgw.toDict();
  var jsonStr = JSON.stringify(jsonObj);
  fs.writeFileSync(fileName, jsonStr);
};


// First experiment function : tool picker
var toolPickerGetTools = function(toolDict) {
  var tools = [];
  for (var k in toolDict) {
    tools.push(k);
  }
  return tools;
};

var toolPickerGetDims = function(jsonFile) {
  var pgw = loadWorld(jsonFile);
  return pgw.dims;
};


var getGoalObjects = function(pgw) {
  var objects = pgw.objects;
  var goal_objects = [];
  var i = 0;
  for (var objname in objects) {
    if (objects.hasOwnProperty(objname)) {
      if (objects[objname].type == 'Goal') {
        goal_objects[i] = objects[objname];
        i = i + 1;
      }
    }
  }
  return goal_objects;
}

var getDynamicObjects = function(pgw) {
  var objects = pgw.objects;
  var dynamic_objects = [];
  for (var objname in objects) {
    if (objects.hasOwnProperty(objname)) {
      var obj = objects[objname];
      if (!obj.isStatic()) {
        dynamic_objects[objname] = objects[objname];
      }
    }
  }
  return dynamic_objects;
}

var distBetweenObjects = function(obj1, obj2) {
  var pos1 = obj1.getPos();
  var pos2 = obj2.getPos();

  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)); //could be more complicated based on type, use this for now which should be centroids of objects
}

var toolPickerCheck = function(toolChoice, posChoice, jsonDat, toolDict) {
  var pgw = pg.loadFromDict(jsonDat);
  var tool = toolDict[toolChoice];
  var hasCol = false;
  for (var i = 0; i < tool.length; i++) {
    hasCol = hasCol | pgw.checkCollision(posChoice, tool[i]);
  }
  return hasCol;
};

var toolPickerSave = function(fileName, gamingWorld, tools, successText, tlim, tres) {
  var tres = typeof(tres) !== 'undefined' ? tres : .1;
  var tlim = typeof(tlim) !== 'undefined' ? tlim : 20;

  var ret = {
    world: gamingWorld.toDict(),
    tools: tools,
    toolNames: toolPickerGetTools(tools),
    sucText: successText
  };
  var jsonStr = JSON.stringify(ret);
  fs.writeFileSync(fileName, jsonStr);
};

var toolPickerLoad = function(fileName) {
  var contents = fs.readFileSync(fileName);
  var loader = JSON.parse(contents);
  var pgw = pg.loadFromDict(loader.world);
  return {
    world: pgw,
    dims: pgw.dims,
    worldDat: loader.world,
    tools: loader.tools,
    toolNames: toolPickerGetTools(loader.tools)
  };
};

module.exports = {
  loadWorld: loadWorld,
  saveWorld: saveWorld,
  distBetweenObjects: distBetweenObjects,
  getGoalObjects: getGoalObjects,
  getDynamicObjects: getDynamicObjects,
  ToolPicker: {
    GetTools: toolPickerGetTools,
    GetDims: toolPickerGetDims,
    Save: toolPickerSave,
    Load: toolPickerLoad,
    Check: toolPickerCheck
  }
};
