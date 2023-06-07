<?php
/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 27-March-2023 - 17:21:00
 * \\Infos: ce fichier est l'intermediaire entre la base de donnees et le reste du code
 * \\toutes les interractions avec la base de donnes. Il est important de noter que pour
 * \\le bon fonctionnement de ce fichier, les driver PDO dependant de la version du server utilise
 * \\doivent etre installes
 */

  require_once('constants.php');

///////////////////////////Connexion à la BDD///////////////////////////
  function dbConnect()
  {
    // recuperation des valeurs de constants.php ici
    try
    {
      $db = new PDO('mysql:host='.DB_SERVER.';dbname='.DB_NAME.';charset=utf8',
        DB_USER, DB_PASSWORD);
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    }
    catch (PDOException $exception)
    {
      error_log('Connection error: '.$exception->getMessages());
      return false;
    }
    return $db;
  }

///////////////////////////Retourne la liste d'ami///////////////////////////
// retourne la liste d'ami de l'user connecté en fonction de son user_id
function dbGetAmis($db, $userId)
{
  try
  {
    $request = 'SELECT u.user_id, u.pseudo, u.etat FROM amis a,user u WHERE u.user_id=a.user_id AND a.user_id2=:userId';
    $statement = $db->prepare($request);
    $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
    $statement->execute();
    $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    if($result==false){ //ajoute l'ami Support (#1) par défaut si on a pas d'amis (lors de la premiere connexion)
      if ($userId==1){ //si on se connecte avec le support il s'ajoute lui meme comme ami
	// note : on n'ajoute pas l'amitie dans les deux sens pour eviter le dedoublement des messages
        $request = 'INSERT INTO amis(user_id2,user_id) values (:userId,1);';
        $statement = $db->prepare($request);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
        $statement->execute();
      }else { // ajoute l'ami 1 par défaut
        $request = 'INSERT INTO amis(user_id2,user_id) values (:userId,1),(1,:userId);';
        $statement = $db->prepare($request);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
        $statement->execute();
      }
      // remonte les amis
      $request = 'SELECT u.user_id, u.pseudo FROM amis a,user u WHERE u.user_id=a.user_id AND a.user_id2=:userId';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC); 
    }
  }
  catch (PDOException $exception)
  {
    error_log('Request error: '.$exception->getMessages());
    return false;
  }
  return $result;
}

///////////////////////////Ajout d'un ami///////////////////////////
// ajoute un ami à l'utilisateur connecté
// l'user_id de l'utilisateur connecte et le pseudo de l'ami
function dbAddAmis($db, $userId, $ami) {
  try {
    // on remonte l'user_id de l'ami (les amities se font avec l'user_id)
    $valeur = 'SELECT user_id FROM user WHERE pseudo=:ami;';
    $statement = $db->prepare($valeur);
    $statement->bindParam(':ami', $ami, PDO::PARAM_STR, 20);
    $statement->execute();
    $result1 = $statement->fetch(PDO::FETCH_ASSOC); // On utilise fetch() au lieu de fetchAll()
    // Test si l'ami est deja ajoute (simplification de code possible ici)
    $valeur2 = 'SELECT * FROM amis WHERE user_id=:userId AND user_id2=(SELECT user_id FROM user WHERE pseudo=:ami);';
    $statement = $db->prepare($valeur2);
    $statement->bindParam(':ami', $ami, PDO::PARAM_STR, 20);
    $statement->bindParam(':userId', $userId, PDO::PARAM_STR, 20);
    $statement->execute();
    $result2 = $statement->fetch(PDO::FETCH_ASSOC);
    if (!$result1) {// Test si l'ami n'existe pas (pas d'user_id de l'ami)
      error_log('Ami introuvable : '.$ami);
      return false;
    }elseif ($result2) { // Test si l'ami est déjà ajouté
      error_log('Ami déjà ajouté : '.$ami);
      return false;
    }else { 
      // Si l'ami existe, on ajoute l'ami dans la base de données 
      $request = 'INSERT INTO amis(user_id2,user_id) values (:userId,:result1),(:result1,:userId);';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
      $statement->bindParam(':result1', $result1['user_id'], PDO::PARAM_INT); // On utilise $result1['user_id'] pour obtenir l'ID de l'ami
      $statement->execute();
    }
  } catch (PDOException $exception) {
    error_log('Request error: ' . $exception->getMessage());
    return false;
  }
  return true;
}


///////////////////////////Retourne la liste d'ami///////////////////////////
// retourne la liste d'ami de l'utilisateur connecte
  function dbGetMessage($db, $userId, $amiId)
  {
    try
    {
      //On remonte de la base de donnees les messages ayant pour configuration(destinataire_id/user_id) 1 - 2 ou 2 - 1
      //SELECT m.texte,m.date,m.user_id,u.pseudo FROM messages m,user u WHERE m.user_id=u.user_id AND (m.user_id=3 OR m.user_id=2) AND (m.destinataire_id=2 OR m.destinataire_id=3);
      $request = 'SELECT m.texte,m.date,m.user_id,u.pseudo,u.token FROM messages m,user u WHERE m.user_id=u.user_id AND (m.user_id=:userId OR m.user_id=:amiId) AND (m.destinataire_id=:userId OR m.destinataire_id=:amiId)';
      $request .=' ORDER BY m.date DESC LIMIT 15;';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
      $statement->bindParam(':amiId', $amiId, PDO::PARAM_INT);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    }
    catch (PDOException $exception){
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return $result;
  }

///////////////////////////Retourne l'user ID///////////////////////////
// fonction BCP BCP importante, elle permet de remonter l'user_id de
// l'utilisateur connecte en fonction de son token
  function dbGetId($db, $token){
    try
    {
      $request = 'SELECT user_id FROM user WHERE token=:token;';
      $statement = $db->prepare($request);
      $statement->bindParam(':token', $token, PDO::PARAM_STR,20);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    }
    catch (PDOException $exception){
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    if(!$result)
        return false;
    return $result;
  }

///////////////////////////change d'état///////////////////////////
// fonction permettant de changer le statut de l'user connecte
  function dbchangestatut($db,$etat,$userId){
    try
    {
      $request = 'UPDATE user SET etat=:etat WHERE user_id=:userId;';
      $statement = $db->prepare($request);
      $statement->bindParam(':userId', $userId, PDO::PARAM_STR);
      $statement->bindParam(':etat', $etat, PDO::PARAM_BOOL);
      $statement->execute();
      $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    }
    catch (PDOException $exception){
      error_log('Request error: '.$exception->getMessage());
      return 'echec du changement de statut';
    }
    return $etat;
  }

///////////////////////////ajout de messages à la bdd///////////////////////////
  function dbAddMessage($db, $message, $userId, $amiId){
    try{
     $dt = date("Y-m-d H:i:s");//recuperation de la date actuelle
     $destinataire = $amiId; // attribuer le message envoyé à son login
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
      return false;
    }
    return true;
  }


  ///////////////////////////verification de l'utilisateur///////////////////////////
  // permet de valider l'existence de l'utilisateur qui cherche a se connecter
  // crypte de mdp de l'utilisateur en SHA2 256 bits  
  // bloque les injecctions SQL
  function dbCheckUser($db, $login, $password)
  {
    try
    {
      $request = 'SELECT * FROM user WHERE pseudo=:login AND hash=SHA2(:password,256)';
      $statement = $db->prepare($request);
      $statement->bindParam (':login', $login, PDO::PARAM_STR, 20);
      $statement->bindParam (':password', $password, PDO::PARAM_STR, 40);
      $statement->execute();
      $result = $statement->fetch();
    }
    catch (PDOException $exception)
    {
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    if (!$result)
      return false;
    return true;
  }

  ///////////////////////////ajout de l'utilisateur sur la base de donnes///////////////////////////
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
      // si il y a un retour, c'est que l'utilisateur existe
      if($result)
        return false;
      else // autrement ajoute l'utilisateur
      {
        // ajout de l'utilisateur dans la base de donnees 
        $request = 'INSERT INTO user(pseudo,hash,etat) VALUES(:login, SHA2(:password,256),1)';
        $statement = $db->prepare($request);
        $statement->bindParam (':login', $login, PDO::PARAM_STR, 20);  
        $statement->bindParam (':password', $password, PDO::PARAM_STR, 40);
        $statement->execute();
      }
    }
    catch (PDOException $exception)
    {
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return true;
  }

   ///////////////////////////ajoute le token dans la bdd///////////////////////////
   // cette fonction ajoute le token dans la base de donnees en fonction du login de l'utilisateur
  function dbAddToken($db, $login, $token)
  {
    try
    {
      //maj table user en remplaçant valeur actuelle token par nouvelle
      $request = 'UPDATE user SET token=:token,etat=1 WHERE pseudo=:login';    
      $statement = $db->prepare($request);
      $statement->bindParam(':login', $login, PDO::PARAM_STR, 20);
      $statement->bindParam(':token', $token, PDO::PARAM_STR, 20);
      $statement->execute();
    }
    catch (PDOException $exception)
    {
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    return true;
  }

   ///////////////////////////ajoute le token dans la bdd///////////////////////////
   // cette fonction verifie si le token envoye correspond a celui stocke dans la bdd
   // si cette fonction est valide elle retourne le login de l'utilisateur
  function dbVerifyToken($db, $token)
  {
    try
    {
      $request = 'SELECT pseudo FROM user WHERE token=:token';
      $statement = $db->prepare($request);
      $statement->bindParam (':token', $token, PDO::PARAM_STR, 20);
      $statement->execute();
      $result = $statement->fetch();
    }
    catch (PDOException $exception)
    {
      error_log('Request error: '.$exception->getMessage());
      return false;
    }
    if (!$result)
      return false;
    return $result['login'];
  }
  
  
  
  
  
  
  
  
  
  // oh vous etes arrive la ? vous avez tout lu ? Merci d'avoir pris le temps <3
?>

