const Sequelize = require('sequelize');
var tables = require(__dirname+'/config/scripts/db.js');
let users = tables.users
let sequelize = tables.sequelize
sequelize.sync().then(()=>{
  users.findAll().then(user=>{
    if (!user[0]) {
      users.create({
        username: 'admin',
        password: 'admin'
      })
    }
  })

})
/**
 * log in to application
 * @return void
*/
function logIn(){
  $('button#login').on('click', function(){
    users.findOne({
      where: {
        username: $('input#username').val(),
        password: $('input#password').val()
      }
    }).then((user)=>{
      if (user) {
          ipc.send('change-main', 'joueurs/index.html')
      }else {
        $('span#msg_login').html("<i class='fas fa-times-circle'></i> Nom d'utilisateur ou mot de passe est incorrect !")
      }
    })
  })
  $('input#username, input#password').on('keypress', function(e){
     if (e.keyCode == 13) {
       $('button#login').click()
     }
  })
}

/**
 * get user
 * @return void
*/
function getUser(){
  $('button#login').on('click', function(){
    users.findAll().then((user)=>{

    })
  })
}
$(document).ready(function(){
  logIn();
})
