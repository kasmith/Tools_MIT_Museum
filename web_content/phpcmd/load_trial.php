<?php

include('server.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

$trnm = $conn->real_escape_string($_POST["trialname"]);

$sql = "SELECT * FROM `trial_list` WHERE `TrialName` = '" . $trnm . "'";
$result = $conn->query($sql);
if ($result->num_rows != 1) {
    echo "Error: Empty or non-unique trial found";
} else {
    $row = $result->fetch_assoc();
    $tdat = $row["TrialData"];
    echo $tdat;
}

$conn->close();

 ?>
