var tables = require('../config/scripts/db.js');
let currentMonth = new Date().toLocaleString('fr', {month: 'long'})
let currentYear = new Date().getFullYear()
let months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
let months2 = ['août', 'septembre', 'octobre', 'novembre', 'décembre','janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet']
var modalShowPayment = document.getElementById("myModalShowPayment");
var modalPayment = document.getElementById("myModalPayment");
var  _changed = false
var table
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
       player.id, player.Nom, player.Prenom, player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe, createdAt, paiementPour, montant])
       createdAt = '';
       paiementPour = '';
       montant = '';
       classe = ''
       disablePaye = ''
       disableCancel = 'disabled'
       hiddenIdPayment = ''
    })
    table = $('#table_paiement').DataTable({
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
 * Check paymet
 * @return void
*/
function checkPayment(){
  $('table#table_paiement').on('click', 'button.payment', function(event){
      modalPayment.style.display = "block";
      let date = new Date();
      $('input[name=payment_for]').each(function(){
            $(this).css('display', 'inline');
      });
      let year = currentYear
      $('table#table_paiement_for tbody td').each((index, month)=>{
        if (index == 5) {
          year++;
        }
        $(month).find('span.year').html(year)
      })
      // $.each(months2, (index, month)=>{
      //
      // })
      $('input[name=payment_for]').closest('td').removeClass('payedCell');
      $('span#date_now').html(date.toLocaleString('fr-FR',  { year: 'numeric', month: 'long', day: 'numeric' }));
      $('input#fname_lname').val($(this).closest('tr').find('td').eq(2).text()+' '+$(this).closest('tr').find('td').eq(1).text());

      if (date.getMonth() >= 1 && date.getMonth() <= 6) {
        $("div#month_container").animate({ scrollTop: $("div#month_container").height()});
      }
      $('input#cat_grp').val($(this).closest('tr').find('td').eq(3).text());
      $('input#idPlayerPayment').val($(this).closest('tr').find('td').find('input[type=hidden][name=idPlayer]').val());
      joueurs.findOne({
        where: {id: $(this).closest('tr').find('td').find('input[type=hidden][name=idPlayer]').val()},
        include: [{model: paiement}]
      }).then(player =>{
        $.each(player.paiements, (index, paiement)=>{
          if (paiement.PaiementPour.replace(/\D/g, '').trim() == currentYear) {
            $('input[name=payment_for]')[months2.indexOf(paiement.PaiementPour.replace(/[0-9]/g, '').trim())].style.display = 'none';
            $('input[name=payment_for]')[months2.indexOf(paiement.PaiementPour.replace(/[0-9]/g, '').trim())].parentElement.className += ' payedCell';
          }

        });
      })
  });
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
  $('table#table_show_months').on('click', 'button.addPayment', function(event){
    let instPaiment = paiement.build({
      PaiementPour: months[$(this).closest('tr').find('span#month').attr('data-number')]+' '+currentYear,
      Montant: $(this).closest('tr').find('input#price_payment').val(),
      joueurId : $('input[type=hidden]#show_id_player').val()
    })
    instPaiment.save().then((payment)=>{
      _changed = true
      $(this).closest('tr').addClass('rowPayed')
      $(this).closest('tr').find('input#price_payment').prop('disabled', true)
      $(this).closest('tr').find('input#price_payment').val(payment.Montant)
      $(this).closest('td').append('<button class="btn btn-danger cancelPayment"><i class="fas fa-times"></i></button>')
      $(this).closest('tr').find('input[type=hidden][name=showIdPayment]').val(payment.id)
      $(this).remove()
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
    $('table#table_show_months').on('click', 'button.cancelPayment', function(event){
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
                  id: $(this).closest('tr').find('input[type=hidden][name=showIdPayment]').val()
                }
              }).then(()=>{
                  _changed = true
                $(this).closest('tr').removeClass('rowPayed')
                $(this).closest('tr').find('input#price_payment').removeAttr('disabled')
                $(this).closest('tr').find('input#price_payment').val('50')
                $(this).closest('td').append('<button class="btn btn-success addPayment"><i class="fas fa-check"></i></button>')
                $(this).remove()
              });
            }
      })
    })
}
/**
 * Show all payments
 * @return void
*/
function showPayments(){
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
      idPayments = player.paiements.map(function(item) { return item["id"];})
      $('span#show_fname_lname').html(player.Nom+' '+player.Prenom)
      $('span#show_cat_grp').html(player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe)
      $('input#show_id_player').val(player.id)
      let classe = ''
      let button = '<button class="btn btn-success addPayment"><i class="fas fa-check"></i></button>'
      let disabled = ''
      let price = 50
      let idPayment = ''
      $.each(months2, (index, month)=>{
        if (index == 5) {
          year = currentYear+1;
        }
        let bold = (index == 0 || index == 11)? '': 'font-weight-bold'
        if (payedMonth.includes(month+' '+year)) {
          classe = 'rowPayed'
          button = '<button class="btn btn-danger cancelPayment"><i class="fas fa-times"></i></button>'
          disabled = 'disabled'
          price = payedPrice[payedMonth.indexOf(month+' '+year)]
          idPayment = idPayments[payedMonth.indexOf(month+' '+year)]
        }
        $('table#table_show_months tbody').append('<tr class="'+classe+' '+bold+'">'+
        '<td><input type="hidden" name="showIdPayment" value="'+ idPayment+'"/><span id="month" data-number="'+months.indexOf(month)+'">'+month+'</span> '+year+'</td>'+
        '<td class="input-box"><input '+disabled+' type="text" class="form-control form-control-sm m-1" size="2" value="'+price+'" id="price_payment"/><span style="top: 19px;" class="unit">DH</span></td>'+
        '<td>'+button+'</td>'+
        '</tr>')
        classe = ''
        button = '<button class="btn btn-success addPayment"><i class="fas fa-check"></i></button>'
        disabled = ''
        price = 50
        idPayment = ''
      })
    })
  })
}
/**
  * Show all payments
  * @return void
*/
function showAllPayments(){
  $('button#show_all_payments').on('click', function(){
      table.search('').columns().search('').draw()
  })
}
/**
  * Show all payed payments
  * @return void
*/
function showPayedPayments(){
  $('button#payed_payments').on('click', function(){
      table.column(6).search(currentMonth+' '+currentYear).draw()
  })
}
/**
  * Show all unpayed payments
  * @return void
*/
function showUnpayedPayments(){
  $('button#unpayed_payments').on('click', function(){
      table.column(6).search('^$', true, false).draw()
  })
}
$(document).ready(function(){
  $('span#monthName').html(currentMonth);
  fillPaymentTable()
  checkPayment()
  addPayment()
  deletePayment()
  showPayments()
  showAllPayments()
  showPayedPayments()
  showUnpayedPayments()
})
