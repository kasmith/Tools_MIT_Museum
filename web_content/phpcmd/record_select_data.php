<?php

include('server.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

// Get POST data
$trial = $conn->real_escape_string($_POST['trial']);
$uid = $conn->real_escape_string($_POST['uid']);
$flag = $conn->real_escape_string($_POST['flag']);
$data = $conn->real_escape_string($_POST['data']);
$toolselects = $conn->real_escape_string($_POST['toolselects']);
$resetselects = $conn->real_escape_string($_POST['resetselects']);
$success = $conn->real_escape_string($_POST['success']);

if ($uid === "") {
    $uid = "UNKNOWN";
}

if ($flag === "") {
    $flag = "UNCATEGORIZED";
}


$insert_sql = "INSERT INTO `responses_tool_select` (`TrialName`, `UserID`, `Flags`, `Data`, `ResetHits`, `ToolSelections`, `Succeeded`)";
$insert_sql .= " VALUES ('" . $trial . "', '" . $uid . "', '" . $flag . "', '" . $data . "', '" . $resetselects . "', '"  . $toolselects . "', " .  $success . ");";

if ($conn->query($insert_sql) === TRUE) {
    echo "success";
} else {
    echo "Recording failed: " . $conn->error . "<br>" . $insert_sql;
}

 ?>
