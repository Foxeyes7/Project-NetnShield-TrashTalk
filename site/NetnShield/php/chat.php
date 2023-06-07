<?php
/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 27-March-2023 - 17:21:00
 * \\Infos: Ce fichier est l'identique de auth.php mais lui est utilise pour toutes les ajax requet (GET ou POST)
 * \\il traite egalement des retours de la base de donnees s'occupe des convertionss
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

  // cette fonction va rechercher l'user_id dans la bdd en fonction du token de l'user connecte
  if ($request == 'UserId') {
    if (isset($_GET['token'])){
      $data = dbGetId($db, $_GET['token']);
    }
  }

  // cette fonction ajoute un ami en fonction de notre user_id et du pseudo de l'ami tape dans le champ dedie
  if ($request == 'ajoutami') {
    if ($_SERVER['REQUEST_METHOD'] == 'POST'){
      $userId =intval($_POST['user_id']);
      $ami = $_POST['ami'];
      $data = dbAddAmis($db,$userId,$ami); // on appelle la fonction addM
    }
  }

  

  // cette fonction récupère/envoie la liste des messages dépendant de l'ID du pseudo connecté
  if ($request == 'messages'){
    // va chercher les messages dans la BDD
    if ($_SERVER['REQUEST_METHOD'] == 'GET'){
      if (isset($_GET['user_id']) && isset($_GET['amiId'])){
        $data = dbGetMessage($db, intval($_GET['user_id']), intval($_GET['amiId']));
      }
    }
    // ajout d'un message dans la BDD
    if ($_SERVER['REQUEST_METHOD'] == 'POST'){
      $userId =intval($_POST['user_id']);
      $message = $_POST['message'];
      $amiId = $_POST['amiId'];
      $data = dbAddMessage($db, $message, $userId,$amiId); // on appelle la fonction addMessage
    }
  }

  // permet de changer notre statut quand on se connecte/deconnecte prenant un 1/0 et l'user_id
  if($request == 'statut'){
    if ($_SERVER['REQUEST_METHOD'] == 'POST'){
      $etat =$_POST['value'];
      $userId =$_POST['userId'];
      $data = dbchangestatut($db,$etat,$userId);
    }
  }

  ///////////////////////////Gestion de la réponse///////////////////////////
  // renvoie la reponse remontee de la base de donnes en recuperant les $data des fonctions precedentes.
  // envoie une réponse en fonction du format utilisé par la variable type ($data)
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
