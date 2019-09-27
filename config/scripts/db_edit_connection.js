const Sequelize = require('sequelize');
var tables = require('../config/scripts/db.js');
let users = tables.users

/**
 * get user
 * @return void
*/
function getUser(){
    users.findAll().then((user)=>{
      $('input#edit_username').val(user[0].username)
  })
}
/**
 * update user data
 * @return void
*/
function updateUserData(){
  $('button#edit_user').on('click', function(){
    if (!$('input#new_password').val() || !$('input#cnf_new_password').val()) {
      $('span#msg_edit_user').html("<i class='fas fa-times-circle'></i> le mot de passe et la confirmation sont obligatoire !")
      $('span#msg_edit_user').removeClass('text-success').addClass('text-danger')
      return;
    }

    if ($('input#new_password').val() == $('input#cnf_new_password').val()) {
      users.findOne({
        where: {password: $('input#old_password').val()}
      }).then((user)=>{
        if (user) {
          user.update({
            username: $('input#edit_username').val(),
            password: $('input#new_password').val()
          }).then(updatedUser=>{
            $('span#msg_edit_user').html("<i class='fas fa-check'></i> Les informations sont mis à jour ")
            $('span#msg_edit_user').removeClass('text-danger').addClass('text-success')
          })
        }else {
          $('span#msg_edit_user').html("<i class='fas fa-times-circle'></i> Mot de passe actuel est incorrect ! ")
          $('span#msg_edit_user').removeClass('text-success').addClass('text-danger')
        }
      })
    }else {
      $('span#msg_edit_user').html("<i class='fas fa-times-circle'></i> la confirmation de mot de passe est incorrect !")
      $('span#msg_edit_user').removeClass('text-success').addClass('text-danger')
    }

  })
}
$(document).ready(function(){
 getUser()
 updateUserData()
})