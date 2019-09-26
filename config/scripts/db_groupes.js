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
  setTimeout(()=>{selector.html('')}, 3500);
}

/**
  * init add groupe form and index form
  @return void
*/
function initAddForm(){
    // Fill the tabke of groupes
    var groupData = []
    jours.findAll({
      include:  [{model: groupes, include: categorie}]
    }).then(res => {
      $.each(res, function(index, jour){
          groupData.push(["<input value='"+jour.id+"' type='hidden' name='idJours'> "+ jour.Jour1+'-'+jour.Jour2,
          '<button type="button" name="showCat" class="btn btn-show">Afficher les groupes</button>'/*, values.categorie.Groupes.map(function(item) { return item["NomGroupe"]; })*/]);
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
      if (this.value != 'null') $('input#nomCategorie').closest('td').fadeOut('long');
      else $('input#nomCategorie').closest('td').fadeIn('fast');
      $('input#nomCategorie').val('');
    })
    //jours dropdown list handling
    $('select#jours_group').change(function(){
      jours.findOne({
        where: {id: $('select#jours_group').val()},
        include: [{model: categorie}]
      }).then((days)=>{
        $('select#cat_group option').remove()
        $.each(days.categories, (index, cat)=>{
          $('select#cat_group').append(new Option(cat.NomCategorie, cat.id))
        })
      })
    })
    // fill drop down listes
    jours.findAndCountAll().then(result => {
      if (result.count === 0) {
        // category block
        $('select#jours_cat').prop('disabled', true)
        $('select#jours_cat').prop('title', "il n y'a pas de jours disponible !")
        $('select#jours_group').prop('disabled', true)
        $('select#jours_group').prop('title', "il n y'a pas de jours disponible !")
        $('button#addCategory').prop('disabled', true)
        $('button#addCategory').prop('title', "il n y'a pas de jours disponible !")
      }else {
        $.each(result.rows, function(indx, row){
          // $('select#jours_horaire').append(new Option(row.Jour1+"-"+row.Jour2, row.id));
          $('select#jours_cat').append(new Option(row.Jour1+"-"+row.Jour2, row.id));
          $('select#jours_group').append(new Option(row.Jour1+"-"+row.Jour2, row.id));
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
        $('select#jours_group').append(new Option(j.Jour1+"-"+j.Jour2, j.id));
        $('select#jours_cat').append(new Option(j.Jour1+"-"+j.Jour2, j.id));
        // category block
        $('select#jours_cat').removeAttr('disabled')
        $('select#jours_cat').removeAttr('title')
        $('select#jours_group').removeAttr('disabled')
        $('select#jours_group').removeAttr('title')
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
      hideElement($('span#categoryMessage'));
      return;
    }
    // if ($('input#heure').val() == "") {
    //   $('span#categoryMessage').html("Vous devez determiner l'heure !")
    //   $('span#categoryMessage').removeClass( "text-danger text-success" ).addClass('text-warning');
    //   hideElement($('span#categoryMessage'));
    //   return;
    // }
    if($('select#cat').val() != 'null'){
      categorie.findOne({
        where: {id: $('select#cat').val()}
      }).then(cat=>{
        cat.addJours([$('select#jours_cat').val()]).then(()=>{
          $('span#categoryMessage').html('Categorie ajouter avec succès');
          $('span#categoryMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
          hideElement($('span#categoryMessage'));
        })
      });
      return;
    }
    var catInstence = categorie.build({
      NomCategorie: $('input#nomCategorie').val(),
    });
    catInstence.save().then(cat=>{
      cat.setJours([$('select#jours_cat').val()]).then(ct=>{
        $('select#cat').append(new Option(cat.NomCategorie, cat.id));
        $('select#cat').removeAttr('disabled')
        $('select#cat_group').removeAttr('disabled')
        $('select#cat_group').removeAttr('title')
        $('button#addGroup').removeAttr('disabled')
        $('button#addGroup').removeAttr('title')
        $('span#categoryMessage').html('Categorie ajouter avec succès');
        $('span#categoryMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
      })
    }).catch(error => {
      // $('span#categoryMessage').html(error.message);
      $('span#categoryMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
    });
    hideElement($('span#categoryMessage'));
  })
}

function addGroups(){
    $('button#addGroup').on('click', function(){
        if (!$('input#heure1').val() || !$('input#heure2').val()) {
          $('span#GroupMessage').html('Les deux heurs sont obligatoire !');
          $('span#GroupMessage').removeClass( "text-success text-danger" ).addClass('text-warning');
            hideElement($('span#GroupMessage'));
          return;
        }
        if ($('input#nomGroupe').val()) {
          // check if group exist in a category
          groupes.findOne({
            where:{
              NomGroupe: $('input#nomGroupe').val().toUpperCase(),
              categorieId: $('select#cat_group').val(),
              jourId: $('select#jours_group').val()
            }
          }).then(grp=>{
            if (!grp) {
              var groupInstance = groupes.build({
                NomGroupe: $('input#nomGroupe').val().toUpperCase(),
                horaire1: $('input#heure1').val(),
                horaire2: $('input#heure2').val()
              });
              $('img#loaderGrp').show();
              groupInstance.save().then((grp)=>{
                grp.setJour( $('select#jours_group').val()).then(()=>{
                  grp.setCategorie($('select#cat_group').val()).then(()=>{
                    $('img#loaderGrp').hide();
                    $('span#GroupMessage').html('Groupe ajouter avec succès');
                    $('span#GroupMessage').removeClass( "text-warning text-danger" ).addClass('text-success');
                  })
                })
              }).catch(error => {
                $('span#GroupMessage').html(error.message);
                $('span#GroupMessage').removeClass( "text-warning text-success" ).addClass('text-danger');
              });
            }else {
              $('span#GroupMessage').html('ce groupe de la categorie '+ $('select#cat_group option:selected').text()+ 'déja exist dans les jours : '+$('select#jours_group option:selected').text());
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
      where: {id: $(this).val()},
        include: [{model: categorie}]
    }).then(jours => {
        $('span#nameDays').html(jours.Jour1+"-"+jours.Jour2)
        //itirate times for the first days
        $('select#Edit_Cat option').remove();
        $.each(jours.categories, function(index, cat){
          $('select#Edit_Cat').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#Edit_Cat').change()

    });
  });
  // categories select changed
  $('select#Edit_Cat').on('change', function() {
    if ($('select#Edit_Cat').val()) {
      categorie.findOne({
        where: {id: $(this).val()},
        include: {model: groupes, where: {jourId:  $('select#Edit_Jours').val() }}
      }).then(cats => {
        // $('input#Edit_Heure1').val(cat.horaire1);
        // $('input#Edit_Heure2').val(cat.horaire2);
        $('select#Edit_groupe option').remove();
        if (cats) {
          $.each(cats.groupes, function(index, grp){
              $('select#Edit_groupe').append(new Option(grp.NomGroupe, grp.id))
          })
          $('button#deleteGroup').prop('disabled', true)
        }

      })
    }
    categorie.findOne({
      where: {id: $(this).val()},
      include: {model: groupes, where: {jourId:  $('select#Edit_Jours').val() }}
    }).then(cats => {
      // $('input#Edit_Heure1').val(cat.horaire1);
      // $('input#Edit_Heure2').val(cat.horaire2);
      $('select#Edit_groupe option').remove();
      if (cats) {
        $.each(cats.groupes, function(index, grp){
            $('select#Edit_groupe').append(new Option(grp.NomGroupe, grp.id))
        })
      }

    })
  });
  // Main categorie select changed
  // $('select#Edit_categorie').on('change', function() {
  //     categorie.findOne({
  //       where: {id: $('select#Edit_categorie').val()},
  //       include: [{
  //         model: groupes,
  //         require: true,
  //       }]
  //     }).then(categorie => {
  //         //itirate times for the first days
  //         $('select#Edit_group option').remove();
  //         $.each(categorie.groupes, function(index, groupe){
  //           // $('input#Edit_Heur').val(horaire.horaire);
  //           $('select#Edit_group').append(new Option(groupe.NomGroupe, groupe.id));
  //         })
  //     });
  //   });
  //group select
  $('select#Edit_groupe').on('change', function() {
    if ($(this).val()) {
      groupes.findOne({
        where: {id: $(this).val()}
      }).then(grp => {
        $('input#Edit_Heure1').val(grp.horaire1);
        $('input#Edit_Heure2').val(grp.horaire2);
      })
      $('button#deleteGroup').removeAttr('disabled')
    }
  })
  //button manage click
  $("button#ModiferGroupe").on('click', function(){
     $('select#Edit_Cat option').remove();
     $('select#Edit_Jours option').remove();
     $('select#Edit_categorie option').remove();
     $('select#Edit_groupe option').remove();
    jours.findAll({
      // where: {id: $(this).closest('tr').find('td').find('input[name=idJours]').val()},
        include: [{model: categorie, include: groupes, require: true}],
        // order: [[{model: groupes}, 'id', 'DESC']]
    }).then(res => {
        //itirate days
        pJours = res[0]
        $('span#nameDays').html(pJours.Jour1+"-"+pJours.Jour2)
        $.each(res, function(index, jours){
          $('select#Edit_Jours').append(new Option(jours.Jour1+"-"+jours.Jour2, jours.id));
        })
        //itirate times for the first days
        pCat = pJours.categories[0]
        $.each(pJours.categories, function(index, cat){
          $('select#Edit_Cat').append(new Option(cat.NomCategorie, cat.id));
        })
        $('select#Edit_Cat').change()
        // $.each(pCat.groupes, function(index, grp){
        //   grp.getJour().then(jr=>{
        //     if (pJours.id === jr.id) {
        //       $('select#Edit_groupe').append(new Option(grp.NomGroupe, grp.id))
        //     }
        //   })
        //   // $('select#Edit_Cat').append(new Option(horaire.categorie.NomCategorie, horaire.categorie.id));
        // })

    });
    categorie.findAll({
      include: [{model: groupes, require: true}]
    }).then(categories=>{
      pCategorie = categories[0]
      $.each(categories, function(index, categorie){
        $('select#Edit_categorie').append(new Option(categorie.NomCategorie, categorie.id))
      })
      $.each(pCategorie.groupes, function(index, groupe){
// $('select#Edit_group').append(new Option(groupe.NomGroupe, groupe.id))
      })

    })
    if ($('.edit-groupe').is(":hidden")) $('.edit-groupe').show('long');
    else $('.edit-groupe').hide('fast')
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
      message: 'Vous voulez vraiment supprimer cette categorie de '+$('select#Edit_Jours option:selected').text()+'?',
      noLink: true,
      icon: iconQuestion,
      cancelId:-1
    }, response =>{
        if (!response) {
          // let trToDelete = $('#group_list tbody').find('td').find('input:radio[name="group"]:checked').closest('tr');
          categorie.findOne({
            where: {
              id: $('select#Edit_Cat').val()
            }
          }).then((cat)=>{
            cat.removeJour($('select#Edit_Jours').val()).then(()=>{
              cat.removeGroupes([$('select#Edit_groupe options').val()])
              ipc.send('refresh-group');
            })

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
              id: $('select#Edit_Cat').val()
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
              id: $('select#Edit_groupe option:selected').val()
            }
          }).then(()=>{
            ipc.send('refresh-group');
          });
        }

    })

  })

}
function updateTime(){
  $('button#EditTime1').on('click', function(){
    // let trToUpdate = $('#group_list tbody').find('td').find('input:radio[name="group"]:checked').closest('tr');
    if (!$('select#Edit_groupe').val()) {
      $('span#msgTime').html("Vous devez choisir un groupe !")
      return;
    }
    if ($('input#Edit_Heure1').val() != "") {
      groupes.findOne({
        where: {id:$('select#Edit_groupe').val()}
      }).then(grpToUpdate => {
        grpToUpdate.update({
          horaire1: $('input#Edit_Heure1').val()
        }).then(()=>{
           $('#group_list').find("tr:gt(0)").remove();
           ipc.send('refresh-group')
           $('.edit-groupe').hide()
         });
       });
    }else $('span#msgTime').html("l'heure 1 ne doit pas être vide !")
  })
  $('button#EditTime2').on('click', function(){
    // let trToUpdate = $('#group_list tbody').find('td').find('input:radio[name="group"]:checked').closest('tr');
    if (!$('select#Edit_groupe').val()) {
      $('span#msgTime').html("Vous devez choisir un groupe !")
      return;
    }
    if ($('input#Edit_Heure2').val() != "") {
      groupes.findOne({
        where: {id:$('select#Edit_groupe').val()}
      }).then(grpToUpdate => {
        grpToUpdate.update({
          horaire2: $('input#Edit_Heure2').val()
        }).then(()=>{
           // $('#group_list').find("tr:gt(0)").remove();
           // ipc.send('refresh-group')
           $('.edit-groupe').hide()
         });
       });
    }else $('span#msgTime').html("l'heure 2 ne doit pas être vide !")
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
      include: [
        {model: groupes,
         require: true,
         include: categorie
       }
      ]
    }).then(jours => {
      console.log(jours);
      $('table#table_show_cat tbody tr').remove()
        $('h4#titleDayes').html(jours.Jour1+'-'+jours.Jour2)
        let nmC = ''
        let classe = ''
        $.each(jours.groupes, function(index, grp){
          if (nmC != grp.categorie.NomCategorie) {
            classe = 'border-top: #b95a5a solid 2px'
          }else classe = '';
          nmC = grp.categorie.NomCategorie
          $('table#table_show_cat tbody').append('<tr style="'+classe+'">'+
          '<td>'+grp.NomGroupe+'</td>'+
          '<td>'+grp.horaire1+'/'+grp.horaire2+'</td>'+
          '<td>'+grp.categorie.NomCategorie+'</td>'+
          '</tr>')
        })
          $('table#table_show_cat tbody tr:first-child').css('border-top', 'none')
  })//.map(function(item) { return item["NomGroupe"]; })
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
