//ORM for entrenures Model
const Sequelize = require('sequelize');
var tables = require('../config/scripts/db.js');

var entreneur  = tables.entreneur;
var groupes = tables.groupes;
var categories = tables.categorie;

/**
 * Hide an element
 * @param selector @type tag element
 * @return void
*/
function hideElement(selector){
  setTimeout(()=>{selector.html('')}, 3000);
}

/**
 *init the add coach form
 *@return void
*/
function initAddForm(){
  categories.findAll({
    include: [{model: groupes, require: true}]
  }).then(cats=>{
    if(cats){
      let Fcat = cats[0];
      $.each(cats, (index, cat)=>{
        $('select#catE').append(new Option(cat.NomCategorie, cat.id))
      });
      $.each(Fcat.groupes, (index, groupe)=>{
        $('select#groupeE').append(new Option(groupe.NomGroupe, groupe.id))
      });
    }
  })
  $('select#catE').on('change', ()=>{
    categories.findOne({
      where: {id: $('select#catE').val()},
      include: {model: groupes}
    }).then(cat =>{
      $('select#groupeE option').remove();
      $.each(cat.groupes, (index, groupe)=>{
        $('select#groupeE').append(new Option(groupe.NomGroupe, groupe.id));
      });
    })
  })
}
/**
 * Validation of inputs coach form
 * @Param fname @type input tag
 * @Param lname @type input tag
 * @Param phone @type input tag
 * @Param message @type span tag
 * @return boolean
*/
function validateCoachData(fname, lname, phone, message){
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
  if (!phone.val()) {
    message.html('le N° de télephone est obliatoire !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  let validePhone = /(\+212|0)([ \-_/]*)(\d[ \-_/]*){9}/
  if (!validePhone.test(phone.val())) {
    message.html('le N° de télephone n\'est pas valide !')
    message.removeClass('text-success text-danger').addClass('text-warning')
    hideElement(message);
    return false;
  }
  return true;
}
/**
 *add coach
 *@return void
*/
function addCoach(){
  $('button#ajouterEntre').on('click', function (){
      if (validateCoachData($('input#prenomE'), $('input#nomE'), $('input#teleE'), $('span#msg_add_coach'))) {
        // if ($('select#groupeE').val().length == 0) {
        //   $('span#msg_add_coach').html('Vous devez choisir où moins un groupe !')
        //   $('span#msg_add_coach').html('Vous devez choisir où moins un groupe !')
        //   $('span#msg_add_coach').removeClass('text-success text-danger').addClass('text-warning')
        //   return;
        // }
        var insEnt = entreneur.build({
          NomE:$('input#nomE').val(),
          PrenomE:$('input#prenomE').val(),
          TelephoneE:$('input#teleE').val(),
        })
        insEnt.save().then(entreneur=>{
            $('span#msg_add_coach').html('l\'entreneur est ajouter avec succès !')
            $('span#msg_add_coach').removeClass('text-warning text-danger').addClass('text-success')
            $('table#newCoach tbody').append('<tr><td class="text-center">'+
                '<button name="editCoach" class="btn btn-edit align-middle editCoach"><i class="fas fa-edit"></i></button> '+
                '<button name="deleteCoach" class="btn btn-delete align-middle deleteCoach"><i class="fas fa-times"></i></button>'+
                '<input id="idCoach" type="hidden" value="'+entreneur.id+'">'+
                '<input id="idGroupes" type="hidden" value="'+$('select#groupeE').val()+'">'+
              '</td>'+
              '<td>'+entreneur.NomE+'</td>'+
              '<td>'+entreneur.PrenomE+'</td>'+
              '<td>'+entreneur.TelephoneE+'</td></tr>')
              // '<td>'+$('select#groupeE option:selected').toArray().map(item => item.text).join()+'</td>'
              $('input#nomE').val('');
              $('input#prenomE').val('');
              $('input#teleE').val('');
              // $('select#groupeE').val([]);
              hideElement($('span#msg_add_coach'));
        }).catch(err=>{
          $('span#msg_add_coach').html(err.message)
          $('span#msg_add_coach').removeClass('text-warning text-success').addClass('text-danger')
        })
    }

  })
}
let idCoach
/**
 *edit new coach
 *@return void
*/
function editNewCoach(){
  $('table#newCoach').on('click', 'button.editCoach',function(event){
    // let idGrps = []
    idCoach = $(this).closest('tr').find('input#idCoach').val();
    $('input#nomE').val($(this).closest('tr').find('td').eq(1).text());
    $('input#prenomE').val($(this).closest('tr').find('td').eq(2).text());
    $('input#teleE').val($(this).closest('tr').find('td').eq(3).text());
    // $('select#groupeE').val($(this).closest('tr').find('input#idGroupes').val().split(',').map( Number ));
    $('button#ajouterEntre').hide();
    $('button#editAddedCoach').show();
    $(this).closest('tr').remove();

  })
}
/**
 *edit the added coach
 *@return void
*/
function updateAddedCoach(){
  $('button#editAddedCoach').on('click', function(){
  if (validateCoachData($('input#prenomE'), $('input#nomE'), $('input#teleE'), $('span#msg_add_coach'))) {
    entreneur.findByPk(idCoach).then(coachToUpdate=>{
      coachToUpdate.update({
        NomE:$('input#nomE').val(),
        PrenomE:$('input#prenomE').val(),
        TelephoneE:$('input#teleE').val(),
      }).then(updatedCoach=>{
        // updatedCoach.setGroupes($('select#groupeE').val()).then(updatedGroup=>{
        //
        //     // '<td>'+$('select#groupeE option:selected').toArray().map(item => item.text).join()+'</td>
        //     // $('select#groupeE').val([]);
        // })
        $('table#newCoach tbody').append('<tr><td class="text-center">'+
            '<button name="editCoach" class="btn btn-edit align-middle editCoach"><i class="fas fa-edit"></i></button> '+
            '<button name="deleteCoach" class="btn btn-delete align-middle deleteCoach"><i class="fas fa-times"></i></button>'+
            '<input id="idCoach" type="hidden" value="'+updatedCoach.id+'">'+
            '<input id="idGroupes" type="hidden" value="'+$('select#groupeE').val()+'">'+
          '</td>'+
          '<td>'+updatedCoach.NomE+'</td>'+
          '<td>'+updatedCoach.PrenomE+'</td>'+
          '<td>'+updatedCoach.TelephoneE+'</td></tr>');
          $('input#nomE').val('');
          $('input#prenomE').val('');
          $('input#teleE').val('');
      })
    });
    $('button#ajouterEntre').show();
    $('button#editAddedCoach').hide();
  }

  })
}
/**
 *delete added coach
 *@return void
*/
function deleteAddedCoach(){
  $('table#newCoach').on('click', 'button.deleteCoach',function(event){
    var ConfirmationDialog = require('electron').remote.dialog
    var image = require('electron').remote.nativeImage
    let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer ce entreneur ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          entreneur.destroy({
            where: {
              id: $(this).closest('tr').find('input#idCoach').val()
            }
          }).then(()=>{
            $(this).closest('tr').remove();
          });
        }
    })
  })
}
let coachData = []
/**
 *fill coach table
 *@return void
*/
function fillCoachTable(){
  entreneur.findAll({
    include:[{model: groupes}]
  }).then(coaches=>{
    $.each(coaches, function(index, coach){
      coachData.push(['<input type="radio" name="entreneur" value="'+coach.id+'" class="table-radio align-middle">', coach.NomE, coach.PrenomE, coach.TelephoneE/*,coach.groupes.map(function(item) { return item["NomGroupe"]; })*/])
    })
    $('#coach_table').DataTable({
      data: coachData,
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
    } );
  })
}
/**
 *delete coach
 *@return void
*/
function deleteCoache(){
  $('button#supprimerEntreneur').on('click', function(){
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer ce entreneur ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          entreneur.destroy({
            where: {
              id: $('input:radio[name="entreneur"]:checked').val()
            }
          }).then(()=>{
            ipc.send('refresh-group')
          });
        }
    })
  })
  var ConfirmationDialog = require('electron').remote.dialog
  var image = require('electron').remote.nativeImage
  let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')

}
/**
 *edit coache
 *@return void
*/
function editCoach(){
  $('button#modiferEntreneur').on('click', function(){
    entreneur.findOne({
      where:{id:$('input:radio[name="entreneur"]:checked').val()},
      include: [{model: groupes}]
    }).then(coach=>{
      $('input:hidden[name=editIdCoach]').val(coach.id);
      $('input#edit_lname').val(coach.NomE);
      $('input#edit_fname').val(coach.PrenomE);
      $('input#edit_phone').val(coach.TelephoneE);
      $('select#edit_group').val([coach.groupes.map(function(item) { return item["id"]; })]);
    })
  })
}
/**
 *update coache
 *@return void
*/
function updateCoach(){
  $('button#updateCoach').on('click', function(){
    if (validateCoachData($('input#edit_fname'), $('input#edit_lname'), $('input#edit_phone'), $('span#msg_update'))) {
      entreneur.findOne({
        where:{id:$('input:hidden[name=editIdCoach]').val()},
        include: [{model: groupes}]
      }).then(coachToUpdate=>{
        coachToUpdate.update({
          NomE:$('input#edit_lname').val(),
          PrenomE:$('input#edit_fname').val(),
          TelephoneE:$('input#edit_phone').val()
        }).then(()=>{
          ipc.send('refresh-group')
        })
      })
    }
  })
}
$(document).ready(function(){
  initAddForm();
  addCoach();
  editNewCoach();
  updateAddedCoach();
  deleteAddedCoach();
  fillCoachTable();
  deleteCoache();
  editCoach();
  updateCoach();
});
