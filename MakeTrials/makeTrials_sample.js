gaming = require('ToolsGaming');
pg = require('PhysicsGaming');
loadWorld = gaming.loadWorld;
saveWorld = gaming.saveWorld;

var tpFl = "Levels/";

/*
Make a dictionary of useable tools
 */

 var cverts = [];
 for (var i=0; i < 30; i++) {
     var ang = ((30-i)/30)*2*Math.PI;
     var x = 20*Math.cos(ang);
     var y = 20*Math.sin(ang);
     cverts.push([x,y]);
 }

var myTools = {
  circle: [cverts],
  diamond: [[[-20,0],[0,20],[20,0],[0,-20]]],
  shortPusherR: [[[-30,-15],[-30,15],[30,15],[0,-15]]],
  shortPusherL: [[[-30, 15], [30, 15], [30, -15], [0, -15]]],
  tallPusherR: [[[-30,-25],[-30,25],[30,25],[30,5],[0,-25]]],
  tallPusherL: [[[-30, 5], [-30, 25], [30, 25], [30, -25], [0, -25]]],
  horizontal: [[[-40,-5],[-40,5],[40,5],[40,-5]]],
  vertical: [[[-5, -40], [-5, 40], [5, 40], [5, -40]]],
  block: [[[-20, -20], [-20, 20], [20, 20], [20, -20]]],
  wedge: [[[-20, 10], [20, 10], [0, -10]]],
  pyramidDown: [[[-5,-35], [-40,35], [40,35], [5,-35]]],
  pyramidUp: [[[-40,-35],[-5,35],[5,35],[40,-35]]],
  hook: [[[25,10],[37,10],[37,0],[25,0]],
         [[25,0],[37,0],[37,-5],[25,-5]],
         [[-25,10],[25,10],[25,0],[-25,0]],
         [[-37,10],[-25,10],[-25,0],[-37,0]],
         [[-37,0],[-25,0],[-25,-30],[-37,-30]]],
  diagR: [[[-30,-40],[-40,-40],[30,40],[40,40]]],
  cross: [[[-5, -5], [-5, 5], [5,5], [5, -5]],
          [[-20, -5], [-20, 5], [-5, 5], [-5, -5]],
          [[-5, 5], [-5, 20], [5, 20], [5, 5]],
          [[5, -5], [5, 5], [20, 5], [20, -5]],
          [[-5, -20], [-5, -5], [5, -5], [5, -20]]],
  opener: [[[-30, 15], [-30, 30], [0, 30], [0, 15]],
           [[0, 15], [0, 30], [30, 30], [30, 15]],
           [[0, -30], [0, 15], [30, 15], [30, -30]]],
  openerSide: [[[-30, -30], [-30, 0], [-15, 0], [-15, -30]],
               [[-30, 0], [-30, 30], [-15, 30], [-15, 0]],
               [[-15, 0], [-15, 30], [30, 30], [30, 0]]],
  triangle: [[[-40, 33.09], [40, 33.09], [0, -36.19]]]
}

function resizeTool(tool, scalex, scaley) {
  var poly, vert
  var newtool = []
  if (typeof(scalex) === 'undefined') scalex = 1
  if (typeof(scaley) === 'undefined') scaley = scalex
  for (var pi = 0; pi < tool.length; pi++) {
    poly = tool[pi]
    newtool.push([])
    for (var vi = 0; vi < poly.length; vi++) {
      vert = poly[vi]
      newtool[pi].push([vert[0] * scalex, vert[1] * scaley])
    }
  }
  return newtool
}

/*

Levels:

 */

var nm, pgw, tools

// BridgeAlt: Put the table on supports
nm = "bridgealt.json"
pgw = new pg.World([600,600],200)
pgw.addPoly('Slope', [[0, 0], [0, 400], [190, 100], [190, 0]], 'black', 0)
pgw.addContainer('Goal',[[445,90],[445,5],[595,5],[595,90]], 10, 'green', 'black', 0)
pgw.addBox('Strut1', [190, 0, 200, 80], 'black', 0)
pgw.addBox('Strut2', [270, 0, 280, 80], 'blue', 1)
pgw.addBox('Strut3', [350, 0, 360, 80], 'blue', 1)
pgw.addBox('Strut4', [430, 0, 440, 80], 'black', 0)
pgw.addBox('Bridge1', [192, 80, 272, 100], 'blue', 1)
pgw.addBox('Bridge2', [358, 80, 438, 100], 'blue', 1)

pgw.addBall('Ball',[30,400],15,'red', 1)
pgw.attachSpecificInGoal('Goal','Ball',2)

tools = {
    obj1 : resizeTool(myTools.vertical, 2, 1),
    obj2 : myTools.block,
    obj3 : resizeTool(myTools.horizontal, 1, 2)
    }

gaming.ToolPicker.Save(tpFl+nm, pgw, tools, "Get the red ball into the green goal")


// Trap: Set up an animal trap to support something coming down after ball

nm = "trap.json"

pgw = new pg.World([600, 600], 200)
pgw.addBox('LeftWall', [0, 0, 50, 300], 'black', 0)
pgw.addBox('Table', [150, 0, 600, 200], 'black', 0)
pgw.addContainer('Goal', [[45, 200], [45, 5], [145, 5], [145, 200]], 10, 'green', 'black', 0)
pgw.addBox('Support', [50, 255, 150, 265], 'black', 0)
pgw.addBox('Gate', [52, 265, 300, 285], 'blue', 1)
pgw.addPoly('Ramp', [[400, 200], [600, 400], [600, 200]], 'black', 0)
pgw.addBall('Ball', [570, 400], 15, 'red', 1)

pgw.attachSpecificInGoal('Goal','Ball',2)

tools = {
    obj1 : resizeTool(myTools.vertical, 1, .75),
    obj2 : resizeTool(myTools.block, 1.5, 1.5),
    obj3 : resizeTool(myTools.tallPusherR, 1, 1)
    }

gaming.ToolPicker.Save(tpFl+nm, pgw, tools, "Get the red ball into the green goal")


// BasicAlt: Like basic, but different positioning

nm = 'basicalt.json'
pgw = new pg.World([600, 600], 200)
pgw.addBox('Table', [300, 0, 600, 200], 'black', 0)
pgw.addContainer('Goal', [[130, 100], [130, 5], [230, 5], [230, 100]], 10, 'green', 'black', 0)
pgw.addBall('Ball', [500, 215], 15, 'red')
pgw.attachSpecificInGoal('Goal','Ball',2)

tools = {
    obj1 : myTools.shortPusherL,
    obj2 : myTools.diamond,
    obj3 : myTools.horizontal
    }

gaming.ToolPicker.Save(tpFl+nm, pgw, tools, "Get the red ball into the green goal")


// TableAlt: Table with more precarious balance
nm = 'tablealt.json'
pgw = new pg.World([600, 600], 200)
pgw.addPoly('Slope', [[400, 0], [400, 150], [600, 250], [600, 0]], 'black', 0)
pgw.addContainer('Goal', [[50, 90], [50, 5], [140, 5], [140, 90]], 10, 'green', 'black', 0)
pgw.addBox('Table', [148, 140, 397, 150], 'blue', 1)
pgw.addBox('StrutOne', [280, 0, 300, 90], 'blue', 1)
pgw.addBall('Ball', [500, 225], 15, 'red')

pgw.attachSpecificInGoal('Goal','Ball',2)

var tools = {obj1 : resizeTool(myTools.vertical, 2, 1.125),
                obj2 : resizeTool(myTools.vertical, 2, 0.75),
                obj3 : resizeTool(myTools.vertical, 2, 0.5)}

gaming.ToolPicker.Save(tpFl+nm, pgw, tools, "Get the red ball into the green goal")


// GapAlt: Gap where slotting in below is needed
var nm = "gapalt.json"
var pgw = new pg.World([600,600],200)
pgw.addPoly('Slope', [[0,0],[0,400],[280,250],[280,0]], 'black', 0)
pgw.addBox('Support', [310,270,390,290], 'blue', 1)
pgw.addBox('StrutSupport', [280,0,400,110], 'black', 0)
pgw.addPoly('Plug', [[280, 110], [280, 180], [400, 110]], 'black', 0)
pgw.addContainer('Goal',[[400,210],[400,5],[550,5],[550,210]],10, 'green', 'black', 0)
pgw.addBall('Ball', [100, 450], 15, 'red')
pgw.attachSpecificInGoal('Goal','Ball',2)

var tools = {obj1 : myTools.pyramidDown,
                obj2 : myTools.pyramidUp,
                obj3 : resizeTool(myTools.vertical, 0.7)}

gaming.ToolPicker.Save(tpFl+nm, pgw, tools, "Get the red ball into the green goal")
