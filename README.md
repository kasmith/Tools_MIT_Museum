# Virtual Tools handoff for MIT museum

This should include the code required to run the online version of Virtual Tools as found through the the (website)[http://scripts.mit.edu/~k2smith/toolgames/]. Note that this excludes code for executing the experiments or modeling.

## Setup

Below are instructions to start up the Virtual Tools game on a local machine. They are a bit involved because they use programs intended to work over the internet (SQL databases and PHP/HTML/JavaScript); however, this should make it relatively easy to set up to record over a network, or host on a website.

### Creating the database

The first part of the setup is recreating a database with the levels and structure to record data. This database is stored in the `tools_mit_museum.sql` file in the root directory, but must be loaded into an SQL server. If you have a pre-existing SQL server, you should be able to import that file to a new database (e.g., called 'tools_mit_museum').

If you do not have a pre-existing SQL server, you will need to install one locally. An easy way to do this is with (MySQL)[https://www.mysql.com/]. This will allow you to host an SQL server on your own computer. If you use this, you may need to set up the database to use "Legacy Password Encryption". Then you can use a SQL browser such as (Sequel Ace)[https://github.com/Sequel-Ace] to connect to that database on the `127.0.0.1:3306`, and import the `tools_mit_museum.sql` file into the database.

### Setting up the PHP database connections

Once you have the database set up, you will need to tell the program where that database is located. To do this, all you will need to do is edit the `web_content/phpcmd/server.php` file. It is currently set up assuming that it is using a local MySQL database with the default username (`root`), and a password of `localsql`. However, this may vary depending on where / how you set up the database.

### Starting up PHP

In order to run the Virtual Tools game, your system must be able to run PHP. If you do not already have it, you can download the (code here)[https://www.php.net/].

Once you have installed PHP, navigate to `Tools_MIT_Museum/web_content` in a terminal, then start a PHP server (e.g., using `php -S 0.0.0.0:8000`). Then open a web browser and go to the address (`0.0.0.0:8000`)[http://0.0.0.0:8000/].

## Virtual Tools Game parts

The default site that this program brings up is the same as the main (Virtual Tools Game site)[http://scripts.mit.edu/~k2smith/toolgames/], snapshotted as of 2/18/21. Here you can select which level you want to play from a selection of those used in the paper, along with a set of other levels used for follow-up experiments and testing.

We have also included an extensible set of levels that can be accessed through (`community_levels.php`)[http://0.0.0.0:8000/community_levels.php]. These are levels built with a "level editor", that can be accessed by clicking on "edit" on that page, or the "Build your own" button at the bottom of the list.

While the level editor is not particularly well documented and missing some of the more recent features built into the game, it does demonstrate how a level designer in the museum could work. When designing each level, at a bare minimum you will need to create the three tools, as well as a goal area (using a container) and an object that should go into that goal. Once the level is built, it must be solvable to be recorded -- you can ensure this by clicking on "Attempt Trial" in the upper left corner to play the level. Once you have accomplished the goal a form will open up for you to name the level and record it. This form also has a password that we put in place to ensure people we didn't know couldn't flood the database (since it is open to the internet) -- this password is `cocosci`.

## Making new levels from scripts

If you are interested in creating additional levels, we find that we have the most control when making them from scripts. Included here is the `MakeTrials/makeTrials_sample.js` script that has examples from the levels we have used.

Creating a new level consists of five steps (see, e.g., lines 78-98 of the script):

(1) Define a new world. Generally this will consist of setting a file name, then making a new PhysicsGaming.World object, using `new pg.World([600, 600], 200)`. The `[600, 600]` argument tells us that it will be a 600x600px size, and the `200` argument defines the strength of gravity (which is standard now for all worlds).

(2) Populate the world with objects. These are methods on the World, including:

* `addBox(name, [xmin, ymin, xmax, ymax], color, density)`: adds a rectangular object to the world, with extents defined by the x / y min / max
* `addPoly(name, vertex_list, color, density)`: add an arbitrary convex polygon to the world
* `addBall(name, pos, radius, color, density)`: adds a circle to the world
* `addContainer(name, vertex_list, segment_width, inner_color, outer_color, density)`: adds a container to the world that can act as a goal area. The container will consist of a set of line segments connecting the points in `vertex_list`, where each of those segments will have `segment_width`
* `addPolyGoal(name, vertex_list, color)`: similar to `addPoly`, but instead of placing a solid object, makes a goal area
* `addBoxGoal(name, [xmin, ymin, xmax, ymax], color)`: similar to `addBox`, but instead adds a goal area
* `addBlock(name [xmin, ymin, xmax, ymax], color)`: similar to `addBox`, but instead adds an area that objects can move through, but that tools cannot be placed in

Note that `name` is an object identifier (used later to set up goal conditions). Also, `density` will generally either be set to `0` for static, immobile objects, or `1` for all other objects that can move.

(3) Set the goal condition. These methods include:

* `attachAnyInGoal(goal_name, duration, exclusions=[])`: sets the win condition to be if any object enters the area defined by the object `goal_name` for `duration` seconds. The `exclusions` argument lets certain objects (given by the `name` identifiers above) to be excluded.
* `attachSpecificInGoal(goal_name, obj_name, duration)`: sets the win condition to be if the `obj_name` objects stays in the area defined by `goal_name` for `duration` seconds.
* `attachManyInGoal(goal_name, obj_list, duration)`: like `attachSpecificInGoal`, except now `obj_list` is a list of `obj_name` allowing for multiple possible defined objects

(4) Define the tools. This should always be a dictionary with three entries (`obj1`, `obj2`, `obj3`) that themselves are lists of vertex lists, where each of the individual vertex lists defines a convex polygon that is part of the tool. See the `myTools` dictionary on line 20 for examples, and a set of cannonical tools that we typically use.

(5) Save the level. This uses the function from `ToolsGaming` called `ToolPicker.Save(filename, PhysicsGaming.World, tools, description)`, where the world and tools are defined above, and the description is the text that will appear at the top of the game world.

### Testing new levels

Once you have made a new level in the script, the output is a JSON file. The easiest way to test these is to go to the editor through the (community levels)[http://0.0.0.0:8000/community_levels.php] and click the `Load` button.

One you are satisfied with the level and want to add it as a permanent level, you'll have to edit the `trial_list` table from the database, and add another row with the output JSON as the `TrialData`.

## Program structure

### The baseline world structure

The "guts" of the Virtual Tools Game is a set of code defined in the `PhysicsGaming` folder. This is a wrapper around the Chipmunk 2D physics engine that defines the allowable objects, and sets up the goals and relationships to run the level and test whether it has been solved. The most important parts of this code are the `PGWorld` object definition and its methods (to create objects, set goals, etc.), as well as the `loadFromDict` function that takes a JavaScript dictionary (pulled from the database) and turns it into a defined `PGWorld` object.

This code as written to be run locally with `node.js` (so that it could be used for modeling as well), which means that it needs to be adapted to run on the web. This has already been done, but if anything changes in the PhysicsGaming code (unlikely), it can be rebuild with the `installGaming.sh` script (so long as you have the (browserify)[http://browserify.org/] and (minify)[https://www.npmjs.com/package/minify] packages). This will create the `/web_content/js/PhysicsGaming.js` file and associated minified version.

There is also a `ToolsGaming` folder that contains a wrapper around `PhysicsGaming` objects for making and saving levels. Here this is only used in trial creation for the `ToolPicker.save` method (see above section).

### Online game structure

Most of the code that runs the Virtual Tools Game online (including defining "tools", taking in user input, running success scripts, etc.) is in the `/web_content/js/GameWorld.js` file. The core of this code is the `GameWorld` object which has a number of methods to interact with the HTML to get user input, draw things back to the screen, and run the `PGWorld`. This requires a number of HTML elements that the `GameWorld` can interact with, that have to be specifically defined (see `web_content/playground.php` for an example of the HTML structure and javascript used to load a `GameWorld`).

Other than the constructor, important methods attached to the `GameWorld` object include:

* `setWinCallback(callback)`: takes in a function that must take the `GameWorld` as an argument; this function will be called when the goal condition is met (e.g., the red ball stays in the green goal)
* `draw()`: draws the current state of the `PGWorld` onto the associated HTML canvas
* `drawTools()`: draws each of the tools on their associated canvases
* `run(this, startrun)`: starts the `PGWorld` physics up; by default called after a tool is placed
* `reset()`: resets the world back to its original state; by default is called when the reset button is clicked.
* `placeObject(shape, pos, runAfter=true)`: puts a tool with vertices defined by `shape` at place `pos`. If `runAfter` is set to true, calls the `run()` method afterwards
* `onMouseOver(mpos, this)`: a function that checks whether a mouse is moving over the HTML canvas screen, and if there is a tool clicked, draws an outline of that tool
* `onMouseDown(mpos, this)`: if the HTML canvas screen is clicked, checks whether there is an active tool, and if it is located in an allowable position, places that tool and starts physics

In addition, the `GameWorld` records player actions to associated lists including:

* `action_record`: record of actual tool placements, consisting of tuple of [tool name, position, time since start]
* `tool_record`: record of when a tool is clicked, including tuple of [tool name, time since start]
* `reset_record`: record of when the reset button is clicked (as time since start)

Finally, this is supported by `ToolButton` objects that control the individual tools and pass information to the parent `GameWorld` when they are clicked to set those tools as active.

### Database recording

To keep track of the actions people take in this game, we record to the `responses_tool_select` table of the database. A function that does the recording can be found on line 122 of `playground.php`. Note that this only gets recorded when people click `Return` after playing around in the game. This table keeps track of:

* `TrialName`: the name of the trial the data comes from
* `UserID`: an identifier (in this case, the name input upon entering the page)
* `Flags`: a categorizer for the experiment this comes from (typically `UNCATEGORIZED` if not in an experiment)
* `Timestamp`: when the record was made
* `Data`: the data recorded in `GameWorld.action_record`
* `ResetHits`: the data recorded in `GameWorld.reset_record`
* `ToolSelections`: the data recorded in `GameWorld.tool_record`
* `Succeeded`: boolean flag to test if the player accomplished the goal
