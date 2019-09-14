var tables = require('../config/scripts/db.js');
let currentMonth = new Date().toLocaleString('fr', {month: 'long'})
let currentYear = new Date().getFullYear()
let months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
joueurs = tables.joueurs;
paiement = tables.paiement;
categories = tables.categorie;
groupes = tables.groupes;
/**
 * Fill the payment index table
 * @return void
*/
function fillPaymentTable(){
  let paymentData = [];
  joueurs.findAll({
    include: [{model: paiement},{model: groupes, include: [{model: categories}]}]
  }).then(players=>{
    // console.log('hiiiha ==>', players[0].paiements[0].PaiementPour);
    let datePaiement = '';
    let paiementPour = '';
    let montant = '';
    let classe = ''
    let disablePaye = ''
    let disableCancel = 'disabled'
    $.each(players, (index, player)=>{
        $.each(player.paiements, (index, paiement)=>{
          if (paiement.PaiementPour === currentMonth+' '+currentYear) {
            datePaiement = new Date(paiement.DatePaiement).toLocaleDateString();
            paiementPour = paiement.PaiementPour;
            montant = paiement.Montant + ' DH';
            classe = 'payed'
            disablePaye = 'disabled'
            disableCancel = ''
          }
        })
       paymentData.push(['<input type="hidden" id="idPlayer" value="'+player.id+'" class="'+classe+'"/><button '+disablePaye+' name="payment" class="btn btn-success align-middle payment" title="Valider paiement"><i class="fas fa-check"></i></button> <button name="show_payment" class="btn btn-show align-middle show_payment" title="Afficher les paiements"><i class="fas fa-eye"></i></button> <button title="Annuler paiement" '+disableCancel+' name="cancel_payment" class="btn btn-danger align-middle cancel_payment"><i class="fas fa-times"></i></button>',
       player.Nom, player.Prenom, player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe, datePaiement, paiementPour, montant])
       datePaiement = '';
       paiementPour = '';
       montant = '';
       classe = ''
       disablePaye = ''
       disableCancel = 'disabled'
    })

    $('#table_paiement').DataTable({
      // columnDefs: [
      //   {
      //     orderable: false,
      //     className: "text-center",
      //     targets: [ 0 ],
      //     render: function (data, type, full, meta){
      //          return '<input class="table-radio" type="radio" name="group">';
      //      }
      //   }
      // ],
      data: paymentData,
      pageLength : 7,
      lengthMenu: [[7, 10, 30, 50, -1], [7, 10, 30, 50, 'Tous']],
      language: {
        processing:     "Traitement en cours...",
        search:         "Rechercher&nbsp;:",
        lengthMenu:    "Afficher _MENU_ &eacute;l&eacute;ments",
        info:           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
        infoEmpty:      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
        infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
        infoPostFix:    "",
        loadingRecords: "Chargement en cours...",
        zeroRecords:    "Aucun &eacute;l&eacute;ment &agrave; afficher",
        emptyTable:     "Aucune donnée disponible dans le tableau",
        paginate: {
            first:      "Premier",
            previous:   "Pr&eacute;c&eacute;dent",
            next:       "Suivant",
            last:       "Dernier"
        },
        aria: {
            sortAscending:  ": activer pour trier la colonne par ordre croissant",
            sortDescending: ": activer pour trier la colonne par ordre décroissant"
        }
      }
    });
    $('input[type=hidden].payed').closest('tr').addClass('rowPayed')
  })
}
/**
 * add payment
 * @return void
*/
 function addPayment(){
  $('button#submit_payment').on('click', function(){
    payments = []
    $.each($('input[name=payment_for]:checked'), (index, month)=>{
      payments.push({
        PaiementPour: months[month.value]+' '+currentYear,
        Montant: $('input#price').val(),
        joueurId : $('input[type=hidden]#idPlayerPayment').val()
        })
    })
    paiement.bulkCreate(payments).then(() =>{
        ipc.send('refresh-group')
      })
  })
}
$(document).ready(function(){
  $('span#monthName').html(currentMonth);
  fillPaymentTable()
  addPayment()
})
