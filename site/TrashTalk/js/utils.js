/**
 * \\Author: Edgar Lefèvre & Emilio Chatel
 * \\Company: ISEN Yncréa Ouest
 * \\Email: edgar.lefevre@isen-ouest.yncrea.fr
 * \\Email: emilio.chatel@isen-ouest.yncrea.fr
 * \\Created Date: 31-Jan-2023 - 13:41:00
 * \\Last Modified: 29-Mar-2023 - 09:49:00
 * \\Infos: ce fichier fait le lien entre chat.js
 * et chat.php, il permet de former les ajax request
 */

 'use strict'

 ////////////////////////fonction toggle////////////////////////
 // cette fonction permet l'affichage des valeurs que l'on veut ou non
 // (affichage de l'accueil, de l'inscription et du chat)
 function toggle(id)
 {
   document.getElementById(id).classList.toggle('d-none');
 }
 
 ////////////////////////fonction ajax request////////////////////////
 // cette fonction recupère les ajaxrequest faites dans le chat.js 
 // elles convertissent les requettes avant de les envoyer vers
 // les fichiers demandes
 // cette fonction est identique à ce que fait validate login et 
 // inscrip dans chat.js
 function ajaxRequest(type, url, callback, data = null)
 {
   let xhr;
 
   // creation XML HTTP request.
   xhr = new XMLHttpRequest();
   if (type == 'GET' && data != null)
     url += '?' + data;
   xhr.open(type, url);
   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
   xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://192.168.0.100');  
   xhr.onload = () =>
   {
     switch (xhr.status)
     {
       case 200:
       case 201:
          //console.log(xhr.responseText);
          callback(JSON.parse(xhr.responseText));
         break;
       default:
         displayErrors(xhr.status);
         //console.log(xhr.responseText);
     }
   };
   // Send XML HTTP request.
   xhr.send(data);
 }
 
 ////////////////////////affichage des erreurs////////////////////////
 // cette fonction se charge d'afficher les erreurs en fonction du code remonté
 function displayErrors(errorCode)
 {
   let messages = {
     400: '400 Requête incorrecte',
     401: '401 Authentifiez vous',
     404: '404 Page non trouvée',
     500: '500 Erreur interne du serveur',
     503: '503 Service indisponible'
   };
 
   // Display error.
   if (messages[errorCode] != undefined)
   {
     document.getElementById('errors').innerHTML =
       '<strong>' + messages[errorCode] + '</strong>';
     toggle('errors');
     setTimeout(() =>
     {
       toggle('errors');
     }, 5000);
   }
 }
 
