<?php

session_start();

$do_set = $_POST['doset'];

if ($do_set === "TRUE") {
    if (isset($_POST['current_page'])) {
        $_SESSION['current_page'] = $_POST['current_page'];
    }
    if (isset($_POST['rem_pages'])) {
        $_SESSION['rem_pages'] = $_POST['rem_pages'];
    }
    if (isset($_POST['page_phase'])) {
        $_SESSION['page_phase'] = $_POST['page_phase'];
    }
    if (isset($_POST['rem_trials'])) {
        $_SESSION['rem_trials'] = $_POST['rem_trials'];
    }
    if (isset($_POST['score'])) {
        $_SESSION['score'] = $_POST['score'];
    }
}

echo "{\"current_page\": \"" . $_SESSION['current_page'] .
    "\", \"rem_pages\": ". $_SESSION['rem_pages'] .
    ", \"page_phase\": \"". $_SESSION['page_phase'] .
    "\", \"rem_trials\": ". $_SESSION['rem_trials'] .
    ", \"score\": " . $_SESSION['score'] . "}";
?>
