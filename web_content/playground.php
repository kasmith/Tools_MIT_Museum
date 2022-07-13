<?php

include('phpcmd/server.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

$sql = "SELECT `TrialName`, `TrialData` FROM `trial_list`";
$result = $conn->query($sql);

$trialnames = array();
$trialinfo = array();

if ($result->num_rows > 0) {
    $i = 0;
    while($row = $result->fetch_assoc()) {
        $trialnames[$i] = $row["TrialName"];
        $trialinfo[$row["TrialName"]] = $row["TrialData"];
        $i += 1;
    }
} else {
    echo "Error - no trials found in the database";
}

// Get session data -- trial name
$trnm = $_POST["trname"];
$trdat = $trialinfo[$trnm];
 ?>

<link rel=stylesheet href="css/bootstrap.min.css" type="text/css">
<link rel=stylesheet href="css/gwstyle.css" type="text/css">
<script src="js/jquery-3.1.0.min.js" type="text/javascript"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/PhysicsGaming.js" type="text/javascript"> </script>
<script src="js/GameWorld.js" type="text/javascript"></script>
<script src="js/php_helpers.js" type="text/javascript"></script>

<script>
var trdata = <?php echo $trdat; ?>;
var trname = "<?php echo $trnm; ?>";
</script>


<html>
    <head>
        <title>Physics Gaming Test Pad</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <div class="container">
        <div id="fullcontainer" class="col-lg-12">

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

                    <div class="notif">
                        <span class="notetext">Score:</span>
                        <span id="score" class="notetext">0</span>
                    </div>
                </div>

            </div>

            <div id="instructtext">
              Tap on an object on the right to select it, then tap on the screen where you want to drop the object.
            </div>

            <br>

            <div id="retbutton" class="row">
                <div class="col-xs-5"></div>
                <div class="col-xs-2">
                <a href="index.php" id="retpress" class="btn btn-default" style="text-align: center;">Return</a>
                </div>
                <div class="col-xs-5"></div>
            </div>

            <div id="mpos" style="display: none;"></div>

        </div>
      </div>

    </body>

    <script>
        function set_score() {
            var score = countSuccesses();
            document.getElementById("score").innerHTML = score;
        };

        set_score();

        var canv = document.getElementById('gamescreen');
        var gw = loadToolPickerFromJSON(trdata, 'gamescreen', 'resetbutton', 'remtime', 'successtext');
        gw.draw();
        gw.setWinCallback(function(gwc) {
            recordSuccess(trname);
            set_score();
        });

        var dnr = false;

        var name = getName();
        var flag = getFlag();

        function record_results() {
            var actdat = JSON.stringify(gw.action_record);
            var tooldat = JSON.stringify(gw.tool_record);
            var resdat = JSON.stringify(gw.reset_record);
            var wassuc = gw.was_successful ? "TRUE" : "FALSE";
            if (!dnr) {
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "phpcmd/record_select_data.php",
                    data: "trial="+trname+"&uid="+name+"&flag="+flag+"&data="+actdat+"&toolselects="+tooldat+"&resetselects="+resdat+"&success="+wassuc,
                    dataType: "text",
                    success: function(d) {
                        if (d !== "success") {
                            alert(d);
                        }
                    },
                    error: function(xhr, textStatus, error) {
                        console.log('here');
                        alert("Failed to record data properly\n"+xhr.statusText+'\n'+textStatus+'\n'+error);
                    }
                })
            }

            return true;
        };
        document.getElementById("retpress").onclick = record_results;
    </script>
</html>
