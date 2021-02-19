/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function AssertException(message) {
    this.message = message;
}
AssertException.prototype.toString = function() {
    return 'AssertException: ' + this.message;
};

function assert(exp, message) {
    if (!exp) {
        throw new AssertException(message);
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
}


function cbow() {
    console.log('Hurray!!!!');
}


function loadToolPicker(fileName, canvName, resetName, remName, sucName, hz) {

    var worlddat, tools, toolNames, sucTxt;
    $.ajax({
        dataType: 'json',
        url: fileName,
        async: false,
        success: function(data) {
            worlddat = data.world;
            tools = data.tools;
            toolNames = data.toolNames;
            sucTxt = data.sucText;
        },
        failure: function() {
			console.log('oops')
            alert('Oops! Loading failed: ' + fileName);
        }
    });

    var gw = new GameWorld(canvName, tools, resetName, remName, sucName, worlddat, sucTxt, hz);
    return gw;
};

function loadToolPickerFromJSON(data, canvName, resetName, remName, sucName, hz) {
    worlddat = data.world;
    tools = data.tools;
    toolNames = data.toolNames;
    sucTxt = data.sucText;
    var gw = new GameWorld(canvName, tools, resetName, remName, sucName, worlddat, sucTxt, hz);
    return gw;
};


GameWorld = function(canvName, tools, resetName, remName, sucName, worldData, sucTxt, hz) {
    var hz = typeof(hz) !== 'undefined' ? hz : 50;

    this.canvas = document.getElementById(canvName);
    assert(this.canvas instanceof HTMLCanvasElement, "canvName must provide an HTML canvas");

    this.resetButton = document.getElementById(resetName);
    assert(this.resetButton !== null, "Must provide a legitimate document element for resetName");

    this.remText = document.getElementById(remName);
    assert(this.remText !== null, "Must provide a legitimate document element for remName");

    this.sucText = document.getElementById(sucName);
    assert(this.sucText !== null, "Must provide a legitimate document element for sucName");
    if (typeof(sucTxt) === 'undefined') {
        this.sucText.innerText = "Drop tools and have fun!";
    } else {
        this.sucText.innerText = sucTxt;
    }

    this.worldDat = worldData;

    this.makeWorldFromData(worldData);

    this.dt = 1 / hz;
    this.activeShape = null;
    this.activeToolName = null;
    this.shapeSet = false;
    this.running = false;
    this.winCall = function(me) {return;};

    this.action_record = [];
    this.reset_record = [];
    this.tool_record = [];
    this.was_successful = false;

    // Add listeners for the canvas
    var me = this;
    var omover = function(evt) {
        var mpos = getMousePos(me.canvas, evt);
        me.onMouseOver(mpos, me);
    };
    var omdown = function(evt) {
        var mpos = getMousePos(me.canvas, evt);
        me.onMouseDown(mpos, me);
    };
    this.canvas.addEventListener('mousemove', omover);
    this.canvas.addEventListener('click', omdown);

    // Keep around the links for descrution
    this.omo = omover;
    this.omd = omdown;

    // Check -- should we draw the tools as red or blue?
    var gc = this.pgw.goalCond
    this.toolsRed = false
    if (gc !== undefined) {
      this.toolsRed = (gc.type === "AnyInGoal" ||
                       (gc.type === "SpecificInGoal" && gc.obj === "PLACED") ||
                       (gc.type === "ManyInGoal" && gc.objlist.indexOf("PLACED") !== -1))
    }

    // Add the buttons for the tools
    this.tools = {};
    for (var k in tools) {
        this.tools[k] = new ToolButton(k, tools[k], me);
    }

    // Add the reset
    this.resetButton.onclick = function() {
        me.reset_record.push(me.relativeTime());
        me.reset();
    };

    this.setWinCallback(function() {
        me.running = false;
        console.log("Win! " + me.pgw.time);
    });

    this.basetime = new Date().getTime();

};

GameWorld.prototype.makeWorldFromData = function(worldDat) {


    this.pgw = loadFromDict(worldDat);

    var me = this;
    this.setWinCallback();
    this.pgw.step(.00001); // For setting objects in place
};

GameWorld.prototype.setWinCallback = function(callback) {
    var me = this;
    if (typeof(callback) !== "undefined") {
        me.winCall = callback;
    }
    this.pgw.callbackOnWin(function() {
        me.running=false;
        me.was_successful = true;
        me.winCall(me);
    })
};

GameWorld.prototype.draw = function() {
    this.pgw.draw(this.canvas);
};

GameWorld.prototype.run = function(me, startrun) {

    me.running = typeof(startrun) !== 'undefined' ? startrun : me.running;

    me.pgw.step(me.dt);
    if (me.pgw.goalCond !== null) {
        var rtm = me.pgw.goalCond.remainingTime();
        me.setRemTime(rtm);
    }
    me.draw(me.canvas);
    if (me.running) setTimeout(function() {
        me.run(me);
    }, me.dt * 1000);

};

GameWorld.prototype.allStill = function(stillthresh) {
  if (typeof(stillthresh) === "undefined") stillthresh = 0.01
  for (var onm in this.pgw.objects) {
    var o = this.pgw.objects[onm]
    if (!o.isStatic()) {
      var v = o.getVel()
      if (Math.sqrt(v[0]*v[0] + v[1]*v[1]) >= stillthresh) {
        return false
      }
    }
  }
  return true
};

GameWorld.prototype.reset = function() {
    this.makeWorldFromData(this.worldDat);
    //this.activeShape = null;
    this.shapeSet = false;
    this.running = false;
    this.remText.innerText = "-";
    this.draw();
    this.drawTools();
};

GameWorld.prototype.activateShape = function(vertices, id) {
    this.activeShape = vertices;
    this.activeToolName = id;
};

GameWorld.prototype.onMouseOver = function(mpos, me) {

    var act = me.activeShape;
    var invert = function(pt) {
        return me.pgw._invert(pt);
    };
    var yinvert = function(y) {
        return me.pgw._yinvert(y);
    };
    var ipos = invert(mpos);

    // Nothing happens unless there's an active shape and it's still okay to be placed
    if (act !== null && !me.shapeSet) {
        // Check if the placement is fine, then draw the shape there
        var isOkay = true;
        for (var i = 0; i < act.length; i++) {
            isOkay = isOkay & !me.pgw.checkCollision(ipos, act[i]);
        }
        var color = isOkay ? (me.toolsRed ? "red" : "blue") : "grey";
        me.draw();

        var ctx = me.canvas.getContext('2d');
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = color;
        for (var i = 0; i < act.length; i++) {
            var a = act[i];
            ctx.beginPath();
            ctx.moveTo(a[0][0] + mpos[0], -a[0][1] + mpos[1]);
            for (var j = 1; j < a.length; j++) {
                ctx.lineTo(a[j][0] + mpos[0], -a[j][1] + mpos[1]);
            }
            ctx.closePath();
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    };

    // FOR DEBUGGING
    var mdisp = document.getElementById('mpos');
    mdisp.innerHTML = "x: " + mpos[0] + "; y: " + yinvert(mpos[1]);

};

GameWorld.prototype.onMouseDown = function(mpos, me) {

    var act = me.activeShape;
    var invert = function(pt) {
        return me.pgw._invert(pt);
    };
    var imp = invert(mpos);

    // Check for collisions within the tools
    var nocol;
		if (act !== null) {
				nocol = true
				for (var i = 0; i < act.length; i++) {
		        nocol = nocol & !me.pgw.checkCollision(imp, act[i]);
		    }
		} else {
			nocol = false
		}
    

    // Nothing happens unless there's an active shape and it's still okay to be placed
    if (act !== null && !me.shapeSet && nocol) {
        me.action_record.push([me.activeToolName, imp, me.relativeTime()]);
        me.placeObject(act, imp);
    }
};

GameWorld.prototype.placeObject = function(shape, pos, runAfter) {
    runAfter = typeof(runAfter) === 'undefined' ? true : runAfter
    // Set the compound to the mouse position
    var ppolys = [];
    for (var i = 0; i < shape.length; i++) {
        var tpol = [];
        for (var j = 0; j < shape[i].length; j++) {
            tpol.push([shape[i][j][0] + pos[0], shape[i][j][1] + pos[1]]);
        }
        ppolys.push(tpol);
    }

    var p = this.pgw.addPlacedCompound("PLACED", ppolys, (this.toolsRed ? "red" : "blue"));
    this.draw();

    this.shapeSet = true;
    var me = this;
    if (runAfter) {
      this.run(me, true);
    }
};

GameWorld.prototype.relativeTime = function() {
    return (new Date().getTime()) - this.basetime;
};

GameWorld.prototype.resetTools = function() {
    this.activateShape(null, null);
    for (var k in this.tools) {
        this.tools[k].pressed = false;
    }
};

GameWorld.prototype.drawTools = function() {
    for (var k in this.tools) {
        this.tools[k].draw();
    }
};

GameWorld.prototype.setRemTime = function(t) {
    if (t === null) {
        this.remText.innerText = '-';
    } else {
        var dispt = Math.trunc(t * 10) / 10;
        if (dispt % 0 === 0) dispt += ".0";
        this.remText.innerText = dispt;
    }

};

//
GameWorld.prototype.unhook = function() {
    this.running = false;
    this.canvas.removeEventListener('mousemove', this.omo);
    this.canvas.removeEventListener('click', this.omd);
    //this.resetButton.removeAttribute('onclick');
    this.resetButton.onclick = function() {return;};
};

GameWorld.prototype.rehook = function() {
    var me = this;
    this.canvas.addEventListener('mousemove', me.omo);
    this.canvas.addEventListener('click', me.omd);
    this.resetButton.onclick = function() {
        me.reset_record.push(me.relativeTime());
        me.reset();
    };
};

/*
Events are a dictionary structured as:
    actions: a list of [object_name, position, time] lists
    resets: a list of times when reset was hit
    tool_selections: a list of [object_name, time] when tools are selected
 */
GameWorld.prototype.replay = function(events, maxtime, predispTime) {
    this.unhook();
    predispTime = typeof(predispTime) === 'undefined' ? 1000 : predispTime
    for (var tnm in this.tools) {
        tool = this.tools[tnm];
        tool.disable();
    }
    var me = this;
    var do_select = function(select_i) {
        var select = events.tool_selections[select_i];
        var sel = select[0];
        var time = select[1];
        setTimeout(function() {me.tools[sel].press()}, time);
    };
    var do_action = function(act_i) {
        var act = events.actions[act_i];
        var sel = act[0];
        var pos = act[1];
        var time = act[2];
        if (time > predispTime) {
          // Fake a mouseover event
          setTimeout(function() {
            me.tools[sel].press()
            me.onMouseOver(me.pgw._invert(pos), me)
          }, time - predispTime)
        }
        setTimeout(function() {me.placeObject(me.tools[sel].polys, pos);}, time);
    };
    var do_reset = function(reset_i) {
        setTimeout(function() {me.reset();}, events.resets[reset_i]);
    };
    for (var select_i in events.tool_selections) {
        do_select(select_i);
    }
    for (var act_i in events.actions) {
        do_action(act_i);
    }
    for (var reset_i in events.resets) {
        do_reset(reset_i);
    }

    // Reset afterwards if asked
    if (typeof(maxtime) != "undefined") {
        var me = this;
        setTimeout(function() {
            me.rehook();
            for (var tnm in me.tools) {
                tool = me.tools[tnm];
                tool.enable();
            }
        }, maxtime);
    }
};

// Buttons for containing the tool shapes

ToolButton = function(buttonid, polys, parent) {
    this.id = buttonid;
    this.button = document.getElementById(buttonid);
    this.parent = parent;
    assert(this.button instanceof HTMLCanvasElement, "buttonid must provide an HTML canvas");
    this.pressed = false;

    this.enable();

    this.polys = polys;
    this.draw();

};

ToolButton.prototype.enable = function() {
    var me = this;
    this.button.onclick = function() {
        me.press();
    };
};

ToolButton.prototype.disable = function() {
    //this.button.removeAttribute('onclick');
    this.button.onclick = function() {return;};
};

ToolButton.prototype.draw = function() {
    var w = this.button.offsetWidth,
        h = this.button.offsetHeight;

    var ctx = this.button.getContext('2d');

    var bkcol = this.pressed ? "grey" : "white";
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = bkcol;
    ctx.fillRect(0, 0, w, h);

    if (this.parent.toolsRed) {
      ctx.fillStyle = 'red'
    } else {
      ctx.fillStyle = 'blue'
    }

    for (var i = 0; i < this.polys.length; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + this.polys[i][0][0], h / 2 - this.polys[i][0][1]);
        for (var j = 0; j < this.polys[i].length; j++) {
            ctx.lineTo(w / 2 + this.polys[i][j][0], h / 2 - this.polys[i][j][1]);
        }
        ctx.closePath();
        ctx.fill();
    }


};

ToolButton.prototype.press = function() {
    this.parent.tool_record.push([this.id, this.parent.relativeTime()]);
    this.parent.resetTools();
    this.pressed = true;
    this.parent.activateShape(this.polys, this.id);
    this.parent.drawTools();
};
