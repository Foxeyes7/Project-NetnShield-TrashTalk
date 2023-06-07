/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 27-March-2023 - 18:36:00
 * \\Infos: Ce code est la passerelle entre le chat.js et le chat.php
 * \\il permet egalement de traiter ce qui remonte de la base de donnes
 */
///////////////////////////Infos///////////////////////////
// le code genere encore une erreur parfois
// lors du chargement du chat. 
// l'erreur arrive presque a chaque fois quand le code est recharge 
// et mis en cache, il concerne uniquement la partie chat. 
// l'erreur doit venir de la mauvaise gestion du timing avec les fonctions
// de callback et les promesses lorsque le code se charge.
// Pour contourner cette erreur, une variable globale USER ID a 
// ete cree dans le but de pouvoir se logout lorsque l'erreur survient (sans faire appel a getUserId)
// cette variable globale peut potentiellement etre modifiee, il est donc necessaire
// de trouver une autre facon de gerer ce probleme. 
// voir les fonction passerelle et getUserId (responsables du probleme)
// il serait necessaire de revoir tout le code pour corriger l'erreur en
// fonctionnant uniquement avec le token 
// Pour voir plus clair dans le code je vous conseille de decommenter tous les
// console.log, ils scindent le code en plusieurs sections en fonction de l'execution
// des fonctions/pages. 
// Il serait egalement necessaire de revoir le fonctionnement du getMessages/sendMessage
// qui se font toutes les 0.5 sec, en creant une fonction qui ne remonte les messages
// uniquement si une modification est faite sur la BDD

///////////////////////////Création variables///////////////////////////

'use strict';
let cookie;
let refreshInterval;
let refreshValue;
let GlobalUserId;

///////////////////////////Ecoute d'events///////////////////////////

// au chargement de la page on affiche l'accueil
document.addEventListener('DOMContentLoaded', function(e) {
  e.preventDefault();
  toggle('accueil');
});

// Switch d'affichage avec la fonction Effacer entre (Ami +) a (Pseudo +)
document.getElementById('valider').addEventListener('click', function(e) {
  e.preventDefault();
  getPseudos();
  //console.log("------------------Accueil ajout ami");
  document.getElementById('texte-ajout-amis').classList.add('Effacer');
  document.getElementById('valider').classList.add('Effacer');
  document.getElementById('ajout-dami').classList.remove('Effacer');
  document.getElementById('add').classList.remove('Effacer');
});

document.getElementById('add').addEventListener('click',function(e) {
  e.preventDefault();
  //console.log("------------------Accueil classique");
  ajoutdAmi();
  document.getElementById('ajout-dami').classList.add('Effacer');
  document.getElementById('add').classList.add('Effacer');

  document.getElementById('texte-ajout-amis').classList.remove('Effacer');
  document.getElementById('valider').classList.remove('Effacer');
  getPseudos();
});

// switch http et https
document.getElementById('GoToTheDarkSIDE').addEventListener('click', function(e) {
  e.preventDefault();
  window.location.href = "http://messagerie.com/NetnShield/index.html";
});
document.getElementById('GoToTheWhiteSIDE').addEventListener('click', function(e) {
  e.preventDefault();
  window.location.href = "https://messagerie.com/NetnShield/index.html";
});

// switch entre l'accueil et la connexion
document.getElementById('connexion').addEventListener('click', function(e) {
  e.preventDefault();
  AccCo();
});
//switch entre l'accueil et l'inscription
document.getElementById('inscrip').addEventListener('click', function(e) {
  e.preventDefault();
  AccIns();
});

//switch entre la connexion et le chat
document.getElementById('authentication-send').addEventListener('submit', function(e) {
  e.preventDefault();
  validateLogin();
});
//switch entre la inscription et le chat
document.getElementById('inscription-send').addEventListener('submit', function(e) {
  e.preventDefault();
  inscriptionLogin();
});

// envoyer
document.getElementById('message-send').addEventListener('submit', function(e) {
  e.preventDefault();
  sendMessage();
});
// se déconnecter
document.getElementById('logout').addEventListener('click',function(e) {
  e.preventDefault();
  logout();
});
// switch entre la connexion et l'accueil
document.getElementById('retourCoAcc').addEventListener('click', function(e) {
  e.preventDefault();
  CoAcc();
});
//switch entre l'inscripton et l'accueil
document.getElementById('retourInsAcc').addEventListener('click', function(e) {
  e.preventDefault();
  InsAcc();
});

// fonction qui permet en cas de rechargement de la page de passer le statut de 1 à 0 de l'utilisateur connecté 
window.onload = function(){
  if(cookieExists('token')){
    if(!GlobalUserId){
      //console.log('var globale non créée');
      //alert('var globale non créée');
      Cookies.remove('token');
    }else{
      ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 0 + '&userId=' + GlobalUserId);
      Cookies.remove('token');
    }
  }
}

// en cas de suppression de l'onglet / page
window.addEventListener('beforeunload', function(event) {
  if(cookieExists('token')){
    if(!GlobalUserId){
      //console.log('var globale non créée');
      Cookies.remove('token');
    }else{
      ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 0 + '&userId=' + GlobalUserId);
      Cookies.remove('token');
    }
  }
});

///////////////////////////Switch entre les pages///////////////////////////

function AccCo() {//Accueil => Connexion
  //console.log("------------------Accueil => Connexion");
  document.getElementById('accueil').classList.toggle('d-none');
  document.getElementById('authentication').classList.toggle('d-none');
}
function CoAcc() {//Connexion => Accueil
  //console.log("------------------Connexion => Accueil");
  window.location.reload(true);
}
function AccIns() {//Accueil => Inscription
  //console.log("------------------Accueil => Inscription");
  document.getElementById('accueil').classList.toggle('d-none');
  document.getElementById('inscription').classList.toggle('d-none');
}
function InsAcc() {//Inscription => Accueil
  //console.log("------------------Inscription => Accueil");
  window.location.reload(true);
}
function InscChat() {//Inscription => Chat
  //console.log("------------------Inscription => Chat");
  document.getElementById('inscription').classList.toggle('d-none');
  document.getElementById('chat').classList.toggle('d-none');
}
function ConnexChat() {//Connexion => Chat
  //console.log("------------------Connexion => Chat");
  document.getElementById('authentication').classList.toggle('d-none');
  document.getElementById('chat').classList.toggle('d-none');
}
function ChatAcc() {//Chat => Accueil
  //console.log("------------------Chat => Accueil");
  window.location.reload(true);
}
function toggle(id) {//affichage
  //console.log("------------------affichage : "+ id);
  document.getElementById(id).classList.toggle('d-none');
}

///////////////////////Switch d'affichage (cadenas)///////////////////////

function affichagecadenas(){

  if (location.protocol === 'http:') {
    //console.log('La page est en HTTP');
    document.getElementById('GoToTheWhiteSIDE').classList.remove('Effacer');
  } else if (location.protocol === 'https:') {
    //console.log('La page est en HTTPS');
    document.getElementById('GoToTheDarkSIDE').classList.remove('Effacer');
  }
}

///////////////////////////Fonctions de Request///////////////////////////


// fonction de connexion
function validateLogin()
{
  let login;
  let password;
  let xhr;

  // Check login/password fields.
  login = $('#login_co').val();
  password = $('#password_co').val();

  // Create XML HTTP request.
  // Encode en base 64 login et mdp
  xhr = new XMLHttpRequest();
  xhr.open('GET', 'php/auth.php/authenticate');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(login + ':' +
    password));

  // Fonction qui s'exécute lorsque la requête est terminée 
  xhr.onload = () =>
  {
    switch (xhr.status)
    {
      case 200:
        // stock jeton d'auth dans le cookie token et affiche => auth ok
        Cookies.set('token', xhr.responseText , { sameSite: 'strict' });
        
        //console.log('token connexion : '+ xhr.responseText);
        //appel de la passerelle (connexion to chat)
        passerelle();

        $('#login, #password').val('');
        
        //ajout du pseudo de l'utilisateur
        let text2 = '';
        text2 +='<p class="Droite-pseudo-texte">' + login + '</p>'
        document.getElementById('user-pseudo').innerHTML = text2; 
        
        affichagecadenas();
        ConnexChat();
        break;
      case 401:
        alert("Pseudo ou mot de passe incorrect");
        break;
      default:
        displayErrors(xhr.status);
    }
  };
  // Send XML HTTP request.
  xhr.send();
}

function inscriptionLogin()
{
  let login;
  let password;
  let password_conf;
  let xhr;

  // Check login/password/password_conf fields.
  login = $('#login_ins').val();
  password = $('#password_ins').val();
  password_conf = $('#conf_password_ins').val();

  // check si les mdp correspondent
  if (password !== password_conf) {
    alert("Les mots de passe ne correspondent pas.");
    return false;
  }

  // Create XML HTTP request.
  // Encode en base 64 login et mdp
  xhr = new XMLHttpRequest();
  xhr.open('GET', 'php/auth.php/inscript');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(login + ':' + password));

  // Fonction qui s'exécute lorsque la requête est terminée 
  xhr.onload = () =>
  {
    switch (xhr.status)
    {
      case 200:
        // stock jeton d'auth dans le cookie token et affiche => auth ok
       	Cookies.set('token', xhr.responseText , { sameSite: 'strict' });
        console.log('token inscription : '+xhr.responseText);
        passerelle();
        $('#login, #password').val('');
        let text2 = '';
        text2 +='<p class="Droite-pseudo-texte">' + login + '</p>'
        document.getElementById('user-pseudo').innerHTML = text2; 
        affichagecadenas();
        InscChat();
        break;
      case 401:
        alert("Cet utilisateur existe déjà");
        break;
      default:
        displayErrors(xhr.status);
    }
  };
  // Send XML HTTP request.
  xhr.send();
}

//passerelle 
// cette fonction permet le lancement de toutes les fonctions necessaires
// au fonctionnement du chat
function passerelle(){
  if (cookieExists('token')){
    //console.log('passage passerelle');
    getPseudos(function(){
      manageRefresh(0.2);
    });
    return true;
  } else {
    //console.log("le cookie token n'existe pas");
    return false;
  }
}

function cookieExists(nomDuCookie) {
  let cook = Cookies.get(nomDuCookie);
  if (!cook){
    return false;
  }
  return true;
}

// fonction de déconnexion
// la fonction a pour rôle de supprimer tous les cookies de sessions en cours et
// par la suite de passer le statut de l'utilisateur de connecté à non connecté
// la fonction stoppe le rafraichissement de la page chat
function logout(){
  //console.log('passage logout');
  if(GlobalUserId){
    ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 0 + '&userId=' + GlobalUserId);
  }
  manageRefresh(0);
  Cookies.remove('token');
  ChatAcc();
}

// getUserId 
// cette fonction est appellée à la suite d'une connexion ou d'une inscription
// par l'intermediaire de la passerelle
// elle est utilisee par la suite pour aller chercher l'user ID dans la bdd
// elle a pour but de faire remonter de la base de données la valeur de l'ID 
// de l'utilisateur connecté et de le faire remonter dans un cookie
function getUserId() {  // modif faite !!
  let token = Cookies.get().token;

  return new Promise(function(resolve, reject) {
    ajaxRequest('GET', 'php/chat.php?request=UserId&token='+ token, function(userId) {
      try{
        let user_Id = userId[0].user_id;
        GlobalUserId = user_Id;
        resolve(user_Id);
      }catch(e){
        resolve(GlobalUserId);
      }
    });
  });
}


// getPseudos 
// cette fonction va chercher la liste des pseudos des amis de l'utilisateur connecté
// il lui faut donc le user id de l'utilisateur connecté pour ainsi l'envoyer à la 
// base de données
function getPseudos(callback) { 
  //console.log('passage getPseudos');
  let userIdPromise = getUserId();
  userIdPromise.then(function(userId) {
    ajaxRequest('GET', 'php/chat.php?request=pseudos&user_id='+ userId, function(data) {
      displayPseudos(data); //la fonction de rappel en question
      if (typeof callback === 'function') {// vérification si une fonction de rappel est passé à l'ajaxrequest
          callback();//appel de cette fonction de rappel 
      }
    });
  });
}

// Fonction qui récupère l'id de l'utilisateur et charge la liste de
// ses amis en affichant les messages associés à chacun d'entre eux 
function getMessages() { 
    //console.log('passage dans getMessages'); 
    let amiId;
    let ami;
    let text3='';
    let userIdPromise = getUserId();
    userIdPromise.then(function(userId) {
      /////////////////////////////////////////////////////////////////
      ami = document.getElementById('liste_amis'); // récupération de la liste d'amis
      //console.log(ami);
      var selectOption = ami.options[ami.selectedIndex];
      //console.log('option sélectionné' + selectOption);
      amiId = selectOption.id;
      //console.log('amiId '+ amiId);
      /////////////////////////////////////////////////////////////////
      
      text3 +='<p class="Droite-pseudo-texte">' + selectOption.value + '</p>'
      document.getElementById('user-pseudo-ami').innerHTML = text3;
      ajaxRequest('GET', 'php/chat.php?request=messages&user_id=' + userId + '&amiId='+ amiId, displayMessages);
    });
}

// cette fonction envoie les messages dans la base de données lorsque l'on clique sur le boutton "envoyer"
function sendMessage(){ // modif faite !!
  //console.log("passage dans sendMessage");
  let userIdPromise = getUserId();
  userIdPromise.then(function(userId) {
    let message;
    let amiId;
    let ami;
    /////////////////////////////////////////////////////////////////
    ami = document.getElementById('liste_amis'); // récupération de l'ami sélectionné dans la liste d'ami
    var selectOption = ami.options[ami.selectedIndex];
    amiId = selectOption.id; // récupération de l'id de cet ami
    message = document.getElementById('message').value; // récupération de la valeur du message
    document.getElementById('message').value = ''; // réinitialise l'élément HTML qui a un identifiant spécifique 
    message = message.replace("<", " ");
    message = message.replace(">", " ");
    message = message.replace("javascript", " ");
    message = message.replace("http"," ");
    /////////////////////////////////////////////////////////////////
    ajaxRequest('POST', 'php/chat.php?request=messages', getMessages, 
    'user_id=' + userId + '&message=' + message + '&amiId=' + amiId);
    /////////////////////////////////////////////////////////////////
  });
}

// fonction d'ajout d'amis
// fait une requette sur la base de données pour ajouter l'ami rentré dans
// la zone ajout-ami, et test si cet ami n'éxiste pas déjà en regardant dans la liste d'amis
// déjà chargée sur la page
function ajoutdAmi() {
  let ami;
  let value = 0;
  let userIdPromise = getUserId();
  userIdPromise.then(function(userId) {
    ami = document.getElementById('ajout-dami').value;// récupère la demande d'ajout d'ami
    // console.log('ami à ajouter', ami) 
    // test si l'ami existe déjà 
    var liste_amis = document.getElementById("liste_amis");
    for (var i = 0; i < liste_amis.length; i++) {
      if(liste_amis.options[i].text==ami){
        value=1
      }
    }
    // requete
    if (value == 0) {
      // console.log('value ==0 on exec lajax request')
      ajaxRequest('POST', 'php/chat.php?request=ajoutami', getPseudos,
        'user_id=' + userId + '&ami=' + ami);
    }
  });
}

///////////////////////////Fonction De rafraichissement///////////////////////////

// fonction de rafraichissement de la page de chat chatgpt
function manageRefresh(refreshValue) {
  // console.log('passage manageRefresh avec la valeur : '+ refreshValue);
  clearInterval(refreshInterval);
  if (!isNaN(refreshValue) && refreshValue != 0){
      refreshInterval = setInterval(getMessages, refreshValue*1000);
  }
}

///////////////////////////Fonctions d'affichage///////////////////////////

// fonction callback de la fonction getPseudos qui affiche les pseudos sur la page de chat
function displayPseudos(pseudos){
    // console.log('passage displayPseudos');
    let text
    //fill the channels list
    text =''
    for (let i of pseudos)
    {
      if(i.user_id==1){
        if (i.etat == '1') {
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-vert text-center" id=' + i.user_id + ' selected>' + i.pseudo + '</option>';
        } else {
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-rouge text-center" id=' + i.user_id + ' selected>' + i.pseudo + '</option>';
        }
      }
      else{
        if (i.etat == '1') {
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-vert text-center" id=' + i.user_id + '>' + i.pseudo + '</option>';
        } else {
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-rouge text-center" id=' + i.user_id + '>' + i.pseudo + '</option>';
        }
        
      }
        //console.log(text)
        document.getElementById('liste_amis').innerHTML = text
    }
}

function statusinfos(data){
  // console.log('Le status est actualisé : ' + data);
}

// fonction callback de getMessages, permet de les afficher dans la "chat-room" 
function displayMessages(messages){
  //console.log('passage dans display message');
  let chatRoom;
  let text;
  text = '';
  for (let i = messages.length - 1; i >= 0; i--){
      if(messages[i].user_id==GlobalUserId){
        //console.log("passage dans message utilisateur");
        text+='<div class="Droite-middle-container-droite"><div class="Droite-middle-message-droite">'+ messages[i].texte +'</div><div class="Droite-middle-heure-droite">'+messages[i].pseudo+' - '+ messages[i].date+'</div></div>';
      }else{
        //console.log("passage dans message de l'ami");
        text+='<div class="Droite-middle-container-gauche"><div class="Droite-middle-message-gauche">'+ messages[i].texte +'</div><div class="Droite-middle-heure-gauche">'+messages[i].pseudo+' - '+ messages[i].date+'</div></div>';
      }
    
  }
  chatRoom = document.getElementById('chat-room');
  chatRoom.innerHTML = text;
}
