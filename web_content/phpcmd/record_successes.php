<?php

session_start();

$do_set = $_POST['doset'];

if ($do_set === "TRUE") {
    $tr = $_POST['trial'];
    if (! in_array($tr, $_SESSION['successes'], TRUE)) {
        $_SESSION['successes'][] = $tr;
    }
}

echo count($_SESSION['successes']);

 ?>
