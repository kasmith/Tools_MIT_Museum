
/*
*
* Store all of the names of the various buttons, etc.
*
*/

var NAME = "object_name";
var SCREEN = "build_screen";
var TOOL_SCREEN_1 = "tool_1";
var TOOL_EDIT_1 = "tool_button_1";
var TOOL_SCALE_1 = "tool_scale_1";
var TOOL_SCALE_BUTTON_1 = "tool_scale_button_1";
var TOOL_SCREEN_2 = "tool_2";
var TOOL_EDIT_2 = "tool_button_2";
var TOOL_SCALE_2 = "tool_scale_2";
var TOOL_SCALE_BUTTON_2 = "tool_scale_button_2";
var TOOL_SCREEN_3 = "tool_3";
var TOOL_EDIT_3 = "tool_button_3";
var TOOL_SCALE_3 = "tool_scale_3";
var TOOL_SCALE_BUTTON_3 = "tool_scale_button_3";
var SAVE_BUTTON = "file_save";
var LOAD_BUTTON = "file_load";
var UNDO_BUTTON = "file_undo";
var REDO_BUTTON = "file_redo";
var ATTEMPT_VALUE = "attempt_data";
var ATTEMPT_BUTTON = "file_attempt";
var RESET_BUTTON = "file_reset";
var GOAL_TYPE = "goal_type";
var GOAL_OBJ_1 = "goal_obj1";
var GOAL_OBJ_2 = "goal_obj2";
var GOAL_DURATION = "goal_dur";
var STATIC_MARK = "static_mark";
var SELECT_MOVE = "select_move";
var SELECT_RESIZE = "select_resize";
var SELECT_ROTATE = "select_rotate";
var SELECT_ERASE = "select_erase";
var SELECT_RENAME = "select_rename";
var DRAW_BOX = "draw_box";
var DRAW_CIRCLE = "draw_circle";
var DRAW_POLY = "draw_poly";
var DRAW_CONTAINER = "draw_container";
var DRAW_BLOCKER = "draw_blocker";
var COLOR_FORM = "color_select";
var DENSITY_FORM = "density_form";
var FRICTION_FORM = "friction_form";
var ELASTICITY_FORM = "elasticity_form";
var GOAL_TEXT_1 = "goal_text_1";
var GOAL_TEXT_2 = "goal_text_2";
var CONDITION_TEXT = "goal_cond_text";
var FILE_PICKER = "file_picker";
var SUBMIT_BUTTON = "do_submit";
var TOP_WALL = "check_topwall";
var LEFT_WALL = "check_leftwall";
var BOTTOM_WALL = "check_bottomwall";
var RIGHT_WALL = "check_rightwall";

/*
* Helper functions for geometric processing
*/


// Adapted from http://stackoverflow.com/questions/5271583/center-of-gravity-of-a-polygon
function find_centroid(pts) {
    var nPts = pts.length;
    var off = pts[0];
    var twicearea = 0;
    var x = 0;
    var y = 0;
    var p1, p2;
    var f;
    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i];
        p2 = pts[j];
        f = (p1[0]-off[0]) * (p2[1]-off[1]) - (p2[0] - off[0]) * (p1[1]-off[1]);
        twicearea += f;
        x += (p1[0] + p2[0] - 2*off[0]) * f;
        y += (p1[1] + p2[1] - 2*off[1]) * f;
    }
    f = twicearea * 3;
    return [x/f + off[0], y/f + off[1]];
}

function poly_area(pts) {
    var nPts = pts.length;
    var off = pts[0];
    var twicearea = 0;
    var p1, p2;
    var f;
    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i];
        p2 = pts[j];
        f = (p1[0]-off[0]) * (p2[1]-off[1]) - (p2[0] - off[0]) * (p1[1]-off[1]);
        twicearea += f;
    }
    return twicearea / 2;
};

function vsub(a, b) {
    return [a[0]-b[0], a[1]-b[1]];
};

function crossprod(a, b) {
    return a[0]*b[1]-a[1]*b[0];
};

// Adapted from http://stackoverflow.com/questions/1119627/how-to-test-if-a-point-is-inside-of-a-convex-polygon-in-2d-integer-coordinates
function point_in_poly(pt, verts) {
    var pside = null;
    var cside = null;
    var nverts = verts.length;
    for (var i=0; i < nverts; i++) {
        var a = verts[i];
        var b = verts[(i+1) % nverts];
        var affine_seg = vsub(b,a);
        var affine_pt = vsub(pt, a);
        var xprod = crossprod(affine_seg, affine_pt);
        if (xprod < 0) {
            cside = -1;
        } else if (xprod > 0) {
            cside = 1;
        } else {
            cside = null;
        }
        if(pside === null) {
            pside = cside;
        } else {
            if (pside !== cside) {
                return false;
            }
        }
    }
    return true;
};

// Gift wrapping algorithm for a set of points
// Based on https://en.wikipedia.org/wiki/Gift_wrapping_algorithm
function gift_wrap(vertices) {
    var pt = vertices[0];
    // Find the left-most point
    for (var i=0; i < vertices.length; i++) {
        if (vertices[i][0] < pt[0]) {
            pt = vertices[i];
        }
    }
    var running = true;
    var hull = [];
    var i = 0;
    var ep, isleft;
    while (running) {
        hull.push(pt);
        ep = vertices[0];
        for (var j=1; j<vertices.length; j++) {
            // Check whether the point is on the left of the current segment
            isleft = crossprod(vsub(ep,pt),vsub(vertices[j],pt)) > 0;
            if (ep === pt | isleft) {
                ep = vertices[j];
            }
        }
        i++;
        pt = ep;
        if (hull[0] == pt) {
            running = false;
        }
    }
    return hull;
};

// Adapted from http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
function check_clockwise(vertices) {
    var total = 0;
    var nv = vertices.length
    for(var i = nv-1, j=0; j < nv; i = j++) {
        total += (vertices[j][0]-vertices[i][0]) * (vertices[j][1]+vertices[i][1]);
    }
    return total > 0;
};

function consistent_winding(vertices) {
    if (check_clockwise(vertices)) {
        return vertices;
    } else {
        return vertices.reverse();
    }
};

// Use ear-clipping to perform triangulation of vertex set
function triangulate(vertices) {
    // Cannot triangluate a list of fewer than 3 vertices
    if (vertices.length < 3) {
        return null;
    }
    var is_clockwise = check_clockwise(vertices);
    var trilist = [];
    var vl = vertices.slice(0);
    var p1, p2, p3, is_ear, is_left;
    while (vl.length > 3) {
        var runthrough = true;
        for (var i = 0; runthrough; i++) {
            p1 = vl[i];
            p2 = vl[(i+1) % vl.length];
            p3 = vl[(i+2) % vl.length];
            // Do these points make an ear?
            // First, the p1-p3 line must be inside the polygon
            is_left = crossprod(vsub(p3,p1),vsub(p2,p1)) > 0;
            if ((is_left & is_clockwise) | (!is_left & !is_clockwise)) {
                // Next, no point may be in the triangle
                is_ear = true;
                for (var j = 0; j < vl.length & is_ear; j++) {
                    if (j < i-1 | j > i+1) {
                        if (point_in_poly(vl[j], [p1,p2,p3])) {
                            is_ear = false;
                        }
                    }
                }
                // If it's an ear, pop that triangle onto the list, remove from vertices
                if (is_ear) {
                    trilist.push([p1,p2,p3]);
                    vl.splice((i+1) % vl.length, 1);
                    runthrough = false;
                }
            }
        }
    }
    // Last thing is add the remaining triangle
    trilist.push(vl);
    return trilist;
};

// From https://gist.github.com/Joncom/e8e8d18ebe7fe55c3894
function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
};

// Check whether adding a point would cause any line intersections
function check_new_intersect(vertexlist, pt) {
    if (vertexlist.length < 3) {
        return false;
    }
    var ept = vertexlist[vertexlist.length - 1];
    for (var i=0; i < (vertexlist.length-2); i++) {
        var p1 = vertexlist[i];
        var p2 = vertexlist[i+1];
        if (line_intersects(p1[0],p1[1],p2[0],p2[1],ept[0],ept[1],pt[0],pt[1])) {
            return true;
        }
    }
    return false;
};

/*
*
* Objects
* A set of classes that represent things on the screen
* Includes Box, Circle, Poly, Container, Compound (for multi-polys)
* All have the following methods:
*  move(dx, dy)
*  resize(size)
*  rotate(dtheta)
*  draw(canvas_context)
*  dictify() [for turning into an object to pass to the player / json]
*  point_in(pt) - returns bool for testing clicks
*  get_pos() - returns the position of the center of the object
*  get_size() - returns the size of the object (for resizing)
*/

var euclid_dist = function(p1, p2) {
    var dx = p1[0] - p2[0];
    var dy = p1[1] - p2[1];
    return Math.sqrt(dx*dx+dy*dy);
};

CircleObject = function(name, center, r, color, is_static, density, elasticity, friction) {
    this.type =  'circle';
    this.name = name;
    this.center = center;
    this.r = r;
    this.static = is_static;
    this.density = density;
    this.elasticity = elasticity;
    this.friction = friction;
    this.color = color;
    this.do_not_draw = false;
};

CircleObject.prototype.move = function(dx, dy) {
    this.center = [this.center[0]+dx, this.center[1]+dy];
};

CircleObject.prototype.resize = function(size) {
    this.r = size;
};

CircleObject.prototype.rotate = function(dtheta) {
    return;
};

CircleObject.prototype.draw = function(ctx) {
    if (!this.do_not_draw) {
        var oldcol = ctx.fillStyle;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.center[0], this.center[1], this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = oldcol;
    }
};

CircleObject.prototype.dictify = function(screen_height) {
    var d = {
        name: this.name,
        position: [this.center[0], screen_height-this.center[1]],
        radius: this.r,
        color: this.color,
        density: this.density,
        elasticity: this.elasticity,
        friction: this.friction,
        type: "Ball"
    };
    return d;
};

CircleObject.prototype.point_in = function(pt) {
    return euclid_dist(pt, this.center) <= this.r;
};

CircleObject.prototype.get_pos = function() {
    return this.center;
};

CircleObject.prototype.get_size = function() {
    return this.r;
};

PolyObject = function(name, vertices, color, is_static, density, elasticity, friction) {
    this.name = name;
    this.vertices = vertices;
    this.static = is_static;
    this.color = color;
    this.density = density;
    this.elasticity = elasticity;
    this.friction = friction;
    this.com = this._getCoM();
    this.do_not_draw = false;
    this.type = "poly";
};

PolyObject.prototype._getCoM = function() {
    return find_centroid(this.vertices);
};

PolyObject.prototype._getArea = function() {
    return poly_area(this.vertices);
};

PolyObject.prototype.move = function(dx, dy) {
    this.vertices = this.vertices.map(function(p) {return [p[0]+dx, p[1]+dy];});
    this.com = [this.com[0]+dx, this.com[1]+dy];
};

PolyObject.prototype.get_size = function() {
    var c = this.com;
    var dists = this.vertices.map(function(p) {return euclid_dist(p,c);});
    return Math.max.apply(null, dists);
};

PolyObject.prototype.resize = function(size) {
    var osize = this.get_size();
    var c = this.com;
    this.vertices = this.vertices.map(function(p) {
        return [(p[0]-c[0])*(size/osize) +c[0],
                (p[1]-c[1])*(size/osize) +c[1]];
    });
};

PolyObject.prototype.get_pos = function() {
    return this.com;
};

PolyObject.prototype.point_in = function(pt) {
    return point_in_poly(pt, this.vertices);
};

PolyObject.prototype.rotate = function(dangle) {
    return; // TO DO!!!
};

PolyObject.prototype.draw = function(ctx) {
    if (!this.do_not_draw) {
        var oldcol = ctx.fillStyle;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        var nvert = this.vertices.length;
        ctx.moveTo(this.vertices[nvert-1][0], this.vertices[nvert-1][1]);
        for (var i = 0; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = oldcol;
    }
};

PolyObject.prototype.dictify = function(screen_height) {
    var flip = function(p) {return [p[0], screen_height-p[1]];};
    return {
        name: this.name,
        vertices: consistent_winding(this.vertices.map(flip)),
        density: this.density,
        elasticity: this.elasticity,
        friction: this.friction,
        color: this.color,
        type: "Poly"
    };
};

// An object for a complex compound object (made through triangulation)
CompoundObject = function(name, triangle_list, color, is_static, density, elasticity, friction) {
    this.name = name;
    this.color = color;
    this.static = is_static;
    this.density = density;
    this.elasticity = elasticity;
    this.friction = friction;

    this.polylist = [];
    this.area = 0;
    var x = 0;
    var y = 0;
    for (var i = 0; i < triangle_list.length; i++) {
        var p = new PolyObject(name, triangle_list[i], color, is_static, density, elasticity, friction)
        this.polylist.push(p);
        var a = p._getArea();
        var c = p._getCoM();
        x += c[0]*a;
        y += c[1]*a;
        this.area += a;
    }
    this.com = [x/this.area, y/this.area];
    this.do_not_draw = false;
    this.type = "compound";
};

CompoundObject.prototype.move = function(dx,dy) {
    for (var i=0; i < this.polylist.length; i++) {
        this.polylist[i].move(dx,dy);
    }
    var c = this.com;
    this.com = [c[0]+dx, c[1]+dy];
};

CompoundObject.prototype.get_size = function() {
    var sz = 0;
    for (var i=0; i < this.polylist.length; i++) {
        var poly = this.polylist[i];
        for (var j=0; j < poly.vertices.length; j++) {
            var nd = euclid_dist(poly.vertices[j], this.com);
            if (nd > sz) {
                sz = nd;
            }
        }
    }
    return sz;
};

CompoundObject.prototype.get_pos = function() {
    return this.com;
};

CompoundObject.prototype.resize = function(size) {
    var sizerat = size / this.get_size();
    for (var i=0; i< this.polylist.length; i++) {
        var poly = this.polylist[i];
        var pcom = poly.get_pos();
        var dx = (pcom[0] - this.com[0])*(sizerat - 1);
        var dy = (pcom[1] - this.com[1])*(sizerat - 1);
        poly.resize(poly.get_size()*sizerat);
        poly.move(dx,dy);
    }
};

CompoundObject.prototype.point_in = function(pt) {
    return this.polylist.some(function(p) {return p.point_in(pt);});
};

CompoundObject.prototype.rotate = function(dangle) {
    return;
};

CompoundObject.prototype.draw = function(ctx) {
    if (!this.do_not_draw) {
        for (var i=0; i < this.polylist.length; i++) {
            this.polylist[i].draw(ctx);
        }
    }
};

CompoundObject.prototype.dictify = function(screen_height) {
    var flip = function(p) {return [p[0], screen_height-p[1]];};
    var r = {
        name: this.name,
        polys: [],
        color: this.color,
        density: this.density,
        elasticity: this.elasticity,
        friction: this.friction,
        type: 'Compound'
    };
    for (var i = 0; i < this.polylist.length; i++) {
        r.polys.push(consistent_winding(this.polylist[i].vertices.map(flip)));
    }
    return r;
};

ContainerObject = function(name, vertices, thickness, color, is_static, density, elasticity, friction) {

    this.name = name;
    this.vertices = vertices;
    this.thick = thickness;
    this.static = is_static;
    this.outerColor = color;
    this.innerColor = "green";
    this.density = density;
    this.elasticity = elasticity;
    this.friction = friction;
    this.com = this._getCoM();
    this.do_not_draw = false;
    this.type = "container";
};

ContainerObject.prototype._getCoM = function() {
    return find_centroid(this.vertices);
};

ContainerObject.prototype.move = function(dx, dy) {
    this.vertices = this.vertices.map(function(p) {return [p[0]+dx, p[1]+dy];});
    this.com = [this.com[0]+dx, this.com[1]+dy];
};

ContainerObject.prototype.get_size = function() {
    var c = this.com;
    var dists = this.vertices.map(function(p) {return euclid_dist(p,c);});
    return Math.max.apply(null, dists);
};

ContainerObject.prototype.resize = function(size) {
    var osize = this.get_size();
    var c = this.com;
    this.vertices = this.vertices.map(function(p) {
        return [(p[0]-c[0])*(size/osize) +c[0],
                (p[1]-c[1])*(size/osize) +c[1]];
    });
};

ContainerObject.prototype.get_pos = function() {
    return this.com;
};

ContainerObject.prototype.point_in = function(pt) {
    return point_in_poly(pt, this.vertices);
};

ContainerObject.prototype.rotate = function(dangle) {
    return; // TO DO!!!
};

ContainerObject.prototype.draw = function(ctx) {
    if (!this.do_not_draw) {
        // Draw the outline
        var oldcol = ctx.strokeStyle;
        var oldwid = ctx.lineWidth;
        var oldalpha = ctx.globalAlpha;
        var oldfill = ctx.fillStyle;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thick;
        ctx.globalAlpha = 1.;
        ctx.beginPath();
        var nvert = this.vertices.length;
        ctx.moveTo(this.vertices[0][0], this.vertices[0][1]);
        for (var i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
        }
        ctx.stroke();

        // Draw the inside
        ctx.fillStyle = 'green';
        ctx.globalAlpha = .5;
        ctx.beginPath();
        var nvert = this.vertices.length;
        ctx.moveTo(this.vertices[0][0], this.vertices[0][1]);
        for (var i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
        }
        ctx.fill();

        ctx.strokeStyle = oldcol;
        ctx.lineWidth = oldwid;
        ctx.fillStyle = oldfill;
        ctx.globalAlpha = oldalpha;
    }
};

ContainerObject.prototype.dictify = function(screen_height) {
    var flip = function(p) {return [p[0], screen_height-p[1]];};
    return {
        name: this.name,
        points: consistent_winding(this.vertices.map(flip)).reverse(),
        width: this.thick,
        outerColor: this.outerColor,
        innerColor: this.innerColor,
        density: this.density,
        elasticity: this.elasticity,
        friction: this.friction,
        type: 'Container'
    };
};

BlockerObject = function(name, vertices) {
    this.name = name;
    this.vertices = vertices;
    this.com = this._getCoM();
    this.do_not_draw = false;
    this.type = "block";
};

BlockerObject.prototype = Object.create(PolyObject.prototype);

BlockerObject.prototype.draw = function(ctx) {
    if (!this.do_not_draw) {
        var oldcol = ctx.fillStyle;
        ctx.fillStyle = "grey";
        ctx.beginPath();
        var nvert = this.vertices.length;
        ctx.moveTo(this.vertices[nvert-1][0], this.vertices[nvert-1][1]);
        for (var i = 0; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = oldcol;
    }
};

BlockerObject.prototype.dictify = function(screen_height) {
    var flip = function(p) {return [p[0], screen_height-p[1]];};
    return {
        name: this.name,
        vertices: consistent_winding(this.vertices.map(flip)),
        color: "grey",
        type: "Blocker"
    };
};

GoalObject = function(name, vertices, color) {
    this.name = name;
    this.vertices = vertices;
    this.static = true;
    this.color = color;
    this.com = this._getCoM();
    this.do_not_draw = false;
    this.type = "goal";
};

GoalObject.prototype._getCoM = function() {
    return find_centroid(this.vertices);
};

GoalObject.prototype._getArea = function() {
    return poly_area(this.vertices);
};

GoalObject.prototype.move = function(dx, dy) {
    this.vertices = this.vertices.map(function(p) {return [p[0]+dx, p[1]+dy];});
    this.com = [this.com[0]+dx, this.com[1]+dy];
};

GoalObject.prototype.get_size = function() {
    var c = this.com;
    var dists = this.vertices.map(function(p) {return euclid_dist(p,c);});
    return Math.max.apply(null, dists);
};

GoalObject.prototype.resize = function(size) {
    var osize = this.get_size();
    var c = this.com;
    this.vertices = this.vertices.map(function(p) {
        return [(p[0]-c[0])*(size/osize) +c[0],
                (p[1]-c[1])*(size/osize) +c[1]];
    });
};

GoalObject.prototype.get_pos = function() {
    return this.com;
};

GoalObject.prototype.point_in = function(pt) {
    return point_in_poly(pt, this.vertices);
};

GoalObject.prototype.rotate = function(dangle) {
    return; // TO DO!!!
};

GoalObject.prototype.draw = function(ctx) {
    if (!this.do_not_draw) {
        var oldcol = ctx.fillStyle;
        var oldalpha = ctx.globalAlpha;
        ctx.fillStyle = this.color;
        ctx.flobalAlpha = 0.5
        ctx.beginPath();
        var nvert = this.vertices.length;
        ctx.moveTo(this.vertices[nvert-1][0], this.vertices[nvert-1][1]);
        for (var i = 0; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = oldcol;
        ctx.globalAlpha = oldalpha
    }
};

GoalObject.prototype.dictify = function(screen_height) {
    var flip = function(p) {return [p[0], screen_height-p[1]];};
    return {
        name: this.name,
        vertices: consistent_winding(this.vertices.map(flip)),
        color: this.color,
        type: "Goal"
    };
};

/*
*
* Command
* A set of objects that store possible actions for undo/redo
*
*/

Command = function(type, attributes) {
    this.type = type;
    this.attr = attributes;
};

Command.prototype.reverse = function() {
    if (this.type === 'move') {
        var dxo = this.attr.dx;
        var dyo = this.attr.dy;
        var objnm = this.attr.obj;
        var newattr = {
            dx: -dxo,
            dy: -dyo,
            obj: objnm
        };
        return new Command('move', newattr);
    } else if (this.type === 'resize') {
        var sizeo = this.attr.size;
        var oldsizeo = this.attr.oldsize;
        var objnm = this.attr.obj;
        var newattr = {
            size: oldsizeo,
            oldsize: sizeo,
            obj: objnm
        };
        return new Command('resize', newattr);
    } else if (this.type === 'rotate') {
        var dthetao = this.attr.dtheta;
        var objnm = this.attr.obj;
        var newattr = {
            dtheta: -dthetao,
            obj: objnm
        };
        return new Command('rotate', newattr);
    } else if (this.type === 'make_circle') {
        return new Command('erase', this.attr);
    } else if (this.type === 'make_poly') {
        return new Command('erase', this.attr);
    } else if (this.type === 'make_compound'){
        return new Command('erase', this.attr);
    } else if (this.type === 'make_container') {
        return new Command('erase', this.attr);
    } else if (this.type === 'make_block') {
        return new Command('erase', this.attr);
    } else if (this.type === 'erase') {
        var objtype = this.attr.objtype;
        return new Command('make_'+objtype, this.attr);
    } else if (this.type === 'rename') {
        var newattr = {
            oldname: this.attr.newname,
            newname: this.attr.oldname
        };
        return new Command('rename', newattr);
    }
};

/*
*
* Handlers are objects that take in mouse / key input to do things like
* make objects. All include the following functions:
*  mouse_down(mpos, builder)
*  mouse_up(mpos, builder)
*  key_down(keylist, builder)
*  draw(ctx, mpos)
*  reset()
*/

CircleHandler = function() {
    this.reset();
};

CircleHandler.prototype.mouse_down = function(mpos, builder) {
    this.color = builder.get_color();
    this.center = mpos;
    this.active = true;
    this.name = builder.get_name();
    this.density = builder.get_density();
    this.friction = builder.get_friction();
    this.elasticity = builder.get_elasticity();
};

CircleHandler.prototype.mouse_up = function(mpos, builder) {
    this.r = euclid_dist(mpos, this.center);
    if (this.r !== 0) {
        var makeattr = {
            name: this.name,
            objtype: 'circle',
            center: this.center,
            radius: this.r,
            color: this.color,
            density: this.density,
            friction: this.friction,
            elasticity: this.elasticity
        }
        builder.do(new Command('make_circle', makeattr));
    }
    this.reset();
};

CircleHandler.prototype.key_down = function(keylist, builder) {
    return;
};

CircleHandler.prototype.reset = function() {
    this.center = null;
    this.r = null;
    this.active = false;
    this.color = null;
    this.density = null;
    this.friction = null;
    this.elasticity = null;
    this.name = null;
};

CircleHandler.prototype.draw = function(ctx, mpos) {
    if (this.active) {
        this.r = euclid_dist(mpos, this.center);
        var oldcol = ctx.fillStyle;
        var oldalpha = ctx.globalAlpha;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(this.center[0], this.center[1], this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = oldcol;
        ctx.globalAlpha = oldalpha;
    }
}

BoxHandler = function() {
    this.reset();
};

BoxHandler.prototype.reset = function() {
    this.down = null;
    this.up = null;
    this.active = false;
    this.color = null;
    this.name = null;
    this.density = null;
    this.friction = null;
    this.elasticity = null;
    this.name = null;
};

BoxHandler.prototype.mouse_down = function(mpos, builder) {
    this.down = mpos;
    this.active = true;
    this.color = builder.get_color();
    this.name = builder.get_name();
    this.density = builder.get_density();
    this.friction = builder.get_friction();
    this.elasticity = builder.get_elasticity();
};

BoxHandler.prototype.mouse_up = function(mpos, builder) {
    if (this.active) {
        this.up = mpos
        if ((this.up[0] !== this.down[0]) && (this.up[1] !== this.down[1])) {
            var top = Math.min(this.down[1],this.up[1]);
            var bottom = Math.max(this.down[1],this.up[1]);
            var left = Math.min(this.down[0],this.up[0]);
            var right = Math.max(this.down[0],this.up[0]);
            var verts = [[left, top], [right, top], [right, bottom], [left, bottom]];
            var makeattr = {
                name: this.name,
                objtype: "poly",
                vertices: verts,
                color: this.color,
                density: this.density,
                friction: this.friction,
                elasticity: this.elasticity
            };
            builder.do(new Command('make_poly', makeattr));
        }
        this.reset();
    }
};

BoxHandler.prototype.draw = function(ctx, mpos){
    if (this.active) {
        var oldcol = ctx.fillStyle;
        var oldalpha = ctx.globalAlpha;
        var top = Math.min(this.down[1],mpos[1]);
        var bottom = Math.max(this.down[1],mpos[1]);
        var left = Math.min(this.down[0],mpos[0]);
        var right = Math.max(this.down[0],mpos[0]);
        var w = right - left;
        var h = bottom - top;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.fillRect(left, top, w, h);
        ctx.fillStyle = oldcol;
        ctx.globalAlpha = oldalpha;
    }
}

PolyHandler = function(px_sensitivity) {
    if (typeof(px_sensitivity) === 'undefined') {
        px_sensitivity = 3;
    }
    this.pxsens = px_sensitivity;
    this.reset();
};

PolyHandler.prototype.reset = function() {
    this.vlist = [];
    this.active = false;
    this.color = null;
    this.name = null;
    this.density = null;
    this.friction = null;
    this.elasticity = null;
    this.name = null;
};

PolyHandler.prototype.mouse_down = function(mpos, builder) {
    if (this.active) {
        // If it is active, check whether it is right next to the first point to close off
        if (euclid_dist(mpos, this.vlist[0]) < this.pxsens) {

            if (this.vlist.length > 2) {
                // Close off
                var makeattr = {
                    name: this.name,
                    color: this.color,
                    density: this.density,
                    friction: this.friction,
                    elasticity: this.elasticity
                };
                // First check whether this will be a simple or complex polygon
                var hull = gift_wrap(this.vlist);
                // A simple polygon will have points that make a hull
                if (hull.length === this.vlist.length){
                    makeattr.objtype = "poly";
                    makeattr.vertices = hull;
                    builder.do(new Command('make_poly', makeattr));
                    this.reset();
                } else {
                    // Otherwise we need to triangulate it and make a complex object
                    var trilist = triangulate(this.vlist);
                    makeattr.objtype = "compound";
                    makeattr.trilist = trilist;
                    builder.do(new Command('make_compound', makeattr));
                    this.reset();
                }
            }

        } else if (!(check_new_intersect(this.vlist, mpos))) {
            // Otherwise needs to not add an intersection
            this.vlist.push(mpos);
        }
    } else {
        // If it's not yet active, start it up
        this.active = true;
        this.color = builder.get_color();
        this.name = builder.get_name();
        this.density = builder.get_density();
        this.friction = builder.get_friction();
        this.elasticity = builder.get_elasticity();
        this.vlist = [mpos];
    }
};

PolyHandler.prototype.mouse_up = function(mpos, builder) {
    return;
};

PolyHandler.prototype.draw = function(ctx, mpos) {
    if (this.active & (mpos !== null)) {
        // Draw a circle at the meet point if it's a closure
        var oldcol = ctx.strokeStyle;
        var oldfill = ctx.fillStyle;
        var oldalpha = ctx.globalAlpha;
        var ucol;
        if (euclid_dist(this.vlist[0], mpos) < this.pxsens) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.vlist[0][0], this.vlist[0][1], this.pxsens*2, 0, 2*Math.PI);
            ctx.fill();
        } else if (check_new_intersect(this.vlist, mpos)) {
            ucol = "red";
        } else {
            ucol = this.color;
        }

        ctx.strokeStyle = ucol;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(this.vlist[0][0], this.vlist[0][1]);
        for (var i=0; i < this.vlist.length; i++) {
            ctx.lineTo(this.vlist[i][0], this.vlist[i][1]);
        }
        ctx.lineTo(mpos[0],mpos[1]);
        ctx.stroke();
        ctx.fillStyle = oldfill;
        ctx.strokeStyle = oldcol;
        ctx.globalAlpha = oldalpha;
    }
};

PolyHandler.prototype.key_down = function(keylist, builder) {
    return;
};

ContainerHandler = function(px_sensitivity) {
    if (typeof(px_sensitivity) === 'undefined') {
        px_sensitivity = 3;
    }
    this.pxsens = px_sensitivity;
    this.reset();
};

ContainerHandler.prototype.reset = function() {
    this.vlist = [];
    this.active = false;
    this.color = null;
    this.name = null;
    this.density = null;
    this.friction = null;
    this.elasticity = null;
    this.name = null;
    this.thickness = null;
};

ContainerHandler.prototype.mouse_down = function(mpos, builder) {
    if (this.active) {
        // If it is active, check whether last point is double-clicked
        if (euclid_dist(mpos, this.vlist[this.vlist.length-1]) < this.pxsens) {

            if (this.vlist.length > 2) {
                // Close off
                var makeattr = {
                    name: this.name,
                    color: this.color,
                    density: this.density,
                    friction: this.friction,
                    elasticity: this.elasticity,
                    thickness: this.thickness
                };
                // First check that this is a convex polygon
                var hull = gift_wrap(this.vlist);
                // A simple polygon will have points that make a hull
                if (hull.length === this.vlist.length){
                    makeattr.objtype = "container";
                    makeattr.vertices = this.vlist;
                    builder.do(new Command('make_container', makeattr));
                    this.reset();
                } else {
                    // Otherwise do nothing (should never get here)
                    console.log('Cannot make a concave container');
                    this.reset();
                }
            }
        } else {
            // Check that (a) the point doesn't intersect and (b) still convex
            var new_int = check_new_intersect(this.vlist, mpos);
            var newpts = this.vlist.slice(0);
            newpts.push(mpos);
            var hull = gift_wrap(newpts);
            if (hull.length == newpts.length & !(new_int)) {
                this.vlist.push(mpos);
            }
        }
    } else {
        // If it's not yet active, start it up
        this.active = true;
        this.color = builder.get_color();
        this.name = builder.get_name();
        this.density = builder.get_density();
        this.friction = builder.get_friction();
        this.elasticity = builder.get_elasticity();
        this.thickness = builder.get_thickness();
        this.vlist = [mpos];
    }
};

ContainerHandler.prototype.mouse_up = function(mpos, builder) {
    return;
};

ContainerHandler.prototype.draw = function(ctx, mpos) {
    if (this.active) {
        // Draw a circle at the meet point if it's a closure
        var oldcol = ctx.strokeStyle;
        var oldfill = ctx.fillStyle;
        var oldalpha = ctx.globalAlpha;
        var ucol;
        if (euclid_dist(this.vlist[this.vlist.length-1], mpos) < this.pxsens) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            var lastpt = this.vlist[this.vlist.length-1];
            ctx.arc(lastpt[0], lastpt[1], this.pxsens*2, 0, 2*Math.PI);
            ctx.fill();
        } else {
            var new_int = check_new_intersect(this.vlist, mpos);
            var newpts = this.vlist.slice(0);
            newpts.push(mpos);
            var hull = gift_wrap(newpts);
            if (hull.length == newpts.length & !(new_int)) {
                ucol = this.color;
            } else {
                ucol = "red";
            }
        }

        ctx.strokeStyle = ucol;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(this.vlist[0][0], this.vlist[0][1]);
        for (var i=0; i < this.vlist.length; i++) {
            ctx.lineTo(this.vlist[i][0], this.vlist[i][1]);
        }
        ctx.lineTo(mpos[0],mpos[1]);
        ctx.stroke();
        ctx.fillStyle = oldfill;
        ctx.strokeStyle = oldcol;
        ctx.globalAlpha = oldalpha;
    }
};

ContainerHandler.prototype.key_down = function(keylist, builder) {
    return;
};

BlockHandler = function() {
    this.reset();
};

BlockHandler.prototype.reset = function() {
    this.down = null;
    this.up = null;
    this.active = false;
    this.name = null;
};

BlockHandler.prototype.mouse_down = function(mpos, builder) {
    this.down = mpos;
    this.active = true;
    this.name = "block" + builder.block_id;
    builder.block_id += 1;
};

BlockHandler.prototype.mouse_up = function(mpos, builder) {
    if (this.active) {
        this.up = mpos
        if ((this.up[0] !== this.down[0]) && (this.up[1] !== this.down[1])) {
            var top = Math.min(this.down[1],this.up[1]);
            var bottom = Math.max(this.down[1],this.up[1]);
            var left = Math.min(this.down[0],this.up[0]);
            var right = Math.max(this.down[0],this.up[0]);
            var verts = [[left, top], [right, top], [right, bottom], [left, bottom]];
            var makeattr = {
                name: this.name,
                objtype: "block",
                vertices: verts
            };
            builder.do(new Command('make_block', makeattr));
        }
        this.reset();
    }
};

BlockHandler.prototype.draw = function(ctx, mpos){
    if (this.active) {
        var oldcol = ctx.fillStyle;
        var oldalpha = ctx.globalAlpha;
        var top = Math.min(this.down[1],mpos[1]);
        var bottom = Math.max(this.down[1],mpos[1]);
        var left = Math.min(this.down[0],mpos[0]);
        var right = Math.max(this.down[0],mpos[0]);
        var w = right - left;
        var h = bottom - top;
        ctx.fillStyle = "grey";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.fillRect(left, top, w, h);
        ctx.fillStyle = oldcol;
        ctx.globalAlpha = oldalpha;
    }
}

// Handlers for events (move, rotate, etc)
MoveHandler = function() {
    this.obj = null;
    this.reset();
};

MoveHandler.prototype.reset = function() {
    if (this.obj !== null) {this.obj.do_not_draw = false;};
    this.obj = null;
    this.dx = null;
    this.dy = null;
    this.active = false;
};

MoveHandler.prototype.mouse_down = function(mpos, builder) {
    this.obj = builder.get_clicked(mpos);
    if (this.obj !== null) {
        this.obj.do_not_draw = true;
        this.active = true;
    }
};

MoveHandler.prototype.mouse_up = function(mpos, builder) {
    if (this.active & mpos !== null) {
        var c = this.obj.get_pos();
        var moveattr = {
            dx: mpos[0] - c[0],
            dy: mpos[1] - c[1],
            obj: this.obj.name
        }
        builder.do(new Command('move', moveattr));
    }
    this.reset();
};

MoveHandler.prototype.draw = function(ctx, mpos) {
    if (this.active) {
        var c = this.obj.get_pos();
        this.dx = mpos[0] - c[0];
        this.dy = mpos[1] - c[1];
        this.obj.move(this.dx, this.dy);
        this.obj.do_not_draw = false;
        var galph = ctx.globalAlpha;
        ctx.globalAlpha = 0.8;
        this.obj.draw(ctx);
        this.obj.move(-this.dx,-this.dy);
        this.obj.do_not_draw = true;
        ctx.globalAlpha = galph;
    }
}

MoveHandler.prototype.key_down = function(keylist, builder) {
    return;
};

ResizeHandler = function() {
    this.reset();
};

ResizeHandler.prototype.reset = function() {
    this.obj = null;
    this.osize = null;
    this.active = false;
};

ResizeHandler.prototype.mouse_down = function(mpos, builder) {
    this.obj = builder.get_clicked(mpos);
    if(this.obj !== null) {
        this.obj.do_not_draw = true;
        this.osize = this.obj.get_size();
        this.active = true;
    }
};

ResizeHandler.prototype.mouse_up = function(mpos, builder) {
    if (this.active) {
        var c = this.obj.get_pos();
        var sz = euclid_dist(mpos, c);
        if (sz === 0) {
            sz = 1;
        }
        var rsattr = {
            obj: this.obj.name,
            size: sz,
            oldsize: this.osize
        };
        this.obj.do_not_draw = false;
        builder.do(new Command('resize',rsattr));
    }
    this.reset();
};

ResizeHandler.prototype.key_down = function(keylist, builder) {
    return;
};

ResizeHandler.prototype.draw = function(ctx, mpos) {
    if (this.active) {
        var nsize = euclid_dist(this.obj.get_pos(), mpos);
        if (isNaN(nsize)) {
            console.log('uhoh');
        }
        this.obj.resize(nsize);
        this.obj.do_not_draw = false;
        var galph = ctx.globalAlpha;
        ctx.globalAlpha = 0.8;
        this.obj.draw(ctx);
        this.obj.resize(this.osize);
        this.obj.do_not_draw = true;
        ctx.globalAlpha = galph;
    }
};

EraseHandler = function() {
    this.reset();
};

EraseHandler.prototype.reset = function() {
    this.obj = null;
    this.active = false;
};

EraseHandler.prototype.mouse_down = function(mpos, builder) {
    this.obj = builder.get_clicked(mpos);
    if(this.obj !== null) {
        this.active = true;
    }
};

EraseHandler.prototype.mouse_up = function(mpos, builder) {
    if (this.active) {
        var uobj = builder.get_clicked(mpos);
        if (uobj == this.obj) {
            var otype = this.obj.type;
            var oattrs = {};
            oattrs.name = this.obj.name;
            oattrs.objtype = otype;
            if (otype === 'circle') {
                oattrs.center = this.obj.get_pos();
                oattrs.radius = this.obj.get_size();
                oattrs.color = this.obj.color;
                oattrs.density = this.obj.density;
                oattrs.elasticity = this.obj.elasticity;
                oattrs.friction = this.obj.friction;
            } else if (otype === 'poly') {
                oattrs.vertices = this.obj.vertices,
                oattrs.color = this.obj.color;
                oattrs.density = this.obj.density;
                oattrs.elasticity = this.obj.elasticity;
                oattrs.friction = this.obj.friction;
            } else if (otype === 'compound') {
                oattrs.color = this.obj.color;
                oattrs.density = this.obj.density;
                oattrs.elasticity = this.obj.elasticity;
                oattrs.friction = this.obj.friction;
                oattrs.trilist = [];
                for (var i=0; i < this.obj.polylist.length; i++) {
                    oattrs.trilist.push(this.obj.polylist[i].vertices);
                }
            } else if (otype === 'container') {
                oattrs.color = this.obj.color;
                oattrs.density = this.obj.density;
                oattrs.elasticity = this.obj.elasticity;
                oattrs.friction = this.obj.friction;
                oattrs.vertices = this.obj.vertices;
                oattrs.thickness = this.obj.thick;
            } else if (otype === 'block') {
                oattrs.vertices = this.obj.vertices;
            } else {
                assert(false, "Unknown object type!")
            }
            builder.do(new Command('erase', oattrs));
            this.active = false;
        }
    }
}

EraseHandler.prototype.draw = function(ctx, mpos) {
    return;
};

EraseHandler.prototype.key_down = function(keylist, builder) {
    return;
};

RenameHandler = function() {
    this.reset();
};

RenameHandler.prototype.reset = function() {
    this.obj = null;
    this.active = false;
};

RenameHandler.prototype.mouse_down = function(mpos, builder) {
    this.obj = builder.get_clicked(mpos);
    if(this.obj !== null) {
        this.active = true;
    }
};

RenameHandler.prototype.mouse_up = function(mpos, builder) {
    if (this.active) {
        var uobj = builder.get_clicked(mpos);
        if (uobj == this.obj) {
            var oldname = uobj.name;
            var newname = prompt("Rename Object", oldname);
            if (newname !== null) {
                var cmdattr = {
                    oldname: oldname,
                    newname: newname
                };
                builder.do(new Command('rename',cmdattr));
            }
        }
    }
};

RenameHandler.prototype.draw = function(ctx, mpos) {
    return;
};

RenameHandler.prototype.key_down = function(keylist, builder) {
    return;
};


// Making a builder simply defines all of the HTML elements & variables
Builder = function() {
    this.nameform = document.getElementById(NAME);
    this.screen = document.getElementById(SCREEN);
    this.tool_screen_1 = document.getElementById(TOOL_SCREEN_1);
    this.tool_screen_2 = document.getElementById(TOOL_SCREEN_2);
    this.tool_screen_3 = document.getElementById(TOOL_SCREEN_3);
    this.tool_edit_1 = document.getElementById(TOOL_EDIT_1);
    this.tool_edit_2 = document.getElementById(TOOL_EDIT_2);
    this.tool_edit_3 = document.getElementById(TOOL_EDIT_3);
    this.tool_scale_1 = document.getElementById(TOOL_SCALE_1);
    this.tool_scale_2 = document.getElementById(TOOL_SCALE_2);
    this.tool_scale_3 = document.getElementById(TOOL_SCALE_3);
    this.tool_scale_button_1 = document.getElementById(TOOL_SCALE_BUTTON_1);
    this.tool_scale_button_2 = document.getElementById(TOOL_SCALE_BUTTON_2);
    this.tool_scale_button_3 = document.getElementById(TOOL_SCALE_BUTTON_3);
    this.save_button = document.getElementById(SAVE_BUTTON);
    this.load_button = document.getElementById(LOAD_BUTTON);
    this.undo_button = document.getElementById(UNDO_BUTTON);
    this.redo_button = document.getElementById(REDO_BUTTON);
    this.attempt_button = document.getElementById(ATTEMPT_BUTTON);
    this.reset_button = document.getElementById(RESET_BUTTON);
    this.goal_type_select = document.getElementById(GOAL_TYPE);
    this.goal_obj_1 = document.getElementById(GOAL_OBJ_1);
    this.goal_obj_2 = document.getElementById(GOAL_OBJ_2);
    this.goal_text_1 = document.getElementById(GOAL_TEXT_1);
    this.goal_text_2 = document.getElementById(GOAL_TEXT_2);
    this.goal_dur = document.getElementById(GOAL_DURATION);
    this.static_mark = document.getElementById(STATIC_MARK);
    this.move_button = document.getElementById(SELECT_MOVE);
    this.resize_button = document.getElementById(SELECT_RESIZE);
    this.rotate_button = document.getElementById(SELECT_ROTATE);
    this.erase_button = document.getElementById(SELECT_ERASE);
    this.rename_button = document.getElementById(SELECT_RENAME);
    this.box_button = document.getElementById(DRAW_BOX);
    this.circle_button = document.getElementById(DRAW_CIRCLE);
    this.poly_button = document.getElementById(DRAW_POLY);
    this.container_button = document.getElementById(DRAW_CONTAINER);
    this.blocker_button = document.getElementById(DRAW_BLOCKER);
    this.color_form = document.getElementById(COLOR_FORM);
    this.density_form = document.getElementById(DENSITY_FORM);
    this.friction_form = document.getElementById(FRICTION_FORM);
    this.elasticity_form = document.getElementById(ELASTICITY_FORM);
    this.condition_text = document.getElementById(CONDITION_TEXT);
    this.file_picker = document.getElementById(FILE_PICKER);
    this.attempt_data = document.getElementById(ATTEMPT_VALUE);
    this.submit_button = document.getElementById(SUBMIT_BUTTON);
    this.topwall = document.getElementById(TOP_WALL);
    this.leftwall = document.getElementById(LEFT_WALL);
    this.rightwall = document.getElementById(RIGHT_WALL);
    this.bottomwall = document.getElementById(BOTTOM_WALL);

    this.undo_stack = [];
    this.redo_stack = [];
    this.selected_button = null;
    this.maker = null;
    this.object_dict = {};
    this.blocker_dict = {};
    this.block_id = 1;
    this.toolscreen = null;
    this.tool1 = null;
    this.tool2 = null;
    this.tool3 = null;
};

// Initialize the hooks into HTML
Builder.prototype.init = function() {
    me = this;
    this.nameform.value = "Object1";

    this.save_button.onclick = function() {me.save(me);};
    this.load_button.onclick = function() {me.load(me);};
    this.undo_button.onclick = function() {me.undo(me);};
    this.redo_button.onclick = function() {me.redo(me);};
    this.attempt_button.onclick = function() {me.attempt(me); return false;};
    this.reset_button.onclick = function() {me.reset();};

    this.box_button.onclick = function() {me.select_box(me);};
    this.circle_button.onclick = function() {me.select_circle(me);};
    this.poly_button.onclick = function() {me.select_poly(me);};
    this.container_button.onclick = function() {me.select_container(me);};
    this.blocker_button.onclick = function() {me.select_blocker(me);};
    this.move_button.onclick = function() {me.select_move(me);};
    this.resize_button.onclick = function() {me.select_resize(me);};
    this.erase_button.onclick = function() {me.select_erase(me);};
    this.rename_button.onclick = function() {me.select_rename(me);};

    this.tool_edit_1.onclick = function() {me.set_tool('tool1');};
    this.tool_edit_2.onclick = function() {me.set_tool('tool2');};
    this.tool_edit_3.onclick = function() {me.set_tool('tool3');};
    this.tool1 = null;
    this.tool2 = null;
    this.tool3 = null;
    this.tool_scale_button_1.onclick = function() {
        var sf = parseFloat(me.tool_scale_1.value);
        me.set_tools_size(me.tool1, sf);
        me.tool_scale_1.value = 1;
        me.draw();
        return false;
    };
    this.tool_scale_button_2.onclick = function() {
        var sf = parseFloat(me.tool_scale_2.value);
        me.set_tools_size(me.tool2, sf);
        me.tool_scale_2.value = 1;
        me.draw();
        return false;
    };
    this.tool_scale_button_3.onclick = function() {
        var sf = parseFloat(me.tool_scale_3.value);
        me.set_tools_size(me.tool3, sf);
        me.tool_scale_3.value = 1;
        me.draw();
        return false;
    };

    this.static_mark.checked = true;
    this.color_form.value = "black";
    this.density_form.value = 0;
    this.friction_form.value = 0.5;
    this.elasticity_form.value = 0.5;
    this.static_mark.onclick = function() {me.reset_stasis();};
    this.condition_text.value = "Enter the goal condition text here";

    this.screen.onmousedown = function(e) {me.mouse_down(me, e);};
    document.onmouseup = function(e) {me.mouse_up(me, e);};
    this.screen.onmousemove = function(e) {me.mouse_move(me, e);};

    this.goal_type_select.onchange = function() {me.reset_goal_options();};

    this.reset_goal_options();
};

Builder.prototype.set_tool = function(toolname) {
    var toolscreen = null;
    var toolbutton = null;
    var toolobj = null;
    if (toolname === "tool1") {
        toolscreen = this.tool_screen_1;
        toolbutton = this.tool_edit_1;
        this.tool1 = null;
    } else if (toolname === "tool2") {
        toolscreen = this.tool_screen_2;
        toolbutton = this.tool_edit_2;
        this.tool2 = null;
    } else if (toolname === "tool3") {
        toolscreen = this.tool_screen_3;
        toolbutton = this.tool_edit_3;
        this.tool3 = null;
    }
    if (toolscreen === null) {
        // Reset back to the canvas
        this.screen.onmousedown = function(e) {me.mouse_down(me, e);};
        this.screen.onmousemove = function(e) {me.mouse_move(me, e);};
        if (this.toolscreen !== null) {
            this.toolscreen.onmousedown = function(e) {return;};
            this.toolscreen.onmousemove = function(e) {return;};
        }
        this.tool_edit_1.textContent = "Edit";
        this.tool_edit_2.textContent = "Edit";
        this.tool_edit_3.textContent = "Edit";
        this.tool_edit_1.onclick = function() {me.set_tool('tool1');};
        this.tool_edit_2.onclick = function() {me.set_tool('tool2');};
        this.tool_edit_3.onclick = function() {me.set_tool('tool3');};
        this.select_button(null);
        this.toolscreen = null;
        this.maker = null;
    } else {
        toolobj = null;
        this.screen.onmousedown = function(e) {return;};
        this.screen.onmousemove = function(e) {return;};
        toolscreen.onmousedown = function(e) {me.mouse_down(me, e);};
        toolscreen.onmousemove = function(e) {me.mouse_move(me, e);};
        this.select_button(null);
        this.toolscreen = toolscreen;
        toolscreen.style.borderColor = "green";
        toolbutton.textContent = "Done";
        toolbutton.onclick = function() {me.set_tool(null);};
        this.maker = new PolyHandler();
    }
    this.draw();
};

// Takes a Command and runs it
Builder.prototype.do = function(cmd, is_undo) {
    if (typeof(is_undo) === 'undefined') {is_undo = false;}
    var ctype = cmd.type;
    if (ctype === 'make_circle') {
        this.add_circle(cmd.attr.name, cmd.attr.center, cmd.attr.radius,
            cmd.attr.color, cmd.attr.density, cmd.attr.elasticity, cmd.attr.friction);
        this.reset_name();
    } else if (ctype === 'make_poly') {
        this.add_poly(cmd.attr.name, cmd.attr.vertices, cmd.attr.color,
            cmd.attr.density, cmd.attr.elasticity, cmd.attr.friction);
        this.reset_name();
    } else if (ctype === 'make_compound') {
        this.add_compound(cmd.attr.name, cmd.attr.trilist, cmd.attr.color,
            cmd.attr.density, cmd.attr.elasticity, cmd.attr.friction);
        this.reset_name();
    } else if (ctype === 'make_container') {
        this.add_container(cmd.attr.name, cmd.attr.vertices, cmd.attr.thickness, cmd.attr.color,
            cmd.attr.density, cmd.attr.elasticity, cmd.attr.friction);
        this.reset_name();
    } else if (ctype === 'make_block') {
        this.add_blocker(cmd.attr.name, cmd.attr.vertices);
    } else if (ctype === 'move') {
        var obj = this.object_dict[cmd.attr.obj];
        var dx = cmd.attr.dx;
        var dy = cmd.attr.dy;
        obj.move(dx, dy);
    } else if (ctype === 'resize') {
        var obj = this.object_dict[cmd.attr.obj];
        var newsize = cmd.attr.size;
        obj.resize(newsize);
    } else if (ctype === 'erase') {
        if (cmd.attr.objtype === 'block') {
            delete this.blocker_dict[cmd.attr.name];
        } else {
            delete this.object_dict[cmd.attr.name];
        }
    } else if (ctype === 'rename') {
        this.rename_object(cmd.attr.oldname, cmd.attr.newname);
    }
    if(is_undo) {
        this.redo_stack.push(cmd.reverse());
    } else {
        this.undo_stack.push(cmd.reverse());
    }
    this.draw();
    this.reset_goal_options();

};

Builder.prototype.draw = function() {
    var ctx = this.screen.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,this.screen.width, this.screen.height);
    for (b in this.blocker_dict) {
        this.blocker_dict[b].draw(ctx);
    }
    for (o in this.object_dict) {
        this.object_dict[o].draw(ctx);
    }
    // Draw the tools
    var screen = this.tool_screen_1;
    var ctx = screen.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,screen.width,screen.height);
    if (this.tool1 !== null) {
        this.tool1.draw(ctx);
    }

    var screen = this.tool_screen_2;
    var ctx = screen.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,screen.width,screen.height);
    if (this.tool2 !== null) {
        this.tool2.draw(ctx);
    }
    var screen = this.tool_screen_3;
    var ctx = screen.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,screen.width,screen.height);
    if (this.tool3 !== null) {
        this.tool3.draw(ctx);
    }
};

Builder.prototype.reset = function () {
    this.select_button(null);
    this.undo_stack = [];
    this.redo_stack = [];
    this.selected_button = null;
    this.maker = null;
    this.object_dict = {};
    this.blocker_dict = {};
    this.block_id = 1;
    this.topwall.checked = true;
    this.leftwall.checked = true;
    this.rightwall.checked = true;
    this.bottomwall.checked = true;
    this.init();
    this.draw();
};

// Handles the events in the canvas
Builder.prototype.mpos_in_canvas = function(evt, screen) {
    if (typeof(screen) === 'undefined') {
        screen = this.screen;
    }
    var r = screen.getBoundingClientRect();
    var x = evt.clientX - r.left;
    var y = evt.clientY - r.top;

    if (x < 0 | y < 0 | x > r.width | y > r.height) {
        return null;
    }

    return [x,y];
};

Builder.prototype.current_screen = function() {
    if (this.toolscreen === null) {
        return this.screen;
    } else {
        return this.toolscreen;
    }
};

Builder.prototype.mouse_down = function(me, evt) {
    if (me.maker !== null) {
        me.maker.mouse_down(me.mpos_in_canvas(evt, me.current_screen()), me);
    }
    me.draw();
};

Builder.prototype.mouse_up = function(me, evt) {
    if (me.maker !== null) {
        var mpos = me.mpos_in_canvas(evt, me.current_screen());
        if (mpos !== null) {
            me.maker.mouse_up(me.mpos_in_canvas(evt, me.current_screen()), me);
        } else {
            me.maker.reset();
        }

    }
    me.draw();
};

Builder.prototype.mouse_move = function(me, evt) {
    if (me.maker !== null) {
        if (me.maker.active) {
            me.draw();
            me.maker.draw(me.current_screen().getContext('2d'), me.mpos_in_canvas(evt, me.current_screen()));
        }
    }
}

Builder.prototype.get_clicked = function(mpos) {
    var onms = Object.keys(this.object_dict);
    var bnms = Object.keys(this.blocker_dict);
    var obj;
    for (var i = onms.length-1; i >=0; i--) {
        obj = this.object_dict[onms[i]]
        if (obj.point_in(mpos)) {
            return obj;
        }
    }
    for (var i = bnms.length-1; i >=0; i--) {
        obj = this.blocker_dict[bnms[i]]
        if (obj.point_in(mpos)) {
            return obj;
        }
    }
    return null;
};

// Run file functions
Builder.prototype.get_name = function() {
    return this.nameform.value;
};

Builder.prototype.reset_name = function() {
    var i = 1;
    var nm = "Object" + i;
    while (nm in this.object_dict) {
        i = i + 1;
        nm = "Object" + i;
    }
    this.nameform.value = nm;
};

Builder.prototype.save = function(me) {
    console.log('save!');
    console.log(me.get_name());
    return;
};

Builder.prototype.load = function(me) {
    me.get_file(me._do_load)
    return;
};

Builder.prototype.undo = function(me) {
    var rdcmd = me.undo_stack.pop();
    if (rdcmd !== undefined) {
        me.do(rdcmd, true);
    }
};

Builder.prototype.redo = function(me) {
    var rdcmd = me.redo_stack.pop();
    if (rdcmd !== undefined) {
        me.do(rdcmd);
    }
};

Builder.prototype.attempt = function(me) {
    if (me.check_consistency()) {
        me.attempt_data.value = JSON.stringify(me.to_dict());
        me.attempt_button.submit();
        //return true;
    } else {
        alert("Must have a valid trial with goals and tools to attempt");
    }
    return false;
};

// Command to select a single button & change background
Builder.prototype.select_button = function(button) {
    this.move_button.style.backgroundColor = 'white';
    this.resize_button.style.backgroundColor = 'white';
    this.rotate_button.style.backgroundColor = 'white';
    this.erase_button.style.backgroundColor = 'white';
    this.rename_button.style.backgroundColor = 'white';
    this.box_button.style.backgroundColor = 'white';
    this.circle_button.style.backgroundColor = 'white';
    this.poly_button.style.backgroundColor = 'white';
    this.container_button.style.backgroundColor = 'white';
    this.blocker_button.style.backgroundColor = 'white';
    if (button !== null) {button.style.backgroundColor = 'grey';}
    if (this.toolscreen !== null) {
        this.maker = null;
        this.toolscreen.style.borderColor = "black";
    }
};

// Set up build commands
Builder.prototype.select_circle = function(me) {
    me.select_button(me.circle_button);
    me.maker = new CircleHandler();
};

Builder.prototype.select_box = function(me) {
    me.select_button(me.box_button);
    me.maker = new BoxHandler();
};

Builder.prototype.select_poly = function(me) {
    me.select_button(me.poly_button);
    me.maker = new PolyHandler();
};

Builder.prototype.select_container = function(me) {
    me.select_button(me.container_button);
    me.maker = new ContainerHandler();
};

Builder.prototype.select_blocker = function(me) {
    me.select_button(me.blocker_button);
    me.maker = new BlockHandler();
};

Builder.prototype.select_move = function(me) {
    me.select_button(me.move_button);
    me.maker = new MoveHandler();
};

Builder.prototype.select_resize = function(me) {
    me.select_button(me.resize_button);
    me.maker = new ResizeHandler();
};

Builder.prototype.select_erase = function(me) {
    me.select_button(me.erase_button);
    me.maker = new EraseHandler();
};

Builder.prototype.select_rename = function(me) {
    me.select_button(me.rename_button);
    me.maker = new RenameHandler();
};

// Adds objects to the world
Builder.prototype.add_circle = function(name, center, radius, color, dens, elast, fric) {
    var stat = dens === 0;
    var c = new CircleObject(name, center, radius, color, stat, dens, elast, fric);
    this.object_dict[name] = c;
};

Builder.prototype.add_poly = function(name, vertices, color, dens, elast, fric) {
    var stat = dens === 0;
    var p = new PolyObject(name, vertices, color, stat, dens, elast, fric);

    if (this.toolscreen === null) {
        this.object_dict[name] = p;
    } else {
        if (this.toolscreen === this.tool_screen_1) {
            this.tool1 = p;
        } else if (this.toolscreen === this.tool_screen_2) {
            this.tool2 = p;
        } else if (this.toolscreen === this.tool_screen_3) {
            this.tool3 = p;
        }
        this.set_tool(null);
    }
}

Builder.prototype.add_compound = function(name, trilist, color, dens, elast, fric) {
    var stat = dens === 0;
    var c = new CompoundObject(name, trilist, color, stat, dens, elast, fric);

    if (this.toolscreen === null) {
        this.object_dict[name] = c;
    } else  {
        if (this.toolscreen === this.tool_screen_1) {
            this.tool1 = c;
        } else if (this.toolscreen === this.tool_screen_2) {
            this.tool2 = c;
        } else if (this.toolscreen === this.tool_screen_3) {
            this.tool3 = c;
        }
        this.set_tool(null);
    }
};

Builder.prototype.add_container = function(name, vertices, thickness, color, dens, elast, fric) {
    var stat = dens === 0;
    var c = new ContainerObject(name, vertices, thickness, color, stat, dens, elast, fric);
    this.object_dict[name] = c;
};

Builder.prototype.add_blocker = function(name, vertices) {
    var b = new BlockerObject(name, vertices);
    this.blocker_dict[name] = b;
};

Builder.prototype.add_goal = function(name, vertices, color) {
    var p = new GoalObject(name, vertices, color);
    this.object_dict[name] = p;
}

// Resizes tools (within bounds)
Builder.prototype.set_tools_size = function(tool, scale_factor) {
    if (tool === null) {return;}
    var osize = tool.get_size();
    var nsize = scale_factor * osize;
    tool.resize(nsize);
    var isgood = true;
    if(tool.type === 'poly') {
        for (var i in tool.vertices) {
            var vert = tool.vertices[i];
            if (vert[0] < 0 || vert[0] > 90 || vert[1] < 0 || vert[1] > 90) {
                isgood = false;
            }
        }
    } else {
        for (var i in tool.polylist) {
            var poly = tool.polylist[i];
            for (var j in poly.vertices) {
                var vert = poly.vertices[j];
                if (vert[0] < 0 || vert[0] > 90 || vert[1] < 0 || vert[1] > 90) {
                    isgood = false;
                }
            }
        }
    }
    if (!isgood) {
        tool.resize(osize);
        alert('Resized tool is too big!');
    }
};

// Checks that the world is legal to run through toolpicker
Builder.prototype.check_consistency = function () {
    //There must be three tools
    if (this.tool1 === null | this.tool2 === null | this.tool3 === null) {
        return false;
    }

    // The goal objects must exist (and be distinct)
    if (!this.object_dict.hasOwnProperty(this.goal_obj_1.value)) {
        return false;
    }
    if ((['anyinside', 'anytouch'].indexOf(this.goal_type_select.value) === -1) && !this.object_dict.hasOwnProperty(this.goal_obj_2.value)) {
        return false;
    }
    if (this.goal_obj_1.value == this.goal_obj_2.value) {
        return false;
    }

    return true;
};

// Makes this builder into a dictionary that allows for world loading
Builder.prototype.to_dict = function() {
    var flip = function(p) {return [p[0],this.screen.height-p[1]];};
    // Save the world itself
    var wdict = {
        dims : [this.screen.width, this.screen.height],
        bts : .01,
        gravity : this.get_gravity(),
        defaults : {
            density : 1,
            friction : 0.5,
            elasticity : 0.5,
            color : "black",
            bk_color : "white"
        },
        objects : {},
        blocks : {},
        constraints : {},
    };

    // Go through each of the objects and add to the world dictionary
    for (var onm in this.object_dict) {
        wdict.objects[onm] = this.object_dict[onm].dictify(this.screen.height);
    }
    for (var bnm in this.blocker_dict) {
        wdict.blocks[bnm] = this.blocker_dict[bnm].dictify(this.screen.height);
    }

    // Add walls as needed
    var h = this.screen.height, w = this.screen.width;
    if (this.leftwall.checked) {
        wdict.objects['_LeftWall'] = {
            name : '_LeftWall',
            vertices : [[-1,-1],[-1,h+1],[1,h+1],[1,-1]],
            density : 0,
            elasticity : this.get_elasticity(),
            friction : this.get_friction(),
            color : 'black',
            type : 'Poly'
        };
    }
    if (this.bottomwall.checked) {
        wdict.objects['_BottomWall'] = {
            name : '_BottomWall',
            vertices : [[-1,-1],[-1,1],[w+1,1],[w+1,-1]],
            density : 0,
            elasticity : this.get_elasticity(),
            friction : this.get_friction(),
            color : 'black',
            type : 'Poly'
        };
    }
    if (this.topwall.checked) {
        wdict.objects['_TopWall'] = {
            name : '_TopWall',
            vertices : [[-1,h-1],[-1,h+1],[w+1,h+1],[w+1,h-1]],
            density : 0,
            elasticity : this.get_elasticity(),
            friction : this.get_friction(),
            color : 'black',
            type : 'Poly'
        };
    }
    if (this.rightwall.checked) {
        wdict.objects['_RightWall'] = {
            name : '_RightWall',
            vertices : [[w-1,-1],[w-1,h+1],[w+1,h+1],[w+1,-1]],
            density : 0,
            elasticity : this.get_elasticity(),
            friction : this.get_friction(),
            color : 'black',
            type : 'Poly'
        };
    }

    // Save the goal type
    var goaltype = this.goal_type_select.value;
    if (goaltype === "inside") {
        wdict.gcond = {
            type : "SpecificInGoal",
            obj : this.goal_obj_1.value,
            goal : this.goal_obj_2.value,
            duration : this.get_goal_duration()
        };
    } else if (goaltype === "anyinside") {
        wdict.gcond = {
            type : "AnyInGoal",
            goal: this.goal_obj_1.value,
            obj: "-",
            duration : this.get_goal_duration()
        };
    } else if (goaltype === "touch") {
        wdict.gcond = {
            type : "SpecificTouch",
            obj : this.goal_obj_1.value,
            goal : this.goal_obj_2.value,
            duration : this.get_goal_duration()
        };
    } else if (goaltype === "anytouch") {
        wdict.gcond = {
            type : "AnyTouch",
            obj : "-",
            goal : this.goal_obj_1.value,
            duration : this.get_goal_duration()
        };
    } else {
        assert(false, "Illegal goal type")
    }

    // Load the tools
    var tdict = {};
    var tnames = ["obj1", "obj2", "obj3"];
    var center_tool = function(p) {
        return [p[0]-45, 45-p[1]]
    }

    if(this.tool1 !== null) {
        if (this.tool1.type === 'compound') {
            var newpoly = [];
            for (var i=0; i < this.tool1.polylist.length; i++) {
                newpoly.push(consistent_winding(this.tool1.polylist[i].vertices.map(center_tool)));
            }
            tdict.obj1 = newpoly;
        } else {
            tdict.obj1 = [consistent_winding(this.tool1.vertices.map(center_tool))];
        }
    }
    if(this.tool2 !== null) {
        if (this.tool2.type === 'compound') {
            var newpoly = [];
            for (var i=0; i < this.tool2.polylist.length; i++) {
                newpoly.push(consistent_winding(this.tool2.polylist[i].vertices.map(center_tool)));
            }
            tdict.obj2 = newpoly;
        } else {
            tdict.obj2 = [consistent_winding(this.tool2.vertices.map(center_tool))];
        }
    }
    if(this.tool3 !== null) {
        if (this.tool3.type === 'compound') {
            var newpoly = [];
            for (var i=0; i < this.tool3.polylist.length; i++) {
                newpoly.push(consistent_winding(this.tool3.polylist[i].vertices.map(center_tool)));
            }
            tdict.obj3 = newpoly;
        } else {
            tdict.obj3 = [consistent_winding(this.tool3.vertices.map(center_tool))];
        }
    }

    var successText = this.get_condition_text();

    return {
        world : wdict,
        tools : tdict,
        toolNames: tnames,
        sucText : successText
    };
};

Builder.prototype.load_from_dict = function(full_dict) {
    var _me = this;
    var flip = function(p) {return [p[0],_me.screen.height-p[1]];};
    var wdict = full_dict.world;
    var tdict = full_dict.tools;

    var walls_found = {
        "_LeftWall" : false,
        "_RightWall" : false,
        "_TopWall" : false,
        "_BottomWall" : false
    };

    // Check this is valid before clearing things out
    if (wdict.dims[0] !== this.screen.width | wdict.dims[1] !== this.screen.height) {
        alert("Illegal trial dimensions for this window");
        return;
    }
    var goalcond = wdict.gcond;
    if (["SpecificInGoal", "AnyInGoal", "SpecificTouch", "AnyTouch"].indexOf(goalcond.type) === -1) {
        alert("Illegal goal type: "+goalcond.type);
        return;
    }
    for (var onm in wdict.objects) {
        if (onm in walls_found) {
            walls_found[onm] = true;
        } else {
            var o = wdict.objects[onm];
            if (['Ball','Poly','Compound','Container','Goal'].indexOf(o.type) === -1) {
                alert("Illegal object type: " + o.type);
                return;
            }
        }
    }
    if (!(typeof(goalcond.obj) === "undefined" || goalcond.obj === "-") && !(goalcond.obj in wdict.objects)) {
        alert("Goal object not found: " + goalcond.obj);
        return;
    }
    if ((goalcond.goal !== "-") && !(goalcond.goal in wdict.objects)) {
        alert("Goal object not found: " + goalcond.goal);
        return;
    }

    // Clear existing things out
    this.object_dict = {};
    this.blocker_dict = {};
    this.undo_stack = [];
    this.redo_stack = [];
    this.selected_button = null;
    this.maker = null;
    this.tooscreen = null;
    this.init();

    // remake the world
    for (var onm in wdict.objects) {
        if (!(onm in walls_found)) {
            var o = wdict.objects[onm];
            if (o.type === 'Ball') {
                this.add_circle(onm, flip(o.position), o.radius, o.color, o.density, o.elasticity, o.friction);
            } else if (o.type === 'Poly') {
                this.add_poly(onm, consistent_winding(o.vertices.map(flip)), o.color, o.density, o.elasticity, o.friction);
            } else if (o.type === 'Compound') {
                var polylist = [];
                for (var i in o.polys) {
                    polylist.push(consistent_winding(o.polys[i].map(flip)));
                }
                this.add_compound(onm, polylist, o.color, o.density, o.elasticity, o.friction);
            } else if (o.type === "Container") {
                this.add_container(onm, consistent_winding(o.points.map(flip)), o.width, o.color, o.density, o.elasticity,o.friction);
            } else if (o.type === "Goal") {
                this.add_goal(onm, consistent_winding(o.vertices.map(flip)), o.color);
            }
        }
    }

    this.block_id = 1;
    for (var bnm in wdict.blocks) {
        var b = wdict.blocks[bnm];
        this.add_blocker(bnm, consistent_winding(b.vertices.map(flip)));
        var blocknum = parseInt(bnm.substring(5,bnm.length));
        if (!isNaN(blocknum) && blocknum >= this.block_id) {
            this.block_id = blocknum + 1;
        }
    }

    this.topwall.checked = walls_found["_TopWall"];
    this.leftwall.checked = walls_found["_LeftWall"];
    this.rightwall.checked = walls_found["_RightWall"];
    this.bottomwall.checked = walls_found["_BottomWall"];

    // Re-add the goal condition
    if (goalcond.type === "SpecificInGoal") {
        this.goal_type_select.value = "inside";
        this.reset_goal_options();
        this.goal_obj_1.value = goalcond.obj;
        this.goal_obj_2.value = goalcond.goal;
        this.goal_dur.value = goalcond.duration;
    } else if (goalcond.type === "AnyInGoal") {
        this.goal_type_select.value = "anyinside";
        this.reset_goal_options();
        this.goal_obj_1.value = goalcond.goal;
        this.goal_dur.value = goalcond.duration;
    } else if (goalcond.type === "SpecificTouch") {
        this.goal_type_select.value = "touch";
        this.reset_goal_options();
        this.goal_obj_1.value = goalcond.obj;
        this.goal_obj_2.value = goalcond.goal;
        this.goal_dur.value = goalcond.duration;
    } else if (goalcond.type === "AnyTouch") {
        this.goal_type_select.value = "anytouch";
        this.reset_goal_options();
        this.goal_obj_1.value = goalcond.goal;
        this.goal_dur.avlue = goalcond.duration;
    }

    // Remake the tools
    function uncenter_tool(p) {
        return [p[0]+45, 45-p[1]];
    };

    if ('obj1' in tdict) {
        var t1 = tdict.obj1;
        var t1_polys = [];
        for (var i in t1) {
            t1_polys.push(t1[i].map(uncenter_tool));
        }
        this.tool1 = new CompoundObject("Tool1", t1_polys, "black", true, 0, 0.5, 0.5);
    }

    if ('obj2' in tdict) {
        var t2 = tdict.obj2;
        var t2_polys = [];
        for (var i in t2) {
            t2_polys.push(t2[i].map(uncenter_tool));
        }
        this.tool2 = new CompoundObject("Tool2", t2_polys, "black", true, 0, 0.5, 0.5);
    }

    if ('obj3' in tdict) {
        var t3 = tdict.obj3;
        var t3_polys = [];
        for (var i in t3) {
            t3_polys.push(t3[i].map(uncenter_tool));
        }
        this.tool3 = new CompoundObject("Tool3", t3_polys, "black", true, 0, 0.5, 0.5);
    }

    this.condition_text.value = full_dict.sucText;
    this.reset_name();
    this.draw();
    return;
};

// Resets the goal options
Builder.prototype._make_options = function(optlist) {
    var ostr = "";
    if (optlist.length === 0) {
        return '<option>-</option>'
    }
    for (var i in optlist) {
        var opt = optlist[i];
        ostr += '<option value="' + opt + '">' + opt + "</option>";
    }
    return ostr;
};

Builder.prototype.reset_goal_options = function () {
    var goaltype = this.goal_type_select.value;
    var objs = [];
    var conts = [];
    var anys = [];
    for (var onm in this.object_dict) {
        if (!this.object_dict[onm].static) {
            objs.push(onm);
        }
        if (this.object_dict[onm].type === 'container' || this.object_dict[onm].type === 'goal') {
            conts.push(onm);
        }
        anys.push(onm);
    }
    var go1 = this.goal_obj_1.value;
    var go2 = this.goal_obj_2.value;
    if (goaltype === "inside") {
        this.goal_text_1.textContent = "Object:";
        this.goal_text_2.textContent = "Container:";
        this.goal_obj_2.hidden = false;
        this.goal_obj_1.innerHTML = this._make_options(objs);
        this.goal_obj_2.innerHTML = this._make_options(conts);
        if (objs.indexOf(go1) > -1) {this.goal_obj_1.value = go1;};
        if (conts.indexOf(go2) > -1) {this.goal_obj_2.value = go2;};
        this.goal_dur.value = 3;
    } else if (goaltype === "anyinside") {
        this.goal_text_1.textContent = "Container:";
        this.goal_text_2.textContent = "";
        this.goal_obj_2.hidden = true;
        this.goal_obj_1.innerHTML = this._make_options(conts);
        if (conts.indexOf(go1) > -1) {this.goal_obj_1.value = go1;};
        this.goal_obj_2.value = "";
        this.goal_dur.value = 3;
    } else if (goaltype === "touch") {
        this.goal_text_1.textContent = "Moving object:";
        this.goal_text_2.textContent = "Any object:";
        this.goal_obj_2.hidden = false;
        this.goal_obj_1.innerHTML = this._make_options(objs);
        this.goal_obj_2.innerHTML = this._make_options(anys);
        if (objs.indexOf(go1) > -1) {this.goal_obj_1.value = go1;};
        if (anys.indexOf(go2) > -1) {this.goal_obj_2.value = go2;};
        this.goal_dur.value = 0;
    } else if (goaltype === "anytouch") {
        this.goal_text_1.textContent = "Object:";
        this.goal_text_2.textContent = "";
        this.goal_obj_2.hidden = true;
        this.goal_obj_1.innerHTML = this._make_options(anys);
        if (conts.indexOf(go1) > -1) {this.goal_obj_1.value = go1;};
        this.goal_obj_2.value = "";
        this.goal_dur.value = 0;
    }
};

Builder.prototype.rename_object = function(oldname, newname) {
    var obj = this.object_dict[oldname];
    obj.name = newname;
    delete this.object_dict[oldname];
    this.object_dict[newname] = obj;
}

// Functions for saving / loading

Builder.prototype.get_file = function(callback) {
    this.file_picker.click();
    var me = this;
    function cb() {
        callback(me.file_picker.files[0], me);
        me.file_picker.removeEventListener('change',cb);
    };
    this.file_picker.addEventListener('change', cb, false);
};

Builder.prototype.save = function() {
    var jsondict = this.to_dict();
    var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsondict));
    var anchor = document.createElement('a');
    var fnm = prompt('Enter a file name','');
    if (fnm !== "") {
        anchor.setAttribute('download', fnm+'.json');
        anchor.setAttribute('href', datastr);
        anchor.click();
    }
};

Builder.prototype._do_load = function(fileobj, me) {
    var reader = new FileReader();

    function loaded(evt) {
        var txt = evt.target.result;
        var load_dict = JSON.parse(txt);
        me.load_from_dict(load_dict);
    };
    reader.onload = loaded;

    function err(evt) {
        if(evt.target.error.name == "NotReadableError") {
            alert("File could not be read");
            return;
        } else {
            alert("Unknown error reading file: " + evt.target.error.name);
            return;
        }
    }
    reader.onerror = err;

    reader.readAsText(fileobj);
};

// Functions to get object ancilary attributes (friction, elasticity, etc)
// For now, this just returns default values
Builder.prototype.get_static = function() {
    return this.static_mark.checked;
};

Builder.prototype.reset_stasis = function() {
    if (this.get_static()) {
        this.color_form.value = 'black';
        this.density_form.value = 0;
    } else {
        this.color_form.value = 'blue';
        this.density_form.value = 1;
    }
};

Builder.prototype.get_color = function() {
    if (this.toolscreen === null) {
        return this.color_form.value;
    } else {
        return 'Black';
    }

};

Builder.prototype.get_density = function() {
    if (this.get_static()) {
        return 0;
    } else {
        return this.density_form.value;
    }
};
Builder.prototype.get_friction = function() {return this.friction_form.value;};
Builder.prototype.get_elasticity = function() {return this.elasticity_form.value;};
Builder.prototype.get_thickness = function() {return 5;};
Builder.prototype.get_gravity = function() {return 200;};
Builder.prototype.get_condition_text = function() {return this.condition_text.value;};
Builder.prototype.get_goal_duration = function() {return this.goal_dur.value;};
