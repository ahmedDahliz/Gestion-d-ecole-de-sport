var fs = require('fs');
let months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
let currentMonth = new Date().toLocaleString('fr', {month: 'long'})
let currentYear = new Date().getFullYear()
let totalSum = 0;
let academicYear = currentYear+'_'+(currentYear + 1)
if (currentMonth >= 0) {
  academicYear = currentYear+'_'+(currentYear - 1)
}
/**
 * getPlayerData
 * @return promesse
*/
var dataPlayerRows = []
function getPlayerData(){
    return joueurs.findAll({
    include:[
        {model: groupes, include: [categories,jours]},
        {model: paiement}
    ]
    }).then(dataPlayers=>{
      let paymentByMonth =  {
        '9':'', '10': '', '11': '' ,
        '12': '', '1': '', '2': '' ,
        '3': '', '4': '', '5': '' ,'6': ''
      }
      let somme = 0;
      $.each(dataPlayers, (index, player)=>{
        somme += player.PrixAnnuel
        $.each(player.paiements, function(index, pay){
            data = pay.PaiementPour.split(' ');
            paymentByMonth[months.indexOf(data[0])+1] = pay.Montant
            somme +=  pay.Montant
        })
       dataPlayerRows.push({id: player.id, name: player.Prenom+' '+player.Nom,
       birthday: getLocalDate(player.DateNaissance), cat: player.groupe.categorie.NomCategorie,
       sea:   player.groupe.jour.Jour1+'/'+player.groupe.jour.Jour2 +'\n'+player.groupe.horaire,
       aPrice: player.PrixAnnuel,  m9: paymentByMonth[9], m10: paymentByMonth[10], m11: paymentByMonth[11],
       m12: paymentByMonth[12], m1: paymentByMonth[1], m2: paymentByMonth[2], m3: paymentByMonth[3],
       m4: paymentByMonth[4], m5: paymentByMonth[5], m6: paymentByMonth[6], Somme: somme})
       paymentByMonth =  {
         '9':'', '10': '', '11': '' ,
         '12': '', '1': '', '2': '' ,
         '3': '', '4': '', '5': '' ,'6': ''
       }
       totalSum += somme
       somme = 0
      })
        // return dataPlayerRows
    })
}
/**
 * export absence list
 * @return void
*/
function exportAbscence(){
  $('button#export_list_abs').on('click', function(){
    $('img#loader_export_abs').show();
    const Excel = require('exceljs');
    $('span#msg_export_abs').html('')
    var workbook = new Excel.Workbook();
    workbook.creator = 'EcoleSportifeAbscence'
    joueurs.findAll({
      include:[
          {
            model: groupes,
            where: {id: $('select#abs_grp').val()},
            include: [categories,jours]

          }
      ]
    }).then(dataPlayers=>{
      if (dataPlayers.length != 0) {
        let nameList = $('select#abs_day option:selected').text()+'_'+$('select#abs_cat option:selected').text()+'_'+$('select#abs_grp option:selected').text()
        var sheet = workbook.addWorksheet(nameList)
        sheet.mergeCells('E2:G2');
        sheet.getCell('E2').value = $('select#abs_day option:selected').text()
        sheet.mergeCells('E4:G4');
        sheet.getCell('E4').value = dataPlayers[0].groupe.horaire
        sheet.getRow(4).height = 20
        sheet.mergeCells('E6:G6');
        sheet.getCell('E6').value = $('select#abs_cat option:selected').text()
        sheet.getRow(6).height = 20
        sheet.mergeCells('E8:G8');
        sheet.getCell('E8').value = $('select#abs_grp option:selected').text()
        sheet.getRow(8).height = 20
        days = $('select#abs_day option:selected').text().split('-')
        fDay = days[0].charAt(0)
        sDay = days[1].charAt(0)
        sheet.getRow(10).values = ['Num', 'Nom et prenom','Date de naissance', fDay+'1', sDay+'1',fDay+'2', sDay+'2',fDay+'3', sDay+'3',fDay+'4', sDay+'4',fDay+'5', sDay+'5',];
        sheet.columns = [
          {key: 'id'},
          {key: 'name', width: 25},
          {key: 'birthday', width: 20},
          {key: fDay+'1'},
          {key: sDay+'1'},
          {key: fDay+'2'},
          {key: sDay+'2'},
          {key: fDay+'3'},
          {key: sDay+'3'},
          {key: fDay+'4'},
          {key: sDay+'4'},
          {key: fDay+'5'},
          {key: sDay+'5'},
        ]
        $.each(dataPlayers, (index, player)=>{
          row = sheet.addRow({id: player.id, name: player.Prenom+' '+player.Nom, birthday: getLocalDate(player.DateNaissance, '', '', '', '', '', '', '', '', '', '')})
          row.height = 30
        })
        sheet.eachRow({ includeEmpty: true }, function(row, rowNumber){
            row.eachCell(function(cell, colNumber){
                  cell.font = {
                    name: 'Arial',
                    family: 2,
                    bold: false,
                    size: 10,
                  };
                  cell.alignment = {
                     vertical: 'middle', horizontal: 'center'
                   };
                   if (rowNumber <= 9) {
                     row.height = 20
                     cell.font = {
                       bold: true,
                       name: 'Arial',
                       family: 2,
                       size: 15,
                     };
                   }
                   if (rowNumber === 10) {
                     row.height = 20
                     cell.font = {
                       bold: true,
                       name: 'Arial',
                       family: 2,
                       size: 11,
                     };
                   }
                   if (rowNumber >= 10) {
                    for (var i = 1; i < 14; i++) {
                      if (rowNumber == 10) {
                        row.getCell(i).fill = {
                           type: 'pattern',
                           pattern:'solid',
                           fgColor:{argb:'C7C7C7'}
                        };
                      }
                      row.getCell(i).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                      };

                    }

                  }
                   if (rowNumber >= 12) {
                     if (rowNumber%2 == 0) {
                       for (var i = 1; i < 14; i++) {
                           row.getCell(i).fill = {
                              type: 'pattern',
                              pattern:'solid',
                              fgColor:{argb:'EDEDED'}
                           };
                       }
                     }
                   }
             });
        });
        fs.mkdir(app.getPath("desktop")+'/listes/Absences/'+$('select#abs_months option:selected').text()+'/'+$('select#abs_day option:selected').text()+'/', { recursive: true }, (err) => {
          workbook.xlsx.writeFile(app.getPath('desktop')+"/listes/Absences/"+$('select#abs_months option:selected').text()+'/'+$('select#abs_day option:selected').text()+'/'+currentMonth+currentYear+"_"+nameList+".xlsx").then(()=>{
            $('img#loader_export_abs').hide('fast');
            $('span#msg_export_abs').html("<i class='fas fa-check-circle'></i> La liste d'absence est exporté !")
            $('span#msg_export_abs').removeClass('text-danger').addClass('text-success')
          }).catch(err=>{
            $('img#loader_export_abs').hide('fast');
            if (err.message.includes('EBUSY: resource busy or locked')) {
              $('span#msg_export_abs').html("<i class='fas fa-times-circle'></i> Ce fichier est ouvert, veuillez la fermer avant de l'exporter")
              $('span#msg_export_abs').removeClass('text-success').addClass('text-danger')
            }
          })
         });
      } else {
        $('img#loader_export_abs').hide('fast');
        $('span#msg_export_abs').html("<i class='fas fa-times-circle'></i> il n'y a pas de joueurs dans ce groupe !")
        $('span#msg_export_abs').removeClass('text-success').addClass('text-danger')
      }
    })
  })
}
/**
  * export all players
  * @return void
*/
function exportAll(){
  $('button#export_all').on('click', function(){
    let nameList = 'ListeJoueurs_'+academicYear
    $('img#loader_export_all').show();
    $('span#msg_export_all').html('');
    $.when(getPlayerData()).done(function(){
      console.log(dataPlayerRows);
      const Excel = require('exceljs');
      var workbook = new Excel.Workbook();
      workbook.creator = 'EcoleSportive'
      var sheet = workbook.addWorksheet(nameList)
      sheet.mergeCells('D2:H2');
      sheet.getCell('D2').value = "Liste des joueurs pour l'année "+academicYear.replace('_', '/')
      sheet.getRow(4).values = ['Num', 'Nom et prenom','Date de naissance', 'Categorie', 'Séances', 'Prix annuel', '9','10', '11','12', '1', '2', '3','4','5','6', 'Somme'];
      sheet.columns = [
        {key: 'id'},
        {key: 'name', width: 25},
        {key: 'birthday', width: 20},
        {key: 'cat'},
        {key: 'sea', width: 20},
        {key: 'aPrice', width: 15},
        {key: 'm9'},
        {key: 'm10'},
        {key: 'm11'},
        {key: 'm12'},
        {key: 'm1'},
        {key: 'm2'},
        {key: 'm3'},
        {key: 'm4'},
        {key: 'm5'},
        {key: 'm6'},
        {key: 'Somme'},
      ]
      sheet.addRows(dataPlayerRows)
      sheet.eachRow({ includeEmpty: true }, function(row, rowNumber){
          row.eachCell(function(cell, colNumber){
                cell.alignment = {
                   vertical: 'middle', horizontal: 'center'
                 };
                 if (rowNumber == 2) {
                   cell.font = {
                     name: 'Arial',
                     family: 2,
                     bold: true,
                     size: 25,
                   };
                 }
                 if (rowNumber <= 4) {
                   row.height = 20
                   cell.font = {
                     bold: true,
                   };
                 }
                 if (rowNumber >= 4) {
                   row.height = 25
                   cell.font = {
                     name: 'Arial',
                     family: 2,
                     bold: false,
                     size: 10,
                   };
                   row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
                  for (var i = 1; i < 18; i++) {
                    if (rowNumber == 4) {
                      row.getCell(i).fill = {
                         type: 'pattern',
                         pattern:'solid',
                         fgColor:{argb:'62909F'}
                      };
                      row.getCell(i).font = {
                        name: 'Arial',
                        family: 2,
                        bold: true,
                        size: 10,
                      };
                    }
                    row.getCell(i).border = {
                      top: {style:'thin'},
                      left: {style:'thin'},
                      bottom: {style:'thin'},
                      right: {style:'thin'}
                    };

                  }

                }
                 if (rowNumber >= 6) {
                   if (rowNumber%2 == 0) {
                     for (var i = 1; i < 18; i++) {
                         row.getCell(i).fill = {
                            type: 'pattern',
                            pattern:'solid',
                            fgColor:{argb:'EBF4F4'}
                         };
                     }
                   }
                 }
           });
      });
      sheet.mergeCells('L'+(sheet.lastRow.number+2)+':Q'+(sheet.lastRow.number+2))
      sheet.getRow(sheet.lastRow.number).height = 25
      totalCell = sheet.getCell('L'+(sheet.lastRow.number))
      totalCell.value = "Total de toute l'année : "+totalSum+' DH'
      totalCell.alignment = {
           vertical: 'middle', horizontal: 'center'
         };
      totalCell.font = {
         name: 'Arial',
         family: 2,
         bold: true,
         size: 11,
       };
      fs.mkdir(app.getPath("desktop")+'/listes', { recursive: true }, (err) => {
        workbook.xlsx.writeFile(app.getPath('desktop')+"/listes/"+nameList+".xlsx").then(()=>{
          $('img#loader_export_all').hide('long');
          dataPlayerRows = []
          $('span#msg_export_all').html("<i class='fas fa-check-circle'></i> La liste est exporté ! ")
          $('span#msg_export_all').removeClass('text-danger').addClass('text-success')
        }).catch(err=>{
          $('img#loader_export_all').hide('long');
          if (err.message.includes('EBUSY: resource busy or locked')) {
            $('span#msg_export_all').html("<i class='fas fa-times-circle'></i> Ce fichier est ouvert, veuillez le fermer avant de l'exporter")
            $('span#msg_export_all').removeClass('text-success').addClass('text-danger')
          }
        })
       });
    })
  })
}

$(document).ready(function(){
  exportAbscence();
  exportAll();
})
