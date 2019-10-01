const Sequelize = require('sequelize');
var tables = require('../config/scripts/db.js');
var fs = require('fs');
const path = require('path')

var joueurs  = tables.joueurs;
var paiement  = tables.paiement;
var jours  = tables.jours;
var horaire  = tables.horaire;
var categories  = tables.categorie;
var groupes  = tables.groupes;
var defaultAvatar = path.join(__dirname, '..\\assets\\image\\avatars\\default.png');
var defaultCert = path.join(__dirname, '..\\assets\\image\\certificats\\defaultFile.png');
var avatarPath = defaultAvatar;
var certPath = defaultCert;
var avatarFile, certFile;
let table
/**
 * count number of players in group
 * @return integer
*/
function getNumberOfPlayers(groupe, nbrPlayer){
  if (groupe.val()) {
  joueurs.findAndCountAll({
    include:[{
      model: groupes,
      where:{id: groupe.val()},
      include:[{model: categories}]
    }]
  }).then(players=>{
    if (players.count > 20) {
      nbrPlayer.closest('td').css('color', 'red')
    } else nbrPlayer.closest('td').css('color', 'black')
    $('span#nom_groupe').html($('select#groupe option:selected').text())
    $('span#nom_categorie').html($('select#categorie option:selected').text())
    $('span#nom_jours').html($('select#jours option:selected').text())
    nbrPlayer.html(players.count)
  })
    }
}
/**
 * Hide an element
 * @param selector @type tag element
 * @return void
*/
function hideElement(selector){
  setTimeout(()=>{selector.html('')}, 3000);
}
/**
 * Clear inputs of add player form
 * @return void
*/
function clearInputs(){
  avatarPath = defaultAvatar;
  certPath = defaultCert;
  $('input#lname').val('');
  $('input#fname').val('');
  $('input#phone1').val('');
  $('input#phone2').val('');
  $('input#phone3').val('');
  $('input#birthday').val('');
  $('textarea#adress').val('');
  $('input#annual_price').val('');
  $('img#cert').attr('src',defaultCert);
  $('img#avatar').attr('src',defaultAvatar);
}
/**
 * validate the add player form
 * @param lname @type input tag
 * @param fname @type input tag
 * @param phone1 @type input tag
 * @param phone2 @type input tag
 * @param phone3 @type input tag
 * @param price @type input tag
 * @param birthday @type input date tag
 * @param adresse @type textarea tag
 * @param message @type span tag
 *
 * @return boolean
*/
function validatePlayerData(lname, fname, phone1, phone2, phone3 , annualPrice, birthday, message){
  if (!lname.val()) {
    message.html('le nom est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  if (!fname.val()) {
    message.html('le prenom est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  if (!phone1.val()) {
    message.html('le telephone 1 est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  let validePhone = /(\+212|0)([ \-_/]*)(\d[ \-_/]*){9}/
  if (!validePhone.test(phone1.val())) {
    message.html('le N° de télephone n\'est pas valide !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  let validePrice= /^[0-9]{2,3}$/
  if (!annualPrice.val()) {
    message.html('le prix annuel est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  if (!validePrice.test(annualPrice.val())) {
    message.html('le prix annuel n\'est pas valide !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  if (!birthday.val()) {
    message.html('la date de naissance est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  if (phone2.val()) {
    if (!validePhone.test(phone2.val())) {
      message.html('le N° de télephone 2 n\'est pas valide !')
      message.removeClass('text-success text-danger').addClass('text-warning')
      hideElement(message);
      return false;
    }
  }
  if (phone3.val()) {
    if (!validePhone.test(phone3.val())) {
      message.html('le N° de télephone 3 n\'est pas valide !')
      message.removeClass('text-success text-danger').addClass('text-warning')
      hideElement(message);
      return false;
    }
  }
  return true;
}
/**
 * get the dd/MM/yyyy date firmat
 * @param date @type date
 * @return String
*/
function getLocalDate(date){
  return new Date(date).toLocaleDateString();
}
/**
 * get the yyyy-MM-dd date firmat
 * @param date @type date
 * @return String
*/
function getShortDate(date){
  var date =  new Date(date);
  y = date.getFullYear()
  m = date.getMonth()+1
  d = date.getDate()
  if (m < 10)
      m = '0' + m;
  if (d < 10)
      d = '0' + d;
  return y+'-'+m+'-'+d
}
/**
 * init the add player Window
 * @return void
*/
function initAddPlayer(){
  jours.findAll({
      include: [{model: categories, include: groupes, require: true}],
  }).then(res => {
      //itirate days
    if (res) {
      pJours = res[0]
      if (pJours) {
        $.each(res, function(index, jours){
          $('select#jours').append(new Option(jours.Jour1+"-"+jours.Jour2, jours.id));
        })
        pCat = pJours.categories[0]
        $.each(pJours.categories, function(index, cat){
          $('select#categorie').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#categorie').change()
      }
    }

  });
  $('select#jours').on('change', function() {
    jours.findOne({
      where: {id: $(this).val()},
        include: [{model: categories}]
    }).then(jours => {
        //itirate times for the first days
        $('select#categorie option').remove();
        $.each(jours.categories, function(index, cat){
          $('select#categorie').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#categorie').change()

    });
  });
  $('select#categorie').on('change', ()=>{
    categories.findOne({
      where: {id: $('select#categorie').val()},
      include: {model: groupes, where: {jourId:  $('select#jours').val() }}
    }).then(cats => {
      $('select#groupe option').remove();
      if (cats) {
        $.each(cats.groupes, function(index, grp){
            $('select#groupe').append(new Option(grp.NomGroupe, grp.id))
        })
        getNumberOfPlayers($('select#groupe'), $('span#nbr_joueurs'))
      }
    })
  })
  $('select#groupe').on('change', ()=>{
    getNumberOfPlayers($('select#groupe'), $('span#nbr_joueurs'))
  })
}
/**
 * upload image
 * @param file @trpe object
 * @param name @type String
 * @param type @type String
 * @return void
*/
function uploadImage(file, name, type, message){
  var path = require('path');
  var imageExt = ['JPEG', 'JPG', 'PNG']
  fs.readFile(file[0], (err, data)=>{
    if (!err) {
      let ext = file[0].split('.')[1]
      newPath = path.join(__dirname+ '/../assets/image/'+type+'/'+name+'_'+(new Date).getTime()+'.'+ext);
      if (imageExt.includes(ext.toUpperCase())) {
        message.html('')
        fs.writeFile(newPath, data, function (err) {
          if (err) {
            message.html('une erreur dans le chargement de l\'image !');
            message.removeClass('text-success text-warning').addClass('text-danger');
            return;
          }
        });
        if (type == 'avatars') {
          avatarPath = newPath;
        }else if (type == 'certificats') certPath = newPath;
      }else {
        message.html("l'image doit être : .png, .jpeg ou .jpg");
        message.removeClass('text-success text-danger').addClass('text-warning');
      }
    }else{message.html('une erreur dans le chargement de l\'image !');
    message.removeClass('text-success text-warning').addClass('text-danger')};
  })
}
/**
 * add player
 *@return void
*/
function addPlayer(){
  $('button#addAvatar').on('click', function(){
    if ($('input#fname').val() != '' && $('input#lname').val() != '') {
      var SaveDialog = require('electron').remote.dialog
      SaveDialog.showOpenDialog((file)=>{
          if (file !== undefined) {
            uploadImage(file, $('input#fname').val()+$('input#lname').val() ,'avatars', $('span#msg_add_player'));
            setTimeout(()=>{
              console.log('upload complete');
              $('img#avatar').attr('src',avatarPath)
            }, 1000)

          }
        })
    } else {
      $('span#msg_add_player').html('veuillez saisir le nom et le prenom dabord !')
      $('span#msg_add_player').removeClass('text-success text-danger').addClass('text-warning')
    }
  })
  $('button#addCert').on('click', function(){
    if ($('input#fname').val() != '' && $('input#lname').val() != '') {
      var SaveDialog = require('electron').remote.dialog
      SaveDialog.showOpenDialog((file)=>{
          if (file !== undefined) {
            uploadImage(file, $('input#fname').val()+$('input#lname').val() ,'certificats', $('span#msg_add_player'));
            setTimeout(()=>{
              console.log('upload complete');
              $('img#cert').attr('src',certPath)
            }, 1000)
          }
        })
    } else {
      $('span#msg_add_player').html('veuillez saisir le nom et le prenom dabord !')
      $('span#msg_add_player').removeClass('text-success text-danger').addClass('text-warning')
    }
  })
  $('button#ajouterJoueur').on('click', function(){
      if(validatePlayerData($('input#lname'), $('input#fname'), $('input#phone1'), $('input#phone2'), $('input#phone3') , $('input#annual_price'), $('input#birthday'), $('span#msg_add_player'))){
        if (parseInt($('span#nbr_joueurs').html()) >= 20) {
          let msg = 'Le nombre des joueurs dans ce groupe va dépasser 20 !';
          if (parseInt($('span#nbr_joueurs').html()) > 20) {
            msg = 'Le nombre des joueurs dans ce groupe a dépasser 20 !';
          }
            var ConfirmationDialog = require('electron').remote.dialog
            ConfirmationDialog.showMessageBox({
              type: 'warning',
              buttons: ['Continuer', 'Annuler'],
              title: 'Information !',
              message: msg,
              noLink: true,
              cancelId:-1
            }, response =>{
                if (response) {
                  return;
                }else{
                  var joueurIns =  joueurs.build({
                    Nom: $('input#lname').val(),
                    Prenom: $('input#fname').val(),
                    Tele1: $('input#phone1').val(),
                    Tele2: $('input#phone2').val(),
                    Tele3: $('input#phone3').val(),
                    DateNaissance: $('input#birthday').val(),
                    Adresse:  $('textarea#adress').val(),
                    // Prix: $('input#price').val(),
                    PrixAnnuel: $('input#annual_price').val(),
                    photo: avatarPath,
                    certificat: certPath
                  })
                  joueurIns.save().then(player=>{
                    player.setGroupe($('select#groupe').val()).then((playerGroup)=>{
                      playerGroup.getGroupe().then(grp=>{
                        grp.getCategorie().then(cat=>{
                          grp.getJour().then(jrs=>{
                            $('table#table_new_palyer tbody').append('<tr><td class="text-center">'+
                              '<input type="radio" name="joueur" value="'+player.id+'" class="table-radio align-middle"></td>'+
                              '<td>'+player.Nom+'</td>'+
                              '<td>'+player.Prenom+'</td>'+
                              '<td>'+getLocalDate(player.DateNaissance)+'</td>'+
                              '<td>'+player.Tele1+'</td>'+
                              '<td>'+player.Tele2+'</td>'+
                              '<td>'+player.Tele3+'</td>'+
                              '<td>'+player.Adresse+'</td>'+
                              '<td>'+player.PrixAnnuel+' DH</td>'+
                              '<td>'+jrs.Jour1+'-'+jrs.Jour2+'</td>'+
                              '<td>'+cat.NomCategorie+'</td>'+
                              '<td>'+grp.NomGroupe+'</td></tr>');
                              getNumberOfPlayers($('select#groupe'), $('span#nbr_joueurs'))
                              clearInputs();
                          })
                        })
                      })
                    })
                  })
                }
            })
        }else {
          var joueurIns =  joueurs.build({
            Nom: $('input#lname').val(),
            Prenom: $('input#fname').val(),
            Tele1: $('input#phone1').val(),
            Tele2: $('input#phone2').val(),
            Tele3: $('input#phone3').val(),
            DateNaissance: $('input#birthday').val(),
            Adresse:  $('textarea#adress').val(),
            // Prix: $('input#price').val(),
            PrixAnnuel: $('input#annual_price').val(),
            photo: avatarPath,
            certificat: certPath
          })
          joueurIns.save().then(player=>{
            player.setGroupe($('select#groupe').val()).then((playerGroup)=>{
              playerGroup.getGroupe().then(grp=>{
                grp.getCategorie().then(cat=>{
                  grp.getJour().then(jrs=>{
                    $('table#table_new_palyer tbody').append('<tr><td class="text-center">'+
                      '<input type="radio" name="joueur" value="'+player.id+'" class="table-radio align-middle"></td>'+
                      '<td>'+player.Nom+'</td>'+
                      '<td>'+player.Prenom+'</td>'+
                      '<td>'+getLocalDate(player.DateNaissance)+'</td>'+
                      '<td>'+player.Tele1+'</td>'+
                      '<td>'+player.Tele2+'</td>'+
                      '<td>'+player.Tele3+'</td>'+
                      '<td>'+player.Adresse+'</td>'+
                      '<td>'+player.PrixAnnuel+' DH</td>'+
                      '<td>'+jrs.Jour1+'-'+jrs.Jour2+'</td>'+
                      '<td>'+cat.NomCategorie+'</td>'+
                      '<td>'+grp.NomGroupe+'</td></tr>');
                      getNumberOfPlayers($('select#groupe'), $('span#nbr_joueurs'))
                      clearInputs();
                  })
                })
              })
            })
          })
        }
      }
  })
}
/**
 * Delete an new added player
 * @return void
*/
function deleteAddedPlayer(){
  $('button#supprimerJoueur').on('click', function(event){
    var ConfirmationDialog = require('electron').remote.dialog
    var image = require('electron').remote.nativeImage
    let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer ce joueur ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          joueurs.destroy({
            where: {
              id: $('input:radio[name=joueur]:checked').val()
            }
          }).then(()=>{
            $('input:radio[name=joueur]:checked').closest('tr').remove();
            $("button#modifierJoueur").prop("disabled", true);
            $("button#supprimerJoueur").prop("disabled", true);
            getNumberOfPlayers($('select#groupe'), $('span#nbr_joueurs'))
          });
        }
    })
  })
}
let idPlayer;
/**
 * Edit added player data
 * @return void
*/
function editAddedPlayer(){
  $('button#modifierJoueur').on('click', function(event){
    joueurs.findOne({
      where: {
        id: $('input:radio[name=joueur]:checked').val()
      },
      include: [{model: groupes, include: [{model: categories}]}]
    }).then((player)=>{
      console.log(player);
      idPlayer = player.id;
      $('input#lname').val(player.Nom);
      $('input#fname').val(player.Prenom);
      $('input#phone1').val(player.Tele1);
      $('input#phone2').val(player.Tele2);
      $('input#phone3').val(player.Tele3);
      $('input#birthday').val(getShortDate(player.DateNaissance));
      $('textarea#adress').val(player.Adresse);
      $('input#annual_price').val(player.PrixAnnuel);
      $('select#categorie').val(player.groupe.categorie.id).change();
      $('img#avatar').attr('src',player.photo);
      $('img#cert').attr('src',player.certificat);
      $('button#ajouterJoueur').hide();
      $('button#modifierJoueur').hide();
      $('button#supprimerJoueur').hide();
      $('button#updatePlayer').show();
      $("button#modifierJoueur").prop("disabled", true);
      $("button#supprimerJoueur").prop("disabled", true);
      setTimeout(()=>{$('select#groupe').val(player.groupe.id)}, 300)
      $('input:radio[name=joueur]:checked').closest('tr').remove()
      // player.getGroupe().then(groupe=>{
      //   groupe.getCategorie().then(categorie=>{
      //
      //   })
      // })
    });
  })
}
/**
 * update added player
 * @return void
*/
function updateAddedPlayer(){
  $('button#updatePlayer').on('click', function(){
    if(validatePlayerData($('input#lname'), $('input#fname'), $('input#phone1'), $('input#phone2'), $('input#phone3') , $('input#annual_price'), $('input#birthday'), $('span#msg_add_player'))){
      joueurs.findOne({
        where: {id: idPlayer}
      }).then(playerToUpdate=>{
        playerToUpdate.update({
          Nom: $('input#lname').val(),
          Prenom: $('input#fname').val(),
          Tele1: $('input#phone1').val(),
          Tele2: $('input#phone2').val(),
          Tele3: $('input#phone3').val(),
          DateNaissance: $('input#birthday').val(),
          Adresse:  $('textarea#adress').val(),
          PrixAnnuel: $('input#annual_price').val(),
          photo: avatarPath,
          certificat: certPath,
          groupeId: $('select#group').val()
        }).then(updatedPlayer=>{
          updatedPlayer.setGroupe($('select#groupe').val()).then((playerGroup)=>{
            playerGroup.getGroupe().then(grp=>{
              grp.getCategorie().then(cat=>{
                $('table#table_new_palyer tbody').append('<tr><td class="text-center">'+
                  '<input type="radio" name="joueur" value="'+updatedPlayer.id+'" class="table-radio align-middle"></td>'+
                  '<td>'+updatedPlayer.Nom+'</td>'+
                  '<td>'+updatedPlayer.Prenom+'</td>'+
                  '<td>'+getLocalDate(updatedPlayer.DateNaissance)+'</td>'+
                  '<td>'+updatedPlayer.Tele1+'</td>'+
                  '<td>'+updatedPlayer.Tele2+'</td>'+
                  '<td>'+updatedPlayer.Tele3+'</td>'+
                  '<td>'+updatedPlayer.Adresse+'</td>'+
                  '<td>'+updatedPlayer.Prix+' DH</td>'+
                  '<td>'+cat.NomCategorie+'</td>'+
                  '<td>'+grp.NomGroupe+'</td></tr>');
                  clearInputs();
                  $('button#ajouterJoueur').show();
                  $('button#modifierJoueur').show();
                  $('button#supprimerJoueur').show();
                  $('button#updatePlayer').hide();
              })
            })
          })
        })

      })
    }
  })

}
/**
 * fill table player
 * @return void
*/
function fillTablePlayer(){
  jours.findAll().then(res => {
      //itirate days
      $('select#sch_day').append(new Option("Tous", 0))
      $.each(res, function(index, jours){
        $('select#sch_day').append(new Option(jours.Jour1+"-"+jours.Jour2, jours.id));
      })
  });
  categories.findAll().then(res => {
      //itirate days
      $('select#sch_cat').append(new Option("Tous", 0))
      $.each(res, function(index, cat){
        $('select#sch_cat').append(new Option(cat.NomCategorie, cat.id));
      })
  });
  groupes.findAll({
    group: ['NomGroupe']
  }).then(res => {
      //itirate days
      $('select#sch_grp').append(new Option("Tous", 0))
      $.each(res, function(index, grp){
        $('select#sch_grp').append(new Option(grp.NomGroupe, grp.id));
      })
      // let pCat = pJours.categories[0]
      // $.each(pJours.categories, function(index, cat){
      //   $('select#sch_cat').append(new Option(cat.NomCategorie, cat.id));
      // })
      // $('select#sch_cat').change()
  });

  $('select#abs_cat').on('change', ()=>{
      categories.findOne({
        where:{id: $('select#abs_cat').val()},
        include:[{model: groupes}]
      }).then(cat=>{
          $('select#abs_grp option').remove();
        $.each(cat.groupes, (index, groupe)=>{
          $('select#abs_grp').append(new Option(groupe.NomGroupe, groupe.id))
        })
      })
  })
  let playerData = [];
  joueurs.findAll({
    include: [{model: groupes, include: [{model: categories},{model: jours}]}]
  }).then(players=>{
    $.each(players, (index, player)=>{
      playerData.push(['<input type="radio" name="player" value="'+player.id+'" class="table-radio align-middle">', player.id,player.Nom, player.Prenom, player.Tele1, getLocalDate(player.DateNaissance), player.groupe.jour.Jour1+'-'+player.groupe.jour.Jour2 ,player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe])
    })
    table = $('#table_player').DataTable({
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
      data: playerData,
      sDom: 'lrtip',
      // dom: 'Bfrtip',
      buttons: [
           {
              extend: 'excel',
              text: '<i class="fas fa-file-excel"></i> Excel',
              exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
              },
              className: 'btn btn-success btn-xs',
              customize: function (xlsx){
                var sheet = xlsx.xl.worksheets['sheet1.xml'];
                 $('row:first c', sheet).attr( 's', '42' );
              }
           },
           {
              extend: 'pdf',
              text: '<i class="fas fa-file-excel"></i> Pdf',
              exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
              },
              className: 'btn btn-danger btn-xs'
           }
       ],
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

  })
  $('select#sch_cat').on('change', ()=>{
    // if ($('select#sch_day').val() == 0 && $('select#sch_cat').val() == 0) {
    //   $('select#sch_grp option').remove();
    //   $('select#sch_grp').append(new Option("Tous", 0))
    //   return;
    // }
    // if ($('select#sch_day').val() == 0 && $('select#sch_cat').val() != 0) {
    //   groupes.findAll({
    //     include: {model: categories, where: {id: $('select#sch_cat').val()}},
    //     group: ['NomGroupe']
    //   }).then(grps => {
    //     $('select#sch_grp option').remove();
    //     $('select#sch_grp').append(new Option('tous', 0))
    //     if (grps) {
    //       console.log(grps);
    //       $.each(grps, function(index, grp){
    //           $('select#sch_grp').append(new Option(grp.NomGroupe, grp.id))
    //       })
    //     }
    //     return;
    //   })
    // }
    // if ($('select#sch_day').val() != 0 && $('select#sch_cat').val() == 0) {
    //   groupes.findAll({
    //     include: {model: jours, where: {id:  $('select#sch_day').val() }},
    //     group: ['NomGroupe']
    //   }).then(grps => {
    //     $('select#sch_grp option').remove();
    //     $('select#sch_grp').append(new Option('tous', 0))
    //     if (grps) {
    //       $.each(grps, function(index, grp){
    //           $('select#sch_grp').append(new Option(grp.NomGroupe, grp.id))
    //       })
    //     }
    //   })
    // }
    // if ($('select#sch_day').val() != 0 && $('select#sch_cat').val() != 0) {
    //   groupes.findAll({
    //     include: [
    //       {
    //         model: jours, where: {id:  $('select#sch_day').val() }
    //       },
    //       {
    //         model: categories, where: {id:  $('select#sch_cat').val() }
    //       }
    //     ]
    //   }).then(grps => {
    //     $('select#sch_grp option').remove();
    //     $('select#sch_grp').append(new Option('tous', 0))
    //     console.log(grps);
    //     if (grps) {
    //       $.each(grps, function(index, grp){
    //
    //           $('select#sch_grp').append(new Option(grp.NomGroupe, grp.id))
    //       })
    //     }
    //   })
    // }

  })
  $('select#sch_day').on('change', ()=>{
    // if ($('select#sch_day').val() != 0) {
    //   categories.findAll({
    //     include: {model: jours, where: {id: $('select#sch_day').val()}}
    //   }).then(cats => {
    //     $('select#sch_cat option').remove();
    //     $('select#sch_cat').append(new Option('tous', 0))
    //     if (cats) {
    //       $.each(cats, function(index, cat){
    //           $('select#sch_cat').append(new Option(cat.NomCategorie, cat.id))
    //       })
    //     }
    //   })
    // }else {
    //   categories.findAll().then(cats => {
    //     $('select#sch_cat option').remove();
    //     $('select#sch_cat').append(new Option('tous', 0))
    //     if (cats) {
    //       $.each(cats, function(index, cat){
    //           $('select#sch_cat').append(new Option(cat.NomCategorie, cat.id))
    //       })
    //     }
    //   })
    // }
  })
}
/**
 * Delete a player
 * @return void
*/
function deletePlayer(){
  $('button#deletePlayer').on('click', function(event){
    var ConfirmationDialog = require('electron').remote.dialog
    var image = require('electron').remote.nativeImage
    let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer ce joueur ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          joueurs.destroy({
            where: {
              id: $('input:radio[name=player]:checked').val()
            }
          }).then(()=>{
            ipc.send('refresh-group')
          });
        }
    })
  })
}
/**
 * cancel add player
 * @return void
*/
function cancelAddPlayer(){
  $('button#cancelAdd').on('click', function(){
      clearInputs();
  })
}
let grpId;
/**
 * Show a player
 * @return void
*/
function showPlayer(){
  $('select.change').on('change', function(){
    isSaved = false;
    $('button#update_player').removeAttr('disabled');
  })
  $('input, textarea').on('input', function(){
    $('button#update_player').removeAttr('disabled');
    isSaved = false;
  })
  joueurs.findOne({
    where: {id: _idPlayer},
    include:[{model: groupes, include: [jours, categories]}]
  }).then(player=>{
    jours.findAll({
        include: [{model: categories, include: groupes, require: true}],
    }).then(res => {
        //itirate days
        pJours = res[0]
        grpId = player.groupe.id
        $.each(res, function(index, jours){
          $('select#edit_days').append(new Option(jours.Jour1+"-"+jours.Jour2, jours.id));
        })
        pCat = pJours.categories[0]
        $.each(pJours.categories, function(index, cat){
          $('select#edit_categorie').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#edit_days').val(player.groupe.jour.id).change()
        setTimeout(()=>{
          $('select#edit_categorie').val(player.groupe.categorie.id).change();
        }, 300)
        setTimeout(()=>{
          $('select#edit_group').val(player.groupe.id).change();
        }, 350)
        getNumberOfPlayers($('select#edit_group'), $('span#nbr_joueurs'))
        $('button#update_player').prop('disabled', true);
    });
    categories.findAll({
      include:[{model: groupes}]
    }).then(cats=>{
      let fCat = cats[0];
      $.each(cats, (index, cat)=>{
        $('select#edit_categorie').append(new Option(cat.NomCategorie, cat.id))
      })
      $.each(fCat.groupes, (index, groupe)=>{
        $('select#edit_group').append(new Option(groupe.NomGroupe, groupe.id))
      })


    })

    $('input#edit_lname').val(player.Nom);
    $('input#edit_fname').val(player.Prenom);
    $('input#edit_birthday').val(getShortDate(player.DateNaissance));
    $('input#edit_phone1').val(player.Tele1);
    $('input#edit_phone2').val(player.Tele2);
    $('input#edit_phone3').val(player.Tele3);
    $('input#edit_price').val(player.Prix);
    $('input#edit_anuual_price').val(player.PrixAnnuel);
    $('textarea#edit_adress').val(player.Adresse);
    $('img#avatar').attr('src', player.photo);
    $('img#cert').attr('src', player.certificat);
    avatarPath = player.photo;
    certPath = player.certificat
})
  $('select#edit_days').on('change', function() {
    jours.findOne({
      where: {id: $(this).val()},
        include: [{model: categories}]
    }).then(jours => {
        //itirate times for the first days
        $('select#edit_categorie option').remove();
        $.each(jours.categories, function(index, cat){
          $('select#edit_categorie').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#edit_categorie').change()

    });
  });
  $('select#edit_categorie').on('change', ()=>{
    categories.findOne({
      where: {id: $('select#edit_categorie').val()},
      include: {model: groupes, where: {jourId:  $('select#edit_days').val() }}
    }).then(cats => {
      $('select#edit_group option').remove();
      if (cats) {
        $.each(cats.groupes, function(index, grp){
            $('select#edit_group').append(new Option(grp.NomGroupe, grp.id))
        })
        getNumberOfPlayers($('select#edit_group'), $('span#nbr_joueurs'))
      }
    })

  })
    $('select#edit_group').on('change', ()=>{
        getNumberOfPlayers($('select#edit_group'), $('span#nbr_joueurs'))
    })
}
/**
 * updayePlayer
 * @return void
*/
function updatePlayer(){
  $('button#edit_avatar').on('click', function(){
    if ($('input#edit_fname').val() != '' && $('input#edit_lname').val() != '') {
      var SaveDialog = require('electron').remote.dialog
      SaveDialog.showOpenDialog((file)=>{
          if (file !== undefined) {
            uploadImage(file, $('input#edit_fname').val()+$('input#edit_lname').val() ,'avatars', $('span#msg_update_player'));
            setTimeout(()=>{
              console.log('upload complete');
              $('img#avatar').attr('src',avatarPath)
              isSaved = false;
              $('button#update_player').removeAttr('disabled');
            }, 1000)

          }
        })
    } else {
      $('span#msg_update_player').html('veuillez saisir le nom et le prenom dabord !')
      $('span#msg_update_player').removeClass('text-success text-danger').addClass('text-warning')
    }
  })
  $('button#edit_cert').on('click', function(){
    if ($('input#edit_fname').val() != '' && $('input#edit_lname').val() != '') {
      var SaveDialog = require('electron').remote.dialog
      SaveDialog.showOpenDialog((file)=>{
          if (file !== undefined) {
            uploadImage(file, $('input#edit_fname').val()+$('input#edit_lname').val() ,'certificats', $('span#msg_update_player'));
            setTimeout(()=>{
              console.log('upload complete');
              $('img#cert').attr('src',certPath)
              isSaved = false;
              $('button#update_player').removeAttr('disabled');
            }, 1000)

          }
        })
    } else {
      $('span#msg_update_player').html('veuillez saisir le nom et le prenom dabord !')
      $('span#msg_update_player').removeClass('text-success text-danger').addClass('text-warning')
    }
  })
  $('button#update_player').on('click', function(){
    let doUpdate = false
    if(validatePlayerData($('input#edit_lname'), $('input#edit_fname'), $('input#edit_phone1'), $('input#edit_phone2'), $('input#edit_phone3') , $('input#edit_anuual_price'), $('input#edit_birthday'), $('span#msg_update_player'))){
      if (grpId != $('select#edit_group').val() && parseInt($('span#nbr_joueurs').html()) >= 20) {
          let msg = 'Le nombre des joueurs dans ce groupe va dépasser 20 !';
          if (parseInt($('span#nbr_joueurs').html()) > 20) {
            msg = 'Le nombre des joueurs dans ce groupe a dépasser 20 !';
          }
          var ConfirmationDialog = require('electron').remote.dialog
          ConfirmationDialog.showMessageBox({
            type: 'warning',
            buttons: ['Continuer', 'Annuler'],
            title: 'Information !',
            message: msg,
            noLink: true,
            cancelId:-1
          }, response =>{
              if (response) {
                return;
              }else{
                joueurs.findOne({
                  where: {id: _idPlayer}
                }).then(playerToUpdate => {
                  playerToUpdate.update({
                    Nom: $('input#edit_lname').val(),
                    Prenom: $('input#edit_fname').val(),
                    Tele1: $('input#edit_phone1').val(),
                    Tele2: $('input#edit_phone2').val(),
                    Tele3: $('input#edit_phone3').val(),
                    DateNaissance: $('input#edit_birthday').val(),
                    Adresse:  $('textarea#edit_adress').val(),
                    // Prix: $('input#edit_price').val(),
                    PrixAnnuel: $('input#edit_anuual_price').val(),
                    photo: avatarPath,
                    certificat: certPath,
                    groupeId: $('select#edit_group').val()
                  }).then(()=>{
                      isSaved = false;
                      grpId = $('select#edit_group').val()
                      getNumberOfPlayers($('select#edit_group'), $('span#nbr_joueurs'))
                      $('button#update_player').prop('disabled', true);
                  })
                })
              }
          })
      }else{
        joueurs.findOne({
          where: {id: _idPlayer}
        }).then(playerToUpdate => {
          playerToUpdate.update({
            Nom: $('input#edit_lname').val(),
            Prenom: $('input#edit_fname').val(),
            Tele1: $('input#edit_phone1').val(),
            Tele2: $('input#edit_phone2').val(),
            Tele3: $('input#edit_phone3').val(),
            DateNaissance: $('input#edit_birthday').val(),
            Adresse:  $('textarea#edit_adress').val(),
            // Prix: $('input#edit_price').val(),
            PrixAnnuel: $('input#edit_anuual_price').val(),
            photo: avatarPath,
            certificat: certPath,
            groupeId: $('select#edit_group').val()
          }).then(()=>{
              isSaved = false;
              grpId = $('select#edit_group').val()
              getNumberOfPlayers($('select#edit_group'), $('span#nbr_joueurs'))
              $('button#update_player').prop('disabled', true);
          })
        })
      }

    }
  })
}
/**
 * cusiomize shearch for players table
 * @return void
*/
function shearchPlayer(){
  $('#sch_id').on( 'keyup', function () {
    if (this.value == "") {
      table.search( '' ).columns().search( '' ).draw();
      return;
    }
    table.columns(1).search("^"+this.value+"$", true, false).draw();
  });
  $('#sch_lname').on( 'keyup', function () {
    table.columns(2).search( this.value ).draw();
  });
  $('#sch_fname').on( 'keyup', function () {
    table.columns(3).search( this.value ).draw();
  });

  $('#sch_cat, #sch_grp').on( 'change', function () {
    if ($('#sch_cat').val() == 0 && $('#sch_grp').val() != 0) {
      table.columns(7).search('/'+$('#sch_grp option:selected').text()).draw();
      return;
    }
    if ($('#sch_cat').val() != 0 && $('#sch_grp').val() == 0) {
      table.columns(7).search($('#sch_cat option:selected').text()+'/').draw();
      return;
    }
    if (this.value == 0) {
      table.search( '' ).columns().search( '' ).draw();
      return;
    }
    table.columns(7).search($('#sch_cat option:selected').text()+'/'+$('#sch_grp option:selected').text()).draw();
  });

  $('#sch_day').on( 'change', function () {
    if (this.value == 0) {
      table.search( '' ).columns().search( '' ).draw();
      return;
    }
    table.columns(6).search($('#sch_day option:selected').text()).draw();
  });

}

/**
 * init export Abcesnce list
 * @return void
*/
function initExportllistAbsceance(){
  jours.findAll({
      include: [{model: categories, include: groupes, require: true}],
  }).then(res => {
      pJours = res[0]
    if (pJours) {
      $.each(res, function(index, jours){
        $('select#abs_day').append(new Option(jours.Jour1+"-"+jours.Jour2, jours.id));
      })
      //itirate times for the first days
      pCat = pJours.categories[0]
      $.each(pJours.categories, function(index, cat){
        $('select#abs_cat').append(new Option(cat.NomCategorie, cat.id));
      })
      $('select#abs_cat').change()
    }
  });
  $('select#abs_day').on('change', function() {
    jours.findOne({
      where: {id: $(this).val()},
        include: [{model: categories}]
    }).then(jours => {
        $('select#abs_cat option').remove();
        $.each(jours.categories, function(index, cat){
          $('select#abs_cat').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#abs_cat').change()

    });
  });
  $('select#abs_cat').on('change', function() {
    if ($('select#abs_cat').val()) {
      categories.findOne({
        where: {id: $(this).val()},
        include: {model: groupes, where: {jourId:  $('select#abs_day').val() }}
      }).then(cats => {
        $('select#abs_grp option').remove();
        if (cats) {
          $.each(cats.groupes, function(index, grp){
              $('select#abs_grp').append(new Option(grp.NomGroupe, grp.id))
          })
        }
      })
    }

  });

}
$(document).ready(function(){
  $('button#updatePlayer').hide();
  initAddPlayer();
  addPlayer();
  deleteAddedPlayer();
  editAddedPlayer();
  updateAddedPlayer();
  // fillTablePlayer();
  deletePlayer();
  // if show player window
  if (_idPlayer) {
    showPlayer();
    updatePlayer();
  }
  cancelAddPlayer();
  $.when(fillTablePlayer()).done(function () {
    shearchPlayer()
  })
  initExportllistAbsceance()
})
