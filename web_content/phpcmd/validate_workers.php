<?php

include('server.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

$id = $conn->real_escape_string($_POST['id']);
$action = $_POST['action'];

$find_sql = "SELECT `WorkerID` FROM `worker_approvals` WHERE `WorkerID` = '" . $id ."'";
$find_result = $conn->query($find_sql);

if ($find_result->num_rows > 0) {
    if ($action === "delete") {
        $del_sql = "DELETE FROM `worker_approvals` WHERE `WorkerID` = '" . $id . "'";
        if ($conn->query($del_sql) === TRUE) {
            echo "Worker deleted";
        } else {
            echo "Deletion failed: " . $conn->error;
        }
    } else {
        echo "Approved";
    }
} else {
    if ($action === "add") {
        $add_sql = "INSERT INTO `worker_approvals` (`WorkerID`) VALUES ('" . $id . "')";
        if ($conn->query($add_sql) === TRUE) {
            echo "Worker added";
        } else {
            echo "Recording failed: " . $conn->error;
        }
    } else {
        echo "Worker not found";
    }
}

 ?>
