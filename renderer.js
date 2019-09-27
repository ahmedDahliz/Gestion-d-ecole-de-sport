// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const remote = require('electron').remote
const ipc = require('electron').ipcRenderer
let BrowserWindow = remote.BrowserWindow
let isSaved = true;
//datatable configuration
require( 'datatables.net-bs4' )()
let datatable;

$(window).on('load', function() {
  $(".loader img").hide();
  $(".loader").addClass('complete');
  // $(".loader").css('z-index', 0)
  setTimeout(()=>{$(".loader").css('z-index', -1);}, 300)
});
$(document).ready( function () {
} );

//functonality of player buttons
$('#showPlayer').on('click', function () {
  afficherJoueur = new BrowserWindow({
    width: 1250,
    height: 780,
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
  })
  afficherJoueur.loadFile('joueurs/afficher.html')
  afficherJoueur.once("ready-to-show", function(){
    afficherJoueur.show();
    afficherJoueur.webContents.send('idPlayer', $('input:radio[name=player]:checked').val())
  })
  afficherJoueur.on('closed', function(){
    ipc.send('refresh-group')
  })
  //
  // afficherJoueur.on('close', function(e){
  //   if (true) {
  //     e.preventDefault();
  //     console.log("not closing show player ...");
  //   }
  //   console.log("closing show player ...", isSaved);
  // })
});

$('#ajouter').on('click', function () {
  ajouterJoueur = new BrowserWindow({
    width: 1350,
    height: 780,
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
  })
  ajouterJoueur.loadFile('joueurs/ajouter.html')
  ajouterJoueur.once("ready-to-show", function(){
    ajouterJoueur.show();
  })
  ajouterJoueur.on('closed', function(){
    ipc.send('refresh-group')
  })
});

//functonality of menu buttons

$('#J').on('click', function () {
  ipc.send('change-main', 'joueurs/index.html')
});
$('#G').on('click', function () {
  ipc.send('change-main', 'groupes/index.html')
});
$('#E').on('click', function () {
  ipc.send('change-main', 'entreneurs/index.html')
});
$('#P').on('click', function () {
  ipc.send('change-main', 'paiement/index.html')
});
$('#U').on('click', function () {
  ipc.send('change-main', 'utilisateur/index.html')
});
$('#D').on('click', function () {
  ipc.send('change-main', 'index.html')
});

//functionality of group buttons
$('#ajouterGroupe').on('click', function () {
  ajouterGroupe = new BrowserWindow({
    width: 1150,
    height: 750,
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
  })
  ajouterGroupe.loadFile('groupes/ajouter.html')
  ajouterGroupe.once("ready-to-show", function(){
    ajouterGroupe.show();
  })
  ajouterGroupe.on('closed', function(){
    ipc.send('refresh-group')
  })
});

//functionality of coech buttons
$('#ajouterEntreneur').on('click', function () {
  ajouterEntreneur = new BrowserWindow({
    width: 1150,
    height: 650,
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
  })
  ajouterEntreneur.loadFile('entreneurs/ajouter.html')
  ajouterEntreneur.once("ready-to-show", function(){
    ajouterEntreneur.show();
  })
  ajouterEntreneur.on('closed', function(){
    ipc.send('refresh-group')
  })
});
