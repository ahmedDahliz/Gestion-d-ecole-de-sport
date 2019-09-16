var tables = require('../config/scripts/db.js');
let currentMonth = new Date().toLocaleString('fr', {month: 'long'})
let currentYear = new Date().getFullYear()
let months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
let months2 = ['août', 'septembre', 'octobre', 'novembre', 'décembre','janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet']
var modalShowPayment = document.getElementById("myModalShowPayment");
let _player
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
    let createdAt = '';
    let paiementPour = '';
    let montant = '';
    let classe = ''
    let disablePaye = ''
    let disableCancel = 'disabled'
    let hiddenIdPayment = ''
    $.each(players, (index, player)=>{
        $.each(player.paiements, (index, paiement)=>{
          if (paiement.PaiementPour === currentMonth+' '+currentYear) {
            createdAt = new Date(paiement.createdAt).toLocaleDateString();
            paiementPour = paiement.PaiementPour;
            montant = paiement.Montant + ' DH';
            classe = 'payed'
            disablePaye = 'disabled'
            disableCancel = ''
            hiddenIdPayment = '<input type="hidden" name="idPayment" value="'+paiement.id+'"/>'
            return false;
          }
        })
       paymentData.push([hiddenIdPayment+'<input type="hidden" name="idPlayer" value="'+player.id+'" class="'+classe+'"/><button '+disablePaye+' name="payment" class="btn btn-success align-middle payment" title="Valider paiement pour '+currentMonth+'"><i class="fas fa-check"></i></button> <button name="show_payment" class="btn btn-show align-middle show_payment" title="Afficher les paiements"><i class="fas fa-eye"></i></button> <button title="Annuler paiement  pour '+currentMonth+'" '+disableCancel+' name="cancel_payment" class="btn btn-danger align-middle cancel_payment"><i class="fas fa-times"></i></button>',
       player.Nom, player.Prenom, player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe, createdAt, paiementPour, montant])
       createdAt = '';
       paiementPour = '';
       montant = '';
       classe = ''
       disablePaye = ''
       disableCancel = 'disabled'
       hiddenIdPayment = ''
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
/**
 * delete a payments
 * @return void
*/
function deletePayment(){
  var ConfirmationDialog = require('electron').remote.dialog
  var image = require('electron').remote.nativeImage
  let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')
    $('table#table_paiement').on('click', 'button.cancel_payment', function(event){
        ConfirmationDialog.showMessageBox({
          type: 'question',
          buttons: ['Oui', 'Non'],
          title: 'Confirmation de suppression !',
          message: 'Vous voulez vraiment annuler cette paiement ?',
          noLink: true,
          icon: iconQuestion,
          cancelId:-1
        }, response =>{
            if (!response) {
              paiement.destroy({
                where: {
                  id: $(this).closest('td').find('input[type=hidden][name=idPayment]').val()
                }
              }).then(()=>{
                ipc.send('refresh-group')
              });
            }
      })
    })
}
/**
 * Show all payments
 * @return void
*/
function showPayment(){
  $('table#table_paiement').on('click', 'button.show_payment', function(event){
    joueurs.findOne({
      where: {
        id: $(this).closest('td').find('input[type=hidden][name=idPlayer]').val()
      },
      include: [{model: paiement}, {model: groupes, include: [{model: categories}]}]
    }).then((player)=>{
      year = currentYear
      $('table#table_show_months tbody tr').remove()
      modalShowPayment.style.display = "block";
      payedMonth = player.paiements.map(function(item) { return item["PaiementPour"];})
      payedPrice = player.paiements.map(function(item) { return item["Montant"];})
      $('span#show_fname_lname').html(player.Nom+' '+player.Prenom)
      $('span#show_cat_grp').html(player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe)
      $('input#show_id_player').val(player.id)
      let classe = ''
      let button = '<button class="btn btn-success"><i class="fas fa-check"></i></button>'
      let disabled = ''
      let price = 50
      $.each(months2, (index, month)=>{
        if (index == 5) {
          year = currentYear+1;
        }
        let bold = (index == 0 || index == 11)? '': 'font-weight-bold'
        if (payedMonth.includes(month+' '+year)) {
          classe = 'rowPayed'
          button = '<button class="btn btn-danger"><i class="fas fa-times"></i></button>'
          disabled = 'disabled'
          price = payedPrice[payedMonth.indexOf(month+' '+year)]
        }
        $('table#table_show_months tbody').append('<tr class="'+classe+' '+bold+'">'+
        '<td>'+month+' '+year+'</td>'+
        '<td class="input-box"><input '+disabled+' type="text" class="form-control form-control-sm m-1" size="2" value="'+price+'" id="price_payment"/><span style="top: 19px;" class="unit">DH</span></td>'+
        '<td>'+button+'</td>'+
        '</tr>')
        classe = ''
        button = '<button class="btn btn-success"><i class="fas fa-check"></i></button>'
        disabled = ''
        price = 50
      })
    })
  })
}
$(document).ready(function(){
  $('span#monthName').html(currentMonth);
  fillPaymentTable()
  addPayment()
  deletePayment()
  showPayment()
})
