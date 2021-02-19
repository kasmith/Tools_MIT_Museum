<?php

session_start();

$do_set = $_POST['doset'];

if ($do_set === "TRUE") {
    $_SESSION['progress'] = $_POST['progress'];
    $_SESSION['rem_trials'] = $_POST['rem_trials'];
    $_SESSION['score'] = $_POST['score'];
}

echo "{\"progress\": \"" . $_SESSION['progress'] . "\", \"rem_trials\": ". $_SESSION['rem_trials'].
    ", \"score\": " . $_SESSION['score'] . "}";

 ?>
