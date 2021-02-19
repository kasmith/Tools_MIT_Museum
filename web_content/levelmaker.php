<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->

<link rel=stylesheet href="css/gwstyle.css" type="text/css">
<link rel=stylesheet href="css/builderstyle.css" type="text/css">
<script src="js/jquery-3.1.0.min.js" type="text/javascript"></script>
<script src="js/PhysicsGaming.js" type="text/javascript"> </script>
<script src="js/GameWorld.js" type="text/javascript"></script>
<script src="js/builder.js" type="text/javascript"></script>
<script src="js/php_helpers.js" type="text/javascript"></script>

<html>
    <head>
        <title>Physics Gaming Trial Maker</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>

        <div id="builder">
            <div id="builder_top" height="620" width="1040">
                <div id="file_menu" class="container" height="600" width="200">
                    <br>
                    <form class="file_object" id="attempt_form" action="sandbox.php" method="post">
                        <textarea rows="0" cols="0" id="attempt_data" name="trdata" style="display: none;"></textarea>
                        <input type="submit" value="Attempt Trial" id="file_attempt">
                    </form>
                    <br><br>
                    <form class="file_object">
                        Object Name:<br>
                        <input type="text" name="object_name" id="object_name">
                    </form>
                    <br><br>
                    <button class="file_object" id="file_save">Save</button>
                    <br><br>
                    <button class="file_object" id="file_load">Load</button>
                    <br><br>
                    <input type="file" name="file_picker" id="file_picker" style="display: none;" />
                    <button class="file_object" id="file_undo">Undo</button>
                    <br><br>
                    <button class="file_object" id="file_redo">Redo</button>
                    <br><br>
                    <button class="file_object" id="file_reset">Reset</button>
                    <br><br>
                    <textarea rows="6" cols="25" id="goal_cond_text">Enter the goal condition text here</textarea>
                    <br><br>
                    <form action="community_levels.php" method="post">
                        <input type="submit" value="Return">
                    </form>
                </div>
                <canvas id="build_screen" height="600" width="600"></canvas>
                <div id="options" class="container" height="600" width="200">
                    <div id="tool_div_1" class="tool_div" height="100" width="180">
                        <canvas class="tool_canv" id="tool_1" height="90" width="90" style="float: left;"></canvas>
                        <div class="tool_options" style="float: left;"><br>
                            <button class="tool_button" id="tool_button_1">Edit</button><br><br>
                            <form>
                                <input type="number" id="tool_scale_1" min="0.1" max="10" value="1" step="0.1" style="width: 3em;">
                                <input type="submit" value="Scale" id="tool_scale_button_1">
                            </form>
                        </div>
                    </div>
                    <div id="tool_div_2" class="tool_div" height="100" width="180">
                        <canvas class="tool_canv" id="tool_2" height="90" width="90" style="float: left;"></canvas>
                        <div class="tool_options" style="float: left;"><br>
                            <button class="tool_button" id="tool_button_2">Edit</button><br><br>
                            <form>
                                <input type="number" id="tool_scale_2" min="0.1" max="10" value="1" step="0.1" style="width: 3em;">
                                <input type="submit" value="Scale" id="tool_scale_button_2">
                            </form>
                        </div>
                    </div>
                    <div id="tool_div_3" class="tool_div" height="100" width="180">
                        <canvas class="tool_canv" id="tool_3" height="90" width="90" style="float: left;"></canvas>
                        <div class="tool_options" style="float: left;"><br>
                            <button class="tool_button" id="tool_button_3">Edit</button><br><br>
                            <form>
                                <input type="number" id="tool_scale_3" min="0.1" max="10" value="1" step="0.1" style="width: 3em;">
                                <input type="submit" value="Scale" id="tool_scale_button_3">
                            </form>
                        </div>
                    </div>
                    <br>
                    <div>
                        Goal Type:<br>
                        <select id="goal_type">
                            <option value="inside">Inside</option>
                            <option value="anyinside">Any Inside</option>
                            <option value="touch">Touch</option>
                            <option value="anytouch">Any Touch</option>
                            <!-- <option value="touch">Touch</option> TO IMPLEMENT LATER-->
                        </select>
                        <br>
                        <span id="goal_text_1">Object:</span><br>
                        <select id="goal_obj1">
                            <option>-</option>
                        </select>
                        <br>
                        <span id="goal_text_2">Container:</span><br>
                        <select id="goal_obj2">
                            <option>-</option>
                        </select>
                        <br>
                        Goal Duration: <input type="number" name="goal_dur" id="goal_dur" min="0" max="10" value="3">
                    </div>
                    <br>
                    <div>
                        <form>
                            Is static? <input type="checkbox" name="static_check" value="static" checked id="static_mark">
                            <br>
                            Color <select id="color_select">
                                <option value="black">Black</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="yellow">Yellow</option>
                                <option value="red">Red</option>
                            </select>
                            <input type="number" name="density" id="density_form" min="0" value="0" style="width: 3em; display: none;" disabled>
                            <input type="number" name="friction" id="friction_form" min="0" value="0.5" style="width: 3em; display: none;" disabled>
                            <input type="number" name="elasticity" id="elasticity_form" min="0" value="0.5" style="width: 3em; display: none;" disabled>
                        </form>
                    </div>
                </div>
            </div>
            <div id="selections" class="container">
                <div id="select_tools" height="90" width="90">
                    <div id="select_move" class="selector"><img src="images/move.png" height="40" width="40"></div>
                    <div id="select_resize" class="selector"><img src="images/resize.png" height="40" width="40"></div>
                    <div id="select_rotate" class="selector" style="display: none;"><img src="images/rotate.png" height="40" width="40"></div>
                    <div id="select_erase" class="selector"><img src="images/eraser.png" height="40" width="40"></div>
                    <div id="select_rename" class="selector"><img src="images/rename.png" height="40" widht="40"></div>
                </div>
                <div>
                    <div id="draw_box" class="draw"><img src="images/box.png" height="90" width="90"></div>
                    <div id="draw_circle" class="draw"><img src="images/ball.png" height="90" width="90"></div>
                    <div id="draw_poly" class="draw"><img src="images/poly.png" height="90" width="90"></div>
                    <div id="draw_container" class="draw"><img src="images/goal.png" height="90" width="90"></div>
                    <div id="draw_blocker" class="draw"><img src="images/block.png" height="90" width="90"></div>
                </div>
                <div>
                    <form>
                        Walls:
                        Top <input type="checkbox" name="topwall" id="check_topwall" value="topwall" checked="checked">
                        Left <input type="checkbox" name="leftwall" id="check_leftwall" value="leftwall" checked="checked">
                        Right <input type="checkbox" name="rightwall" id="check_rightwall" value="rightwall" checked="checked">
                        Bottom <input type="checkbox" name="bottomwall" id="check_bottomwall" value="bottomwall" checked="checked">
                    </form>
                </div>
            </div>
        </div>

    </body>

    <script>

        var has_success = "<?php echo $_POST['has_success']; ?>";
        var trdata = '<?php echo $_POST["trdata"]; ?>';

        var builder = new Builder();

        builder.init();

        if (trdata !== "") {
            builder.load_from_dict(JSON.parse(trdata));
        }

    </script>
</html>
