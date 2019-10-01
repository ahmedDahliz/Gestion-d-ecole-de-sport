const Sequelize = require('sequelize');
var tables = require('../config/scripts/db.js');
let users = tables.users
let oldUser;
/**
 * get user
 * @return void
*/
function getUser(){
    users.findAll().then((user)=>{
      $('input#edit_username').val(user[0].username)
      oldUser = user[0].username
  })
}
/**
 * update user data
 * @return void
*/
function updateUserData(){
  $('button#edit_user').on('click', function(){
    if ($('input#new_password').val()) {
      if ($('input#new_password').val() == $('input#cnf_new_password').val()) {
        users.findOne({
          where: {username:  oldUser ,password: $('input#old_password').val()}
        }).then((user)=>{
          if (user) {
            user.update({
              username: $('input#edit_username').val(),
              password: $('input#new_password').val()
            }).then(updatedUser=>{
              $('input#cnf_new_password').val("")
              $('input#new_password').val("")
              $('input#old_password').val("")
              $('span#msg_edit_user').html("<i class='fas fa-check'></i> Les informations sont mise à jour !")
              $('span#msg_edit_user').removeClass('text-danger').addClass('text-success')
                setTimeout(()=>{$('span#msg_edit_user').html("")}, 3000)
            })
          }else {
            $('span#msg_edit_user').html("<i class='fas fa-times-circle'></i> Mot de passe actuel est incorrect ! ")
            $('span#msg_edit_user').removeClass('text-success').addClass('text-danger')
              setTimeout(()=>{$('span#msg_edit_user').html("")}, 3000)
          }
        })
      }else {
        $('span#msg_edit_user').html("<i class='fas fa-times-circle'></i> la confirmation de mot de passe est incorrect !")
        $('span#msg_edit_user').removeClass('text-success').addClass('text-danger')
          setTimeout(()=>{$('span#msg_edit_user').html("")}, 3000)
      }
    }else {
      users.findOne({
        where: {username:  oldUser ,password: $('input#old_password').val()}
      }).then((user)=>{
        if (user) {
          user.update({
            username: $('input#edit_username').val(),
          }).then(updatedUser=>{
            $('input#new_password').val("")
            $('span#msg_edit_user').html("<i class='fas fa-check'></i> Les informations sont mise à jour ! ")
            $('span#msg_edit_user').removeClass('text-danger').addClass('text-success')
            setTimeout(()=>{$('span#msg_edit_user').html("")}, 3000)
          })
        }else {
          $('span#msg_edit_user').html("<i class='fas fa-times-circle'></i> Mot de passe actuel est incorrect ! ")
          $('span#msg_edit_user').removeClass('text-success').addClass('text-danger')
            setTimeout(()=>{$('span#msg_edit_user').html("")}, 3000)
        }
      })
    }
  })
}
$(document).ready(function(){
 getUser()
 updateUserData()
})
