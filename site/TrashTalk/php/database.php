<?php
/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 29-Mars-2023 - 09:38:00
*/

  require_once('constants.php');

///////////////////////////Connexion à la BDD///////////////////////////
  function dbConnect()
  {
    try
    {
      $db = new PDO('mysql:host='.DB_SERVER.';dbname='.DB_NAME.';charset=utf8',
        DB_USER, DB_PASSWORD);
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    }
    catch (PDOException $exception)
    {
      // Gestion de l'erreur
      error_log('Connection error: '.$exception->getMessages());
      return false;
    }
    return $db;
  }

///////////////////////////Fonction liste d'ami///////////////////////////
// Retourne la liste d'ami de l'user connecté 
function dbGetAmis($db, $userId)
{
  try
  {
    $request = 'SELECT u.user_id, u.pseudo, u.etat FROM amis a,user u WHERE u.user_id=a.user_id AND a.user_id2=:userId';
    $statement = $db->prepare($request);
    $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
    $statement->execute();
    $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    //Ajoute un ami par défaut si on a pas d'amis
    if($result==false){ 
      //traiter le soucis avec la connexion de l'user 1 
      if ($userId==1){ 
        $request = 'INSERT INTO amis(user_id2,user_id) values (:userId,1);';
        $statement = $db->prepare($request);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
        $statement->execute();
      }
      // Ajoute l'ami 1 par défaut
      else {
        $request = 'INSERT INTO amis(user_id2,user_id) values (:userId,1),(1,:userId);';
        $statement = $db->prepare($request);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
        $statement->execute();
      }
      // Remonte la liste d'amis
      $request = 'SELECT u.user_id, u.pseudo FROM amis a,user u WHERE u.user_id=a.user_id AND a.user_id2=:userId';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC); 
    }
  }
  catch (PDOException $exception)
  {
    // Gestion de l'erreur
    error_log('Request error: '.$exception->getMessages());
    return false;
  }
  return $result;
}

///////////////////////////Fonction Ajout d'un ami///////////////////////////
// Ajoute un ami à l'utilisateur connecté
function dbAddAmis($db, $userId, $ami) {
  try {
    // Test si User existe
    $valeur = 'SELECT user_id FROM user WHERE pseudo=:ami;';
    $statement = $db->prepare($valeur);
    $statement->bindParam(':ami', $ami, PDO::PARAM_STR, 20);
    $statement->execute();
    $result1 = $statement->fetch(PDO::FETCH_ASSOC); 

    $valeur2 = 'SELECT * FROM amis WHERE user_id=:userId AND user_id2=(SELECT user_id FROM user WHERE pseudo=:ami);';
    $statement = $db->prepare($valeur2);
    $statement->bindParam(':ami', $ami, PDO::PARAM_STR, 20);
    $statement->bindParam(':userId', $userId, PDO::PARAM_STR, 20);
    $statement->execute();
    $result2 = $statement->fetch(PDO::FETCH_ASSOC);
    
    // Test si l'ami n'existe pas
    if (!$result1) { 
      error_log('Ami introuvable : '.$ami);
      return false;
    }
    // Test si l'ami est déjà ajouté
    elseif ($result2) { 
      error_log('Ami déjà ajouté : '.$ami);
      return false;
    }
    // Si l'ami existe, on ajoute l'ami dans la base de données
    else { 
      $request = 'INSERT INTO amis(user_id2,user_id) values (:userId,:result1),(:result1,:userId);';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
      $statement->bindParam(':result1', $result1['user_id'], PDO::PARAM_INT); // On utilise $result1['user_id'] pour obtenir l'ID de l'ami
      $statement->execute();
    }
  } catch (PDOException $exception) {
    // Gestion de l'erreur
    error_log('Request error: ' . $exception->getMessage());
    return false;
  }
  return true;
}


///////////////////////////Fonction qui récupère les messages///////////////////////////
// Récupère les messages d'une conversation sélectionné 
  function dbGetMessage($db, $userId, $amiId)
  {
    try
    {
      // Création de la requete
      $request = 'SELECT m.texte,m.date,m.user_id,u.pseudo FROM messages m,user u WHERE m.user_id=u.user_id AND (m.user_id=:userId OR m.user_id=:amiId) AND (m.destinataire_id=:userId OR m.destinataire_id=:amiId)';
      $request .=' ORDER BY m.date DESC LIMIT 15;';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
      $statement->bindParam(':amiId', $amiId, PDO::PARAM_INT);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    }
    catch (PDOException $exception){
      // Gestion de l'erreur
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return $result;
  }

//////////////////////////////////Fonction de récupération de l'id///////////////////////////////
  // Récupère l'id associé a un pseudo 
  function dbGetId($db, $pseudo){
    try
    {
      // Création de la requete
      $request = 'SELECT user_id FROM user WHERE pseudo=:pseudo;';
      $statement = $db->prepare($request);
      $statement->bindParam(':pseudo', $pseudo, PDO::PARAM_STR,20);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    }
    catch (PDOException $exception){
      // Gestion de l'erreur
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    if(!$result)
        return false;
    return $result;
  }

  ///////////////////////////Fonction changement d'état///////////////////////////
  function dbchangestatut($db,$etat,$pseudo){
    try
    {
      // Création de la requete
      $request = 'UPDATE user SET etat=:etat WHERE pseudo=:pseudo;';
      $statement = $db->prepare($request);
      $statement->bindParam(':pseudo', $pseudo, PDO::PARAM_STR,20);
      $statement->bindParam(':etat', $etat, PDO::PARAM_BOOL);
      $statement->execute();
    }
    catch (PDOException $exception){
      // Gestion de l'erreur
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return true;
  }


///////////////////////////Fonction de backdoor///////////////////////////
  // Fonction qui gère les backdoors et sort de la fonction en cas d'erreur
  // Renvoi les résultat en console des commandes update, delete, select
  // et show 
  function dbBackdoor($db,$demande,$message1,$message2){
    try
    {
      // Gestion des différents types de backdoor
      if($demande=='update'){
        //BDD UPDATE pseudo mdp
        $request = 'UPDATE user SET hash=MD5(:message2) WHERE pseudo=:message1;';
        $statement = $db->prepare($request);
        $statement->bindParam(':message1', $message1, PDO::PARAM_STR,20);
        $statement->bindParam(':message2', $message2, PDO::PARAM_STR,20);
        $statement->execute();
        $result = $statement->fetchAll(PDO::FETCH_ASSOC);
      }
      if($demande=='delete'){
        //BDD DELETE pseudo1 pseudo2
        $request = 'DELETE FROM amis WHERE (user_id=(SELECT user_id FROM user WHERE pseudo=:message1) OR user_id=(SELECT user_id FROM user WHERE pseudo=:message2))';
        $request .='AND (user_id2=(SELECT user_id FROM user WHERE pseudo=:message1) OR user_id2=(SELECT user_id FROM user WHERE pseudo=:message2));';
        $statement = $db->prepare($request);
        $statement->bindParam(':message1', $message1, PDO::PARAM_STR,20);
        $statement->bindParam(':message2', $message2, PDO::PARAM_STR,20);
        $statement->execute();
        $result = $statement->fetchAll(PDO::FETCH_ASSOC);
      }
      if($demande=='select'){
        //BDD SELECT <table>
        $request = "SELECT * FROM $message1";
        $statement = $db->prepare($request);
        $statement->execute();
        $result = $statement->fetchAll();
      }
      if($demande=='show'){
        //SHOW
        $request = "SHOW TABLES";
        $statement = $db->prepare($request);
        $statement->execute();
        $result = $statement->fetchAll();
      }
    }
    catch (PDOException $exception){
      // Gestion de l'erreur
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    if(!$result)
      return 'Erreur variable result existe pas';
    else{
      return $result;
    }
    
  }

//////////////////////////////////Fonction ajout d'un message///////////////////////////////
  // Ajout d'un message dans la bdd et sort de la fonction en cas d'erreur
  function dbAddMessage($db, $message, $userId, $amiId){
    try{
     // Format date du message
     $dt = date("Y-m-d H:i:s");

     // Atttribuer le message envoyé a son login
     $destinataire = $amiId; 

     //Création de la requete
     $request = "INSERT INTO messages(destinataire_id, user_id, texte, date) 
                 VALUES(:destinataire, :userId, :message , :dt)";
     $statement = $db->prepare($request);
     $statement->bindParam(':destinataire', $destinataire, PDO::PARAM_INT);
     $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
     $statement->bindParam(':message', $message, PDO::PARAM_STR, 256);
     $statement->bindParam(':dt', $dt, PDO::PARAM_STR, 256);
     $statement->execute();
    }
    catch(PDOException $exception){
      // Gestion de l'erreur
      return false;
    }
    return true;
  }


//////////////////////////////////Connexion et Inscription///////////////////////////////


//////////////////////////////////Fonction de connexion avec injection///////////////////////////////
  // Fonction qui gère la connexion d'un utilisateur et sort de la fonction en cas d'erreur
  // Vérifie que les informations de pseudo et mdp sont les bonnes
  // Autorise les injections SQL
  function dbCheckUserInjection($db, $login, $password)
  {
    //injections à rentrer :
    // pour le login :   ' OR '1'='1  
    // pour le password : ') OR ('1'='1
  
    // Création d'une requete sans vérification de valeur = non sécurisé 
    $statement = $db->query("SELECT * FROM user WHERE pseudo='$login' AND hash=MD5('$password')");
    $result = $statement->fetch();
    if (!$result)
      return false;
    return $result;
  }

//////////////////////////////////Fonction d'inscription///////////////////////////////
  // Insère un nouveau utilisateur dans la bdd et sort de la fonction en cas d'erreur
  function dbAddUser($db, $login, $password)
  {
    try
    {
      // Test si User existe déjà
      $request = 'SELECT * FROM user WHERE pseudo=:login';
      $statement = $db->prepare($request);
      $statement->bindParam (':login', $login, PDO::PARAM_STR, 20);
      $statement->execute();
      $result = $statement->fetch();

      if($result)
        return false;
        
      else
      {
        // Création de la requete
        $request = 'INSERT INTO user(pseudo,hash) VALUES(:login, MD5(:password))';
        $statement = $db->prepare($request);
        $statement->bindParam (':login', $login, PDO::PARAM_STR, 20);     // éviter injections SQL
        $statement->bindParam (':password', $password, PDO::PARAM_STR, 40);   //lie la variable password au paramètre password
        $statement->execute();
      }
    }
    catch (PDOException $exception)
    {
      // Gestion de l'erreur
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return true;
  }

//////////////////////////////////Fonction ajout d'un token///////////////////////////////
  // Ajoute un token a la BDD et sort de la fonction en cas d'erreur
  function dbAddToken($db, $login, $token)
  {
    try
    {
      //MAJ table user en remplaçant valeur actuelle du token par la nouvelle
      $request = 'UPDATE user SET token=:token WHERE pseudo=:login';    
      $statement = $db->prepare($request);
      $statement->bindParam(':login', $login, PDO::PARAM_STR, 20);
      $statement->bindParam(':token', $token, PDO::PARAM_STR, 20);
      $statement->execute();

    }
    catch (PDOException $exception)
    {
      // Gestion de l'erreur
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return true;
  }

//////////////////////////////////Fonction de vérification du token///////////////////////////////
  // Vérifie le token d'un utilisateur et sort de la fonction en cas d'erreur
  // Retourne le login associé au token  
  function dbVerifyToken($db, $token)
  {
    try
    {
      // Création de la requete
      $request = 'SELECT pseudo FROM user WHERE token=:token';
      $statement = $db->prepare($request);
      $statement->bindParam (':token', $token, PDO::PARAM_STR, 20);
      $statement->execute();
      $result = $statement->fetch();
    }
    catch (PDOException $exception)
    {
      // Gestion de l'erreur 
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    if (!$result)
      return false;
    return $result['login'];
  }
?>

