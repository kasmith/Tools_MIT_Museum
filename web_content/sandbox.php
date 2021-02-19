
<link rel=stylesheet href="css/bootstrap.min.css" type="text/css">
<link rel=stylesheet href="css/gwstyle.css" type="text/css">
<script src="js/jquery-3.1.0.min.js" type="text/javascript"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/PhysicsGaming.min.js" type="text/javascript"> </script>
<script src="js/GameWorld.js" type="text/javascript"></script>
<script src="js/php_helpers.js" type="text/javascript"></script>


<html>
    <head>
        <title>Physics Gaming Test Pad</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>

        <div id="fullcontainer" class="col-lg-12" style="width: 740px;">

            <div id="successtext">Loading...</div>

            <div id="gametable">

                <canvas id="gamescreen" height="600" width="600"></canvas>

                <div id="buttons">
                    <canvas id="obj1" class="SelectButton" height="90" width="90"></canvas>
                    <canvas id="obj2" class="SelectButton" height="90" width="90"></canvas>
                    <canvas id="obj3" class="SelectButton" height="90" width="90"></canvas>

                    <img id="resetbutton" src="images/reset.png" alt="Reset"></img>

                    <div class="spacer"></div>

                    <div class="notif">
                        <span class="notetext">Remaining:</span>
                        <span id="remtime" class="notetext">-</span>
                    </div>

                    <div class="notif" style="display: none;">
                        <span class="notetext">Score:</span>
                        <span id="score" class="notetext">0</span>
                    </div>
                </div>

            </div>

            <br>


            <div id="retbutton" class="row">
                <div class="col-xs-5"></div>
                <div class="col-xs-2">
                    <form action="levelmaker.php" method="post">
                        <textarea rows="0" cols="0" id="trdata" name="trdata" style="display: none;"></textarea>
                        <textarea rows="0" cols="0" id="sucval" name = "has_success" style="display: none;">false</textarea>
                        <input type="submit" value="Return">
                    </form>
                </div>
                <div class="col-xs-1" id="sucspot"></div>
                <div class="col-xs-4"></div>
            </div>

            <div id="mpos" style="display: none;"></div>

        </div>
        <br>
        <div id="submitdiv" style="visibility: hidden;">
        <form class="file_object" id="trinfo" action="community_levels.php" method="post">
            Trial Name: <input type="text" name="tr_name" id="tr_name"><br>
            Creator Name: <input type="text" name="cr_name" id="cr_name"><br>
            Password: <input type="text" name="pass" id="pass"><br>
            <input type="submit" value="Submit" id="do_submit">
        </form>
        </div>

    </body>

    <script>
        // Set up the ability to submit items

        var sub_form = document.getElementById('trinfo');
        var tr_name = document.getElementById('tr_name');
        var creator = document.getElementById('cr_name');
        creator.value = getName();
        var pw = document.getElementById('pass');
        var trdata = '<?php echo $_POST["trdata"]; ?>';
        sub_form.onsubmit = function() {return submitForm(tr_name.value, creator.value, pw.value, trdata);};

        document.getElementById("trdata").value = trdata;
        var success_val = document.getElementById("sucval");
        var success_spot = document.getElementById("sucspot");
        if (trdata === "") {
            alert("No data passed!");
        } else {
            function setWin(gameworld) {
                document.getElementById("submitdiv").style.visibility = "";
                success_val.value = "true";
                success_spot.innerHTML = '<img src="images/check.png" alt="All good!">';
            };
            var canv = document.getElementById('gamescreen');
            var tr = JSON.parse(trdata);
            var gw = loadToolPickerFromJSON(tr, 'gamescreen', 'resetbutton', 'remtime', 'successtext');
            gw.setWinCallback(setWin);
            gw.draw();
        }

    </script>
</html>
