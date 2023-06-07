<?php
/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 27-March-2023 - 17:21:00
 * \\Infos: Ce fichier est le fichier d'intermediaire entre le chat.js et le database.php pour la partie connexion et inscription
 * \\Il permet de generer le token et de l'envoyer vers la base de donnees
 */



  require_once('database.php');

  // connexion a la base de donnees.
  $db = dbConnect();
  if (!$db)
  {
    header('HTTP/1.1 503 Service Unavailable');
    exit;
  }

  // verifications de la requette remontee du chat.js
  $requestMethod = $_SERVER['REQUEST_METHOD'];
  $request = substr($_SERVER['PATH_INFO'], 1);
  $request = explode('/', $request);
  $requestRessource = array_shift($request);

  // on regarde la valeur contenue dans la requette faite dans inscript ou validate
  // dans chat.js
  if ($requestRessource == 'authenticate')
    authenticate($db);
  if($requestRessource == 'inscript')
    inscript($db);
  
  // envoi du token cree vers le database.php vers la fonction verifyToken.
  $login = verifyToken($db);

  // Bad request case.
  header('HTTP/1.1 400 Bad Request');
  exit;

  ///////////////////////fonction d'authentification///////////////////////
  // cette fonction permet de creer un nouveau token 
  // lorsqu'un utilisateur se connecte
  function authenticate($db)
  {
    // recuperation du login
    $login = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];

    // verification que l'user existe et que le
    // mdp est le bon
    if (!dbCheckUser($db, $login, $password))
    {
      header('HTTP/1.1 401 Unauthorized checkUser');
      exit;
    }

    // creation du token
    $token = base64_encode(openssl_random_pseudo_bytes(12));
    dbAddToken($db, $login, $token);

    // creation des headers + renvoi du token.
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('HTTP/1.1 200 OK');
    echo $token;
    exit;
  }

  ///////////////////////fonction d'inscription///////////////////////
  // creation d'un nouvel utilisateur + nouveau token
  function inscript($db)
  {
    // recuperation du token et du login
    $login = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];

    // verification si le pseudo existe deja ou non
    if(!dbAddUser($db,$login,$password))
    {
      header('HTTP/1.1 401 Unauthorized addUser');
      exit;
    }

    // creation du token
    $token = base64_encode(openssl_random_pseudo_bytes(12));
    // ajout du token dans la bdd
    dbAddToken($db, $login, $token);

    // set des headers + renvoi du token
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('HTTP/1.1 200 OK');
    echo $token;
    exit;
  }

  ///////////////////////fonction de verif du token///////////////////////
  // verification de la validite du token avec les headers
  function verifyToken($db)
  {
    $headers = getallheaders();
    $token = $headers['Authorization'];
    if (preg_match('/Bearer (.*)/', $token, $tab))
      $token = $tab[1];
    $login = dbVerifyToken($db, $token);
    if (!$login)
    {
      header('HTTP/1.1 401 Unauthorized verifyToken');
      exit;
    }
    return $login;
  }
?>
