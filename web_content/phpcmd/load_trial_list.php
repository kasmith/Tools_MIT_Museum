<?php

include('server.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

$qry = "SELECT (`TrialName`) FROM `trial_list` WHERE Creator='Core';";
$result = $conn->query($qry);

$trialnames = array();
$rstr = "[\"";
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $rstr .= $row["TrialName"] . "\"";
    while($row = $result->fetch_assoc()) {
        //$trialnames[$i] = $row["TrialName"];
        //$i += 1;
        $rstr .= ", \"" . $row["TrialName"] . "\"";
    }
    $rstr .= "]";
} else {
    die("Error - no trials found in the database");
}

//$json_list = json_encode($trialnames);
//echo $json_list;
echo $rstr

?>
