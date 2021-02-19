<?php

include('phpcmd/server.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("SQL Connection failed: " . $conn->connect_error);
}

// Get POST data
$trnm = $conn->real_escape_string($_POST["trialname"]);
$author = $conn->real_escape_string($_POST["author"]);
$trdata = $conn->real_escape_string($_POST["trialdata"]);
$pw = $conn->real_escape_string($_POST["password"]);

if (($pw === "cocosci") || ($pw === "CBMM")) {

    // Check that a trial with that name doesn't already exist
    $tr_sql = "SELECT * FROM `community_trial_list` WHERE `TrialName` = '" . $trnm . "'";
    $tr_result = $conn->query($tr_sql);
    if ($tr_result->num_rows > 0) {
        echo "Error: trial with that name already found";
    } else {
        // Figure out the trial index to use
        $max_sql = "SELECT MAX(`Index`) AS `MAXN` FROM `community_trial_list`";
        $max_result = $conn->query($max_sql);
        if ($max_result->num_rows > 0) {
            $row = $max_result->fetch_assoc();
            $idx = $row["MAXN"] + 1;
        } else {
            echo "Error - database not found";
        }

        $insert_sql = "INSERT INTO `community_trial_list` (`Index`, `TrialName`, `Creator`, `TrialData`)";
        $insert_sql .= " VALUES (" . $idx . ", '" . $trnm . "', '" . $author . "', '" . $trdata . "');";

        if ($conn->query($insert_sql) === TRUE) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $insert_sql . "<br>" . $conn->error;
        }
    }

} else {
    echo "Incorrect password - cannot add trial";
}

$conn->close();

 ?>
