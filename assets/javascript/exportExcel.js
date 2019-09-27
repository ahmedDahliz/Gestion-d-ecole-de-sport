const Excel = require('exceljs');
var  app = require('electron').remote.app
var fs = require('fs');
let months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
let currentMonth = new Date().toLocaleString('fr', {month: 'long'})
let currentYear = new Date().getFullYear()
let academicYear = currentYear+'_'+(currentYear + 1)
if (currentMonth >= 0) {
  academicYear = currentYear+'_'+(currentYear - 1)
}
/**
 * getPlayerData
 * @return promesse
*/
var dataPlayerRows = []
let testData = []
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
       sea:   player.groupe.jour.Jour1+'/'+player.groupe.jour.Jour2 +'\n'+player.groupe.horaire1+' / '+player.groupe.horaire2,
       aPrice: player.PrixAnnuel,  m9: paymentByMonth[9], m10: paymentByMonth[10], m11: paymentByMonth[11],
       m12: paymentByMonth[12], m1: paymentByMonth[1], m2: paymentByMonth[2], m3: paymentByMonth[3],
       m4: paymentByMonth[4], m5: paymentByMonth[5], m6: paymentByMonth[6], Somme: somme})
       paymentByMonth =  {
         '9':'', '10': '', '11': '' ,
         '12': '', '1': '', '2': '' ,
         '3': '', '4': '', '5': '' ,'6': ''
       }
       somme = 0
      })
        return dataPlayerRows
    })
}
/**
 * export absence list
 * @return void
*/
function exportAbscence(){
  $('button#export_list_abs').on('click', function(){
      $('img#loader_export_abs').show();
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
      console.log(dataPlayers);
      if (dataPlayers.length != 0) {
        let nameList = $('select#abs_day option:selected').text()+'_'+$('select#abs_cat option:selected').text()+'_'+$('select#abs_grp option:selected').text()
        var sheet = workbook.addWorksheet(nameList)
        sheet.mergeCells('E2:G2');
        sheet.getCell('E2').value = $('select#abs_day option:selected').text()
        // sheet.getRow(2).height = 20
        sheet.mergeCells('E4:G4');
        sheet.getCell('E4').value = dataPlayers[0].groupe.horaire1+'/'+dataPlayers[0].groupe.horaire2
        // sheet.getRow(4).height = 20
        sheet.mergeCells('E6:G6');
        sheet.getCell('E6').value = $('select#abs_cat option:selected').text()
        // sheet.getRow(6).height = 20
        sheet.mergeCells('E8:G8');
        sheet.getCell('E8').value = $('select#abs_grp option:selected').text()
        // sheet.getRow(8).height = 20
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
          // row.eachCell(function(cell) {
          //      cell.
          //    })
          row.height = 25
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
                   if (rowNumber <= 10) {
                     row.height = 20
                     cell.font = {
                       bold: true,
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
        fs.mkdir(app.getPath("desktop")+'/liste/Absences/'+$('select#abs_months option:selected').text()+'/'+$('select#abs_cat option:selected').text()+'/', { recursive: true }, (err) => {
          workbook.xlsx.writeFile(app.getPath('desktop')+"/liste/Absences/"+$('select#abs_months option:selected').text()+'/'+$('select#abs_cat option:selected').text()+'/'+currentMonth+currentYear+"_"+nameList+".xlsx").then(()=>{
            $('img#loader_export_abs').hide('fast');
            $('span#msg_export_abs').html("La liste d'absence est exporté !")
            $('span#msg_export_abs').removeClass('text-danger').addClass('text-success')
          }).catch(err=>{
            console.log(err.message);
          })
         });
      } else {
        $('img#loader_export_abs').hide('fast');
        $('span#msg_export_abs').html("il n'y a pas de joueurs dans ce groupe !")
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
    $('img#loader_export_all').show();
    $('span#msg_export_all').html('')
    $.when(getPlayerData()).done(function(){
      var workbook = new Excel.Workbook();
      workbook.creator = 'EcoleSportifeAbscence'
      let nameList = 'ListeJoueurs_'+academicYear
      var sheet = workbook.addWorksheet(nameList)
      sheet.mergeCells('D2:H2');
      sheet.getCell('D2').value = "Liste des joueurs pour l'année "+academicYear.replace('_', '/')

      sheet.getRow(4).values = ['Num', 'Nom et prenom','Date de naissance', 'Categorie', 'Séance', 'Prix annuel', '9','10', '11','12', '1', '2', '3','4','5','6', 'Somme'];
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
                         fgColor:{argb:'A54646'}
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
                            fgColor:{argb:'E4CCCC'}
                         };
                     }
                   }
                 }
           });
      });
      // $.each(dataPlayerRows, function(index, dataPlayer){
      //   console.log(dataPlayer);
      //   row = sheet.addRow({id: dataPlayer.id, name: dataPlayer.name,
      //   birthday: dataPlayer.birthday, cat: dataPlayer.cat,
      //   sea:   dataPlayer.sea, aPrice: dataPlayer.aPrice, m9: dataPlayer.m9, m10: dataPlayer.m10 ,m11: dataPlayer.m11,
      //   m12: dataPlayer.m12, m1: dataPlayer.m1, m2: dataPlayer.m2, m3: dataPlayer.m3,
      //   m4: dataPlayer.m4, m5: dataPlayer.m5, m6: dataPlayer.m6, Somme: dataPlayer.Somme})
      //   row.height = 25
      //   console.log(row);
      // })
      fs.mkdir(app.getPath("desktop")+'/liste', { recursive: true }, (err) => {
        workbook.xlsx.writeFile(app.getPath('desktop')+"/liste/"+nameList+".xlsx").then(()=>{
          $('img#loader_export_all').hide('long');
          $('span#msg_export_all').html("La liste est exporté ! ")
          $('span#msg_export_all').addClass('text-success')
        }).catch(err=>{
          console.log(err.message);
        })
       });
    })


    })
  // })
}
// sheet.columns = [
//   {header: 'Id', key: 'id'},
//   {header: 'name', key: 'name'},
//   {header: 'age', key: 'age'}
// ]
//
// sheet.addRow({id: 1, name: 'dah', age: 0634789845, style: {numFmt:'#############'}})
// sheet.addRow({id: 2, name: 'kha', age: 22})
// sheet.addRow({id: 3, name: 'mir', age: 27})
// sheet.addRow({id: 4, name: 'bou', age: 25})
// sheet.getCell('A2').font = {
//   name: 'Arial Black',
//   color: { argb: 'FF00FF00' },
//   family: 2,
//   size: 14,
//   italic: true
// };
$(document).ready(function(){
  exportAbscence();
  exportAll();
})
