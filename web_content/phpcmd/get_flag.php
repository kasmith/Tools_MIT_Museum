<?php

session_start();

$do_set = $_POST['doset'];

if ($do_set === "TRUE") {
    $_SESSION['flag'] = $_POST['flag'];
}

echo $_SESSION['flag'];

 ?>
