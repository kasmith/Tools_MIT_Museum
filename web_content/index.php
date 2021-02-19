<?php

session_start();

include 'phpcmd/server.php';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

$sql = "SELECT `TrialName`, `Creator`, `Rating`, `Difficulty`, `TrialData`  FROM `trial_list` ORDER BY `TrialName` ASC";
$result = $conn->query($sql);

$trialnames = array();
$creators = array();
$ratings = array();
$difficulties = array();
$tdata = array();

if ($result->num_rows > 0) {
    $i = 0;
    while($row = $result->fetch_assoc()) {
        $tnm = $row["TrialName"];
        $trialnames[$i] = $tnm;
        $creators[$tnm] = $row['Creator'];
        $ratings[$tnm] = $row['Rating'];
        $difficulties[$tnm] = $row['Difficulty'];
        $tdata[$tnm] = $row['TrialData'];
        $i += 1;
    }
} else {
    echo "Error - no trials found in the database";
}

function makeselect($tnms) {
    $ret = "";
    foreach ($tnms as $nm) {
        $ret .= "<option>" . $nm . "</option>";
    }
    return $ret;
}

if ($_SESSION['successes'] === NULL) {
    $_SESSION['successes'] = [];
}

function makeTable($tnms, $crs, $rats) {
    $ret = "";
    $successes = $_SESSION['successes'];
    foreach ($tnms as $nm) {
        $ret .= "<tr><td>" . $nm . "</td><td>" . $crs[$nm];
        $ret .= "</td><td><button onclick=\"moveon('" . $nm ."')\" class=\"btn-link\">Select</button></td><td>";
        $ret .= "<button onclick=\"doedit('" . $nm . "')\" class=\"btn-link\" style=\"color: grey;\">Edit</button></td><td>";
        if (in_array($nm, $successes, TRUE)) {
            $ret .= "<img src=\"images/check.png\" alt=\"You got this!\">";
        }
        $ret .= "</td></tr>";
    }
    return $ret;
}

function makeDataArray($tnms, $trdats) {
    $ret = "{";
    foreach ($tnms as $nm) {
        $ret .= "'" . $nm . "':'" . $trdats[$nm] . "',";
    }
    $ret .= "}";
    return $ret;
};

?>

<link rel=stylesheet href="css/bootstrap.min.css" type="text/css">
<link rel=stylesheet href="css/gwstyle.css" type="text/css">
<script src="js/jquery-3.1.0.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/php_helpers.js" type="text/javascript"></script>

<script>
var uname = getName();
var trialdata = <?php echo makeDataArray($trialnames, $tdata); ?>;

function moveon(trnm) {
    var mf = document.getElementById('moveform');
    var ipt = document.getElementById('nameinput');
    ipt.value = trnm;
    mf.submit();
};

function doedit(trnm) {
    //document.getElementById('trdata').value = trialdata[trnm];
    //document.getElementById('makebuttoncl').click();
    console.log('Editing disabled')

};
</script>

<html>
<head>
    <title>Tool games loading page</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

<div id="container" style="width: 600px; margin: auto;">

<h2 style="text-align: center;">Choose a level to load</h2>

<br>
<table class="table-hover" style="text-align: left;">
    <thead>
        <tr>
            <th class="col-md-4" style="padding-left: 0px;">Trial Name</th>
            <th class="col-md-4" style="padding-left: 0px;">Creator</th>
            <th class="col-md-2" style="padding-left: 0px;"></th>
            <th class="col-md-2" style="padding-left: 0px;"></th>
            <th class="col-md-2" style="padding-left: 0px;"></th>
        </tr>
    </thead>
    <tbody>
        <?php echo makeTable($trialnames, $creators, $ratings); ?>
    </tbody>
</table>

<br>

<div id="makebutton" class="row">
    <div class="col-xs-5"></div>
    <div class="col-xs-2">
        <form action="levelmaker.php" method="post">
            <input id="makebuttoncl" type="submit" value="Make your own!" hidden>
            <input id="trdata" type="text" name="trdata" value="" style="display: none;">
        </form>
    </div>
    <div class="col-xs-5"></div>
</div>

<form id="moveform" action="playground.php" method="post" style="display: none">
    <input id="nameinput" type="text" name="trname">
</form>

</div>
</body>
</html>
