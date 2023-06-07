<?php
/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 29-Mars-2023 - 09:38:00
*/

  require_once('database.php');

  // Connexion a la BDD.
  $db = dbConnect();
  if (!$db)
  {
    header('HTTP/1.1 503 Service Unavailable');
    exit;
  }

  // Récupération de la méthode HTTP (GET,POST) et de l'URL 
  $requestMethod = $_SERVER['REQUEST_METHOD'];
  $request = substr($_SERVER['PATH_INFO'], 1);
  $request = explode('/', $request);
  $requestRessource = array_shift($request);

  // Choix de la fonction à utiliser dans le cas d'une inscription ou d'une connexion
  if ($requestRessource == 'authenticate')
    authenticate($db);
  if($requestRessource == 'inscript')
    inscript($db);
  
  // Verification du token pour l'associer a un login
  $login = verifyToken($db);

  // Message en console lors d'une erreur
  header('HTTP/1.1 400 Bad Request');
  exit;

  //////////////////////////////////fonction authenticate///////////////////////////////
  // Fonction qui gère la connexion d'un utilisateur à la messagerie et sort s'il y a 
  // une erreur
  // Vérification du pseudo et du mdp rentré par l'utilisateur
  // Création d'un token 
  function authenticate($db)
  {
    // Récupère le pseudo et le mdp
    $login = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];

    // Vérifie si l'utilisateur a rentré les bonnes informations
    if (!$data=dbCheckUserInjection($db, $login, $password))
    {
      header('HTTP/1.1 401 Unauthorized checkUser');
      var_dump($data);
      exit;
    }

    // Création du token
    $token = base64_encode(openssl_random_pseudo_bytes(12));
    dbAddToken($db, $login, $token);

    // Envoi du token au client 
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('HTTP/1.1 200 OK');
    echo $token;
    exit;
  }

  //////////////////////////////////Fonction d'inscription///////////////////////////////
  // Fonction qui gère l'inscription d'un utilisateur à la messagerie et sort s'il y a 
  // une erreur
  // Inscription d'un utilisateur dans la BDD
  // Création d'un token
  function inscript($db)
  {
    // Récupère le pseudo et le mdp  
    $login = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];

    // Insère un utilisateur dans la bdd
    if(!dbAddUser($db,$login,$password))
    {
      header('HTTP/1.1 401 Unauthorized addUser');
      exit;
    }

    // Création du token
    $token = base64_encode(openssl_random_pseudo_bytes(12));
    dbAddToken($db, $login, $token);

    // Envoi du token au client
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('HTTP/1.1 200 OK');
    echo $token;
    exit;
  }

  //////////////////////////////////Vérification du token///////////////////////////////
  // Vérifie la validité du token et sort s'il y a une erreur
  // Renvoi le login associé au token
  function verifyToken($db)
  {
    // Récupération du token
    $headers = getallheaders();
    $token = $headers['Authorization'];

    // Vérifie si le token commence par Bearer
    if (preg_match('/Bearer (.*)/', $token, $tab))
      $token = $tab[1];
      
    // Appel dbVerifyToken
    $login = dbVerifyToken($db, $token);

    if (!$login)
    {
      header('HTTP/1.1 401 Unauthorized verifyToken');
      exit;
    }
    return $login;
  }
?>
