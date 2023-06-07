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

 'use strict'

 /////////////////////////gestion du toggle ici /////////////////////////
 // cette fonction permet le switch entre les pages
 function toggle(id)
 {
   document.getElementById(id).classList.toggle('d-none');
 }
 
 /////////////////////////gestion des ajax request/////////////////////////
 // se referrer aux positionnement des variables pour comprendre son
 // fonctionnement dans le chat.js
 function ajaxRequest(type, url, callback, data = null)
 {
   let xhr;
 
   // Create XML HTTP request.
   xhr = new XMLHttpRequest();
   if (type == 'GET' && data != null)
     url += '?' + data;
   xhr.open(type, url);
   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  
   // Add response handler.
   xhr.onload = () =>
   {
     switch (xhr.status)
     {
       case 200:
       case 201:
          //console.log('status 200');
          //console.log(xhr.responseText);
          callback(JSON.parse(xhr.responseText));
         break;
       default:
          console.log(xhr.responseText);
          displayErrors(xhr.status);
     }
   };
 
   // Send XML HTTP request.
   xhr.send(data);
 }
 
 /////////////////////////gestion des erreurs/////////////////////////
 // permet d'afficher les erreur dans la console correctement 
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
 
