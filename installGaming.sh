#!/bin/sh

echo "var pg = require('PhysicsGaming'); loadFromDict = pg.loadFromDict;" > tmp.js
browserify tmp.js -o web_content/js/PhysicsGaming.js
minify web_content/js/PhysicsGaming.js > web_content/js/PhysicsGaming.min.js
rm tmp.js
