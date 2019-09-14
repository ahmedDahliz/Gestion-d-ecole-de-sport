//ORM for groups Model
const Sequelize = require('sequelize');
var tables = require('../config/scripts/db.js');
var modalShowCat = document.getElementById("myModalShowCat");
var jours  = tables.jours;
var categorie  = tables.categorie;
var groupes  = tables.groupes;

var horaire = tables.horaire;

var groupTable;

/**
 * Hide an element
 * @param selector @type tag element
 * @return void
*/
function hideElement(selector){
  setTimeout(()=>{selector.html('')}, 3000);
}

/**
  * init add groupe form and index form
  @return void
*/
function initAddForm(){
    // Fill the tabke of groupes
    var groupData = []
    jours.findAll({
      include: [{
        model: horaire,
        require: true,
        include: [{model: categorie, include: groupes}]
      }]
    }).then(res => {
      $.each(res, function(index, jour){
          groupData.push(["<input value='"+jour.id+"' type='hidden' name='idJours'> "+ jour.Jour1+'-'+jour.Jour2,
          '<button type="button" name="showCat" class="btn btn-show">Afficher les categories</button>'/*, values.categorie.Groupes.map(function(item) { return item["NomGroupe"]; })*/]);
      })
    $('#group_list').DataTable({
      data: groupData,
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
  //categorie dropdown list handling
  $('select#cat').change(function(){
    if (this.value != 'null') $('input#nomCategorie').prop('disabled', true);
    else $('input#nomCategorie').removeAttr('disabled');

  })
  // fill drop down listes
  jours.findAndCountAll().then(result => {
    if (result.count === 0) {
      // category block
      $('select#jours_cat').prop('disabled', true)
      $('select#jours_cat').prop('title', "il n y'a pas de jours disponible !")
      $('button#addCategory').prop('disabled', true)
      $('button#addCategory').prop('title', "il n y'a pas de jours disponible !")

    }else {
      $.each(result.rows, function(indx, row){
        $('select#jours_horaire').append(new Option(row.Jour1+"-"+row.Jour2, row.id));
        $('select#jours_cat').append(new Option(row.Jour1+"-"+row.Jour2, row.id));
      })
    }
  })
  categorie.findAndCountAll().then(result => {
    if (result.count === 0) {
      //group block
      $('select#cat_group').prop('disabled', true)
      $('select#cat').prop('disabled', true)
      $('button#addGroup').prop('disabled', true)
      $('select#cat_group').prop('title', "il n y'a pas de catégorie disponible !")
      $('button#addGroup').prop('title', "il n y'a pas de catégorie disponible !")
    }else {
      $.each(result.rows, function(indx, row){
        $('select#cat_group').append(new Option(row.NomCategorie, row.id));
        $('select#cat').append(new Option(row.NomCategorie, row.id));
      })
    }
  })
}
/**
  @return void
*/
function addDays(){
  $('button#addJours').on('click', function(){
    if ($('select#Jour1').val() != $('select#Jour2').val()) {
      var jourInstance = jours.build({
        Jour1: $('select#Jour1').val(),
        Jour2: $('select#Jour2').val()
      })
      jourInstance.save().then(j=>{
        $('select#jours_horaire').append(new Option(j.Jour1+"-"+j.Jour2, j.id));
        $('select#jours_cat').append(new Option(j.Jour1+"-"+j.Jour2, j.id));
        // category block
        $('select#jours_cat').removeAttr('disabled')
        $('select#jours_cat').removeAttr('title')
        $('button#addCategory').removeAttr('disabled')
        $('button#addCategory').removeAttr('title')
        $('span#DayMessage').html('Jours ajouter avec succès');
        $('span#DayMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
      }).catch(error => {
        $('span#DayMessage').html(error.message);
        $('span#DayMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
      });
    } else {
      $('span#DayMessage').html('les jours ne doivent pas être identique !');
      $('span#DayMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
    }
    hideElement($('span#DayMessage'));
  });

}
/**
  @return void
*/
function addCategory(){
  $('button#addCategory').on('click', function(){
    if ($('input#nomCategorie').val() == "" && $('select#cat').val() == 'null') {
      $('span#categoryMessage').html("Vous devez choisir une categorie !")
      $('span#categoryMessage').removeClass( "text-danger text-success" ).addClass('text-warning');
      return;
    }
    if ($('input#heure').val() == "") {
      $('span#categoryMessage').html("Vous devez determiner l'heure !")
      $('span#categoryMessage').removeClass( "text-danger text-success" ).addClass('text-warning');
      return;
    }
    if($('select#cat').val() != 'null'){
      horaire.create({
        horaire: $('input#heure').val(),
        jourId: $('select#jours_cat').val(),
        categorieId: $('select#cat').val()
      }).then(()=>{
        $('span#categoryMessage').html('Categorie ajouter avec succès');
        $('span#categoryMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
      }).catch(error => {
        $('span#categoryMessage').html(error.message);
        $('span#categoryMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
      })
      return;
    }
    var catInstence = categorie.build({
      NomCategorie: $('input#nomCategorie').val(),
      jourId: $('select#jours_cat').val()
    });
    catInstence.save().then(cat=>{
      horaire.create({
        horaire: $('input#heure').val(),
        jourId: $('select#jours_cat').val(),
        categorieId: cat.id
      })
      $('select#cat_group').append(new Option(cat.NomCategorie, cat.id));
      $('select#cat').append(new Option(cat.NomCategorie, cat.id));
      $('select#cat').removeAttr('disabled')
      $('select#cat_group').removeAttr('disabled')
      $('select#cat_group').removeAttr('title')
      $('button#addGroup').removeAttr('disabled')
      $('button#addGroup').removeAttr('title')
      $('span#categoryMessage').html('Categorie ajouter avec succès');
      $('span#categoryMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
    }).catch(error => {
      $('span#categoryMessage').html(error.message);
      $('span#categoryMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
    });
    hideElement($('span#categoryMessage'));
  })
}

function addGroups(){
    $('button#addGroup').on('click', function(){
        if ($('input#nomGroupe').val()) {
          // check if group exist in a category
          groupes.findOne({
            where:{
              NomGroupe: $('input#nomGroupe').val().toUpperCase(),
              categorieId: $('select#cat_group').val()}
          }).then(grp=>{
            if (!grp) {
              var groupInstance = groupes.build({
                NomGroupe: $('input#nomGroupe').val().toUpperCase(),
                categorieId: $('select#cat_group').val()
              });
              groupInstance.save().then(()=>{
                $('span#GroupMessage').html('Group ajouter avec succès');
                $('span#GroupMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
              }).catch(error => {
                $('span#GroupMessage').html(error.message);
                $('span#GroupMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
              });
            }else {
              $('span#GroupMessage').html('ce groupe déja existe dans la categorie '+ $('select#cat_group option:selected').text());
              $('span#GroupMessage').removeClass( "text-success text-danger" ).addClass('text-warning');
            }
          })
        }else {
          $('span#GroupMessage').html('Le nom du groupe est obligatoire !');
          $('span#GroupMessage').removeClass( "text-success text-danger" ).addClass('text-warning');
        }
          hideElement($('span#GroupMessage'));
    });
}
/**
 *handling event chenge of edit block
 *@return void
*/
function editData(){
  // days select changed
  $('select#Edit_Jours').on('change', function() {
    jours.findOne({
      where: {id: $('select#Edit_Jours').val()},
      include: [{
        model: horaire,
        require: true,
        include: [{model: categorie, include: groupes}]
      }]
    }).then(res => {
        Pjours = res
        //itirate times for the first days
        $('select#Edit_Cat option').remove();
        $.each(Pjours.horaires, function(index, horaire){
          // $('input#Edit_Heur').val(horaire.horaire);
          $('select#Edit_Cat').append(new Option(horaire.categorie.NomCategorie, horaire.categorie.id));
        })
        $('button#deleteCatFromDay').prop('disabled', true);
    });
  });
  // categories select changed
  $('select#Edit_Cat').on('change', function() {
    if ($('select#Edit_Cat').val()) {
      $('button#deleteCatFromDay').removeAttr('disabled');
      $('button#deleteCat').removeAttr('disabled');
    }
    horaire.findOne({
      where: {jourId: $('select#Edit_Jours').val(), categorieId: $(this).val()}
    }).then(res =>{
      $('input#Edit_Heure').val(res.horaire);
      console.log($('input#Edit_Heure').val());
      console.log(res);
    })
  });
  // Main categorie select changed
  $('select#Edit_categorie').on('change', function() {
      categorie.findOne({
        where: {id: $('select#Edit_categorie').val()},
        include: [{
          model: groupes,
          require: true,
        }]
      }).then(categorie => {
          //itirate times for the first days
          $('select#Edit_group option').remove();
          $.each(categorie.groupes, function(index, groupe){
            // $('input#Edit_Heur').val(horaire.horaire);
            $('select#Edit_group').append(new Option(groupe.NomGroupe, groupe.id));
          })
      });
    });
  //group select
  $('select#Edit_group').on('change', function() {
    if ($('select#Edit_group').val()) {
      $('button#deleteGroup').removeAttr('disabled');
    }
  });
  //button manage click
  $("button#ModiferGroupe").on('click', function(){
     $('select#Edit_Cat option').remove();
     $('select#Edit_Jours option').remove();
     $('select#Edit_categorie option').remove();
     $('select#Edit_group option').remove();
    jours.findAll({
      // where: {id: $(this).closest('tr').find('td').find('input[name=idJours]').val()},
      include: [{
        model: horaire,
        require: true,
        include: [{model: categorie, include: groupes}]
      }]
    }).then(res => {
        //itirate days
        pJours = res[0]
        $.each(res, function(index, jours){
          $('select#Edit_Jours').append(new Option(jours.Jour1+"-"+jours.Jour2, jours.id));
        })
        //itirate times for the first days
        $.each(pJours.horaires, function(index, horaire){
          // $('input#Edit_Heur').val(horaire.horaire);
          $('select#Edit_Cat').append(new Option(horaire.categorie.NomCategorie, horaire.categorie.id));
        })

    });
    categorie.findAll({
      include: [{model: groupes, require: true}]
    }).then(categories=>{
      console.log(categories);
      pCategorie = categories[0]
      $.each(categories, function(index, categorie){
        $('select#Edit_categorie').append(new Option(categorie.NomCategorie, categorie.id))
      })
      $.each(pCategorie.groupes, function(index, groupe){
        $('select#Edit_group').append(new Option(groupe.NomGroupe, groupe.id))
      })

    })
    if ($('.edit-groupe').is(":hidden")) $('.edit-groupe').show();
    else $('.edit-groupe').hide()


    $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
  });
  // button submit edit category
  $("button#submit_edit_category").on('click', function(){
    if ($('input#new_categorie_name').val() != "") {
      categorie.findOne({
        where: {id:$('input#idCat').val()}
      }).then(catToUpdate => {
        catToUpdate.update({
          NomCategorie: $('input#new_categorie_name').val()
        }).then(()=>{
           ipc.send('refresh-group')
         });
       });
    }else $('span#msg_edit_cat').html("le nouveau nom ne doit pas être vide !");

  });
  // button edit Day
  $("button#submit_edit_day").on('click', function(){
    if ($('select#new_day1').val() != $('select#new_day2').val()) {
      jours.findOne({
        where: {id:$('input#idDays').val()}
      }).then(daysToUpdate => {
        daysToUpdate.update({
          Jour1: $('select#new_day1').val(),
          Jour2: $('select#new_day2').val()
        }).then(()=>{
           ipc.send('refresh-group')
         });
       });
     }else $('span#msg_edit_day').html('les jours ne doivent pas être identique !');
  });
}
function fillDataTableGroupe(){
  var groupData = []

  //.then(()=>{
  //   jours.findAll().then(groups => {
  //   })
  //   categorie.findAll().then(groups => {
  //   })
  //   groupes.findAll().then(groups => {
  //   })
  // })
  // groupes.findAll().then(groups => {
  //   $.each(groups, function(index, value){
  //     groupData.push(["","<input value='"+value.id+"' type='hidden' name='idGroup'>"+ value.NomGroupe, value.Jour1, value.Heure1, value.Jour2, value.Heure2]);
  //   })
    // groupTable = $('#group_list').DataTable({
    //   data: groupData,
    //   columnDefs: [
    //     {
    //       orderable: false,
    //       className: "text-center",
    //       targets: [ 0 ],
    //       render: function (data, type, full, meta){
    //            return '<input class="table-radio" type="radio" name="group">';
    //        }
    //     }
    //   ],
    //   pageLength : 7,
    //   lengthMenu: [[7, 10, 30, 50, -1], [7, 10, 30, 50, 'Tous']],
    //   language: {
    //     processing:     "Traitement en cours...",
    //     search:         "Rechercher&nbsp;:",
    //     lengthMenu:    "Afficher _MENU_ &eacute;l&eacute;ments",
    //     info:           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
    //     infoEmpty:      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
    //     infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
    //     infoPostFix:    "",
    //     loadingRecords: "Chargement en cours...",
    //     zeroRecords:    "Aucun &eacute;l&eacute;ment &agrave; afficher",
    //     emptyTable:     "Aucune donnée disponible dans le tableau",
    //     paginate: {
    //         first:      "Premier",
    //         previous:   "Pr&eacute;c&eacute;dent",
    //         next:       "Suivant",
    //         last:       "Dernier"
    //     },
    //     aria: {
    //         sortAscending:  ": activer pour trier la colonne par ordre croissant",
    //         sortDescending: ": activer pour trier la colonne par ordre décroissant"
    //     }
    //   }
    // } );

  // });
}
function deletesDaysCategorie(){
  var ConfirmationDialog = require('electron').remote.dialog
  var image = require('electron').remote.nativeImage
  let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')
  $('button#deleteCatFromDay').on('click', function(){
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer cette categorie de ces jours ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          // let trToDelete = $('#group_list tbody').find('td').find('input:radio[name="group"]:checked').closest('tr');
          horaire.destroy({
            where: {
              jourId: $('select#Edit_Jours').val(),
              categorieId: $('select#Edit_Cat').val()
            }
          }).then(()=>{
            ipc.send('refresh-group');
          });
        }

    })

  })
  $('button#deleteDay').on('click', function(){
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer ces jours ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          jours.destroy({
            where: {
              id: $('select#Edit_Jours').val()
            }
          }).then(()=>{
            ipc.send('refresh-group');
          });
        }

    })

  })
}
function deletesCategoriegroups(){
  var ConfirmationDialog = require('electron').remote.dialog
  var image = require('electron').remote.nativeImage
  let iconQuestion = image.createFromPath('assets/image/icons/iconQuestion.png')
  $('button#deleteCat').on('click', function(){
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer cette categorie d\'une maniére final ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          categorie.destroy({
            where: {
              id: $('select#Edit_categorie').val()
            }
          }).then(()=>{
            ipc.send('refresh-group');
          });
        }

    })

  })
  $('button#deleteGroup').on('click', function(){
    ConfirmationDialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Non'],
      title: 'Confirmation de suppression !',
      message: 'Vous voulez vraiment supprimer ce groupe de cette categorie ?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          groupes.destroy({
            where: {
              id: $('select#Edit_group').val()
            }
          }).then(()=>{
            ipc.send('refresh-group');
          });
        }

    })

  })

}
function updateTime(){
  $('button#EditTime').on('click', function(){
    // let trToUpdate = $('#group_list tbody').find('td').find('input:radio[name="group"]:checked').closest('tr');
    if (!$('select#Edit_Cat').val()) {
      $('span#msgTime').html("Vous devez choisir une categorie !")
      return;
    }
    if ($('input#Edit_Heure').val() != "") {
      horaire.findOne({
        where: {jourId:$('select#Edit_Jours').val(), categorieId:$('select#Edit_Cat').val()}
      }).then(timeToUpdate => {
        timeToUpdate.update({
          horaire: $('input#Edit_Heure').val()
        }).then(()=>{
           $('#group_list').find("tr:gt(0)").remove();
           ipc.send('refresh-group')
           $('.edit-groupe').hide()
         });
       });
    }else $('span#msgTime').html("l'horaire ne doit pas être vide !")
  })
}
/**
 * show categorie and time in modal
 * @return void
*/
function showCategorie(){
  $('table#group_list').on('click', 'button[name=showCat]', function(){

    jours.findOne({
      where: {id: $(this).closest('tr').find('input[name=idJours]').val()},
      include: [{
        model: horaire,
        require: true,
        include: [{model: categorie, include: groupes}]
      }]
    }).then(jour => {
      $('table#table_show_cat tbody tr').remove()
        $('h4#titleDayes').html(jour.Jour1+'-'+jour.Jour2)
        $.each(jour.horaires, function(index, horaire){
          $('table#table_show_cat tbody').append('<tr>'+
          '<td>'+horaire.categorie.NomCategorie+'</td>'+
          '<td>'+horaire.horaire+'</td>'+
          '</tr>')
        })
  })
  modalShowCat.style.display = "block";
})
}
$(document).ready( function () {
  initAddForm();
  addDays();
  addCategory();
  addGroups();
  editData();
  updateTime();
  deletesDaysCategorie();
  deletesCategoriegroups();
  showCategorie()
});
