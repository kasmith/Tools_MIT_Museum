<?php

session_start();

$do_set = $_POST['doset'];

if ($do_set === "TRUE") {
    $_SESSION['name'] = $_POST['name'];
}

echo $_SESSION['name'];

 ?>
