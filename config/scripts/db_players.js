const Sequelize = require('sequelize');
var tables = require('../config/scripts/db.js');
var fs = require('fs');

var joueurs  = tables.joueurs;
var categories  = tables.categorie;
var groupes  = tables.groupes;
var defaultAvatar = 'C:\\Users\\Ahmed\\Desktop\\Desktop_stuffs\\workspace\\terrains\\Gestion_Ecole\\electron-quick-start\\assets\\image\\avatars\\default.png';
var defaultCert = 'C:\\Users\\Ahmed\\Desktop\\Desktop_stuffs\\workspace\\terrains\\Gestion_Ecole\\electron-quick-start\\assets\\image\\certificats\\defaultFile.png';
var avatarPath = defaultAvatar;
var certPath = defaultCert;
var avatarFile, certFile;
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
  $('input#price').val('');
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
function validatePlayerData(lname, fname, phone1, phone2, phone3 , price, annualPrice, birthday, adresse, message){
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
  if (!price.val()) {
    message.html('le prix est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  let validePrice= /^[0-9]{2,3}$/
  if (!validePrice.test(price.val())) {
    message.html('le prix n\'est pas valide !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
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
  if (!adresse.val()) {
    message.html('l\'adresse est obliatoire !')
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
 * init the add player Window
 * @return void
*/
function initAddPlayer(){
  categories.findAll({
    include:[{model: groupes}]
  }).then(cats=>{
    let fCat = cats[0];
    $.each(cats, (index, cat)=>{
      $('select#categorie').append(new Option(cat.NomCategorie, cat.id))
    })
    $.each(fCat.groupes, (index, groupe)=>{
      $('select#groupe').append(new Option(groupe.NomGroupe, groupe.id))
    })
  })

  $('select#categorie').on('change', ()=>{
    console.log('fds');
    categories.findOne({
      where:{id: $('select#categorie').val()},
      include:[{model: groupes}]
    }).then(cat=>{
        $('select#groupe option').remove();
      $.each(cat.groupes, (index, groupe)=>{
        $('select#groupe').append(new Option(groupe.NomGroupe, groupe.id))
      })
    })
  })
}
/**
 * upload image
 * @param file @trpe object
 * @param name @type String
 * @param type @type String
 * @return void
*/
function uploeadImage(file, name, type){
  var path = require('path');
  fs.readFile(file[0], (err, data)=>{
    if (!err) {
      let ext = file[0].split('.')[1]
      newPath = path.join(__dirname+ '/../assets/image/'+type+'/'+name+'_'+(new Date).getTime()+'.'+ext);
      fs.writeFile(newPath, data, function (err) {
        if (err) {
          $('span#msg_add_player').html('une erreur dans le chargement de l\'image !');
          $('span#msg_add_player').removeClass('text-success text-danger').addClass('text-warning');
          return;
        }
      });
      if (type == 'avatars') {
        avatarPath = newPath;
      }else if (type == 'certificats') certPath = newPath;
    }else{$('span#msg_add_player').html('une erreur dans le chargement de l\'image !');
    $('span#msg_add_player').removeClass('text-success text-danger').addClass('text-warning')};
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
            uploeadImage(file, $('input#fname').val()+$('input#lname').val() ,'avatars');
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
            uploeadImage(file, $('input#fname').val()+$('input#lname').val() ,'certificats');
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
      if(validatePlayerData($('input#lname'), $('input#fname'), $('input#phone1'), $('input#phone2'), $('input#phone3') , $('input#price'), $('input#annual_price'), $('input#birthday'), $('textarea#adress'), $('span#msg_add_player'))){
        var joueurIns =  joueurs.build({
          Nom: $('input#lname').val(),
          Prenom: $('input#fname').val(),
          Tele1: $('input#phone1').val(),
          Tele2: $('input#phone2').val(),
          Tele3: $('input#phone3').val(),
          DateNaissance: $('input#birthday').val(),
          Adresse:  $('textarea#adress').val(),
          Prix: $('input#price').val(),
          PrixAnnuel: $('input#annual_price').val(),
          photo: avatarPath,
          certificat: certPath
        })
        joueurIns.save().then(player=>{
          player.setGroupe($('select#groupe').val()).then((playerGroup)=>{
            playerGroup.getGroupe().then(grp=>{
              grp.getCategorie().then(cat=>{
                $('table#table_new_palyer tbody').append('<tr><td class="text-center">'+
                  '<input type="radio" name="joueur" value="'+player.id+'" class="table-radio align-middle"></td>'+
                  '<td>'+player.Nom+'</td>'+
                  '<td>'+player.Prenom+'</td>'+
                  '<td>'+getLocalDate(player.DateNaissance)+'</td>'+
                  '<td>'+player.Tele1+'</td>'+
                  '<td>'+player.Tele2+'</td>'+
                  '<td>'+player.Tele3+'</td>'+
                  '<td>'+player.Adresse+'</td>'+
                  '<td>'+player.Prix+' DH</td>'+
                  '<td>'+cat.NomCategorie+'</td>'+
                  '<td>'+grp.NomGroupe+'</td></tr>');
                  clearInputs();
              })
            })
          })
        })
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
            $("button#ajouterJoueur").prop("disabled", true);
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
      $('input#price').val(player.Prix);
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
 * update added player
 * @return void
*/
function updateAddedPlayer(){
  $('button#updatePlayer').on('click', function(){
    if(validatePlayerData($('input#lname'), $('input#fname'), $('input#phone1'), $('input#phone2'), $('input#phone3') , $('input#price'), $('input#annual_price'), $('input#birthday'), $('textarea#adress'), $('span#msg_add_player'))){
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
          Prix: $('input#price').val(),
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
  let playerData = [];
  joueurs.findAll({
    include: [{model: groupes, include: [{model: categories}]}]
  }).then(players=>{
    $.each(players, (index, player)=>{
      playerData.push(['<input type="radio" name="player" value="'+player.id+'" class="table-radio align-middle">', player.Nom, player.Prenom, player.Tele1, player.DateNaissance, player.groupe.categorie.NomCategorie+'/'+player.groupe.NomGroupe])
    })
    $('#table_player').DataTable({
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
    include:[{model: groupes, include: [{model: categories}]}]
  }).then(player=>{
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
      $('select#edit_categorie').val(player.groupe.categorie.id).change()
      setTimeout(()=>{$('select#edit_group').val(player.groupe.id);}, 300)
      $('button#update_player').prop('disabled', true);
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
  $('select#edit_categorie').on('change', ()=>{
    categories.findOne({
      where:{id: $('select#edit_categorie').val()},
      include:[{model: groupes}]
    }).then(cat=>{
      if (cat) {
        $('select#edit_group option').remove();
        $.each(cat.groupes, (index, groupe)=>{
          $('select#edit_group').append(new Option(groupe.NomGroupe, groupe.id))
        })
      }
    })
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
            uploeadImage(file, $('input#edit_fname').val()+$('input#edit_lname').val() ,'avatars');
            setTimeout(()=>{
              console.log('upload complete');
              $('img#avatar').attr('src',avatarPath)
              isSaved = false;
              $('button#update_player').removeAttr('disabled');
            }, 1000)

          }
        })
    } else {
      $('span#msg_add_player').html('veuillez saisir le nom et le prenom dabord !')
      $('span#msg_add_player').removeClass('text-success text-danger').addClass('text-warning')
    }
  })
  $('button#edit_cert').on('click', function(){
    if ($('input#edit_fname').val() != '' && $('input#edit_lname').val() != '') {
      var SaveDialog = require('electron').remote.dialog
      SaveDialog.showOpenDialog((file)=>{
          if (file !== undefined) {
            uploeadImage(file, $('input#edit_fname').val()+$('input#edit_lname').val() ,'certificats');
            setTimeout(()=>{
              console.log('upload complete');
              $('img#cert').attr('src',certPath)
              isSaved = false;
              $('button#update_player').removeAttr('disabled');
            }, 1000)

          }
        })
    } else {
      $('span#msg_add_player').html('veuillez saisir le nom et le prenom dabord !')
      $('span#msg_add_player').removeClass('text-success text-danger').addClass('text-warning')
    }
  })
  $('button#update_player').on('click', function(){
    if(validatePlayerData($('input#edit_lname'), $('input#edit_fname'), $('input#edit_phone1'), $('input#edit_phone2'), $('input#edit_phone3') , $('input#edit_price'), $('input#edit_anuual_price'), $('input#edit_birthday'), $('textarea#edit_adress'), $('span#msg_update_player'))){
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
          Prix: $('input#edit_price').val(),
          PrixAnnuel: $('input#edit_anuual_price').val(),
          photo: avatarPath,
          certificat: certPath,
          groupeId: $('select#edit_group').val()
        }).then(()=>{
            isSaved = false;
            $('button#update_player').prop('disabled', true);
        })
      })
    }
  })
}
$(document).ready(function(){
  $('button#updatePlayer').hide();
  initAddPlayer();
  addPlayer();
  deleteAddedPlayer();
  editAddedPlayer();
  updateAddedPlayer();
  fillTablePlayer();
  deletePlayer();
  // if show player window
  if (_idPlayer) {
    showPlayer();
    updatePlayer();
  }
  cancelAddPlayer();
})
