const Sequelize = require('sequelize');
// init connection
sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'config/db/db_ecole.db'
})

//for groupes page


let jours  = sequelize.define('jours', {
  Jour1: { type: Sequelize.STRING, allowNull: false },
  Jour2: { type: Sequelize.STRING, allowNull: false }
})
let categorie  = sequelize.define('categorie', {
  NomCategorie: { type: Sequelize.STRING, allowNull: false, unique: { args: true,  msg: 'Cette categorie existe déja !'} }
})
let entreneurs  = sequelize.define('entreneurs', {
  NomE: { type: Sequelize.STRING, allowNull: false },
  PrenomE: { type: Sequelize.STRING, allowNull: false },
  TelephoneE : { type: Sequelize.STRING, allowNull: false }
})
let groupes = sequelize.define('groupes', {
  NomGroupe: { type: Sequelize.STRING, allowNull: false},
  horaire1: {type: Sequelize.TIME, allowNull: false},
  horaire2: {type: Sequelize.TIME, allowNull: false}
})
// let horaire = sequelize.define('horaire', {
//
// })
let joueurs = sequelize.define('joueurs', {
  Nom: { type: Sequelize.STRING, allowNull: false },
  Prenom: { type: Sequelize.STRING, allowNull: false },
  Tele1: { type: Sequelize.STRING, allowNull: false },
  Tele2: { type: Sequelize.STRING, allowNull: true },
  Tele3: { type: Sequelize.STRING, allowNull: true },
  DateNaissance: { type: Sequelize.DATE, allowNull: false },
  Adresse: { type: Sequelize.TEXT, allowNull: true },
  // Prix: { type: Sequelize.DECIMAL, allowNull: false },
  PrixAnnuel: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
  photo: { type: Sequelize.STRING, allowNull: false },
  certificat: { type: Sequelize.STRING, allowNull: true },
})

let paiement = sequelize.define('paiement', {
  PaiementPour: {type: Sequelize.STRING, allowNull: false },
  Montant: {type: Sequelize.DECIMAL, allowNull: false }
})
let users = sequelize.define('users', {
  username: {type: Sequelize.STRING, allowNull: false },
  password: {type: Sequelize.DECIMAL, allowNull: false }
})

exports.jours = jours;
exports.categorie = categorie;
exports.groupes = groupes;
// exports.horaire = horaire;
exports.entreneur = entreneurs;
exports.joueurs = joueurs;
exports.paiement = paiement;
exports.users = users;
// exports.entreneur_groupe = entreneur_groupe;

//relationShips
jours.belongsToMany(categorie, {through: 'jours_categories', onDelete: 'CASCADE'})
categorie.belongsToMany(jours, {through: 'jours_categories', onDelete: 'CASCADE'})
jours.hasMany(groupes, {onDelete:'CASCADE'})
groupes.belongsTo(jours, {onDelete:'CASCADE'})
categorie.hasMany(groupes, {onDelete:'CASCADE'})
groupes.belongsTo(categorie, {onDelete:'CASCADE'})
joueurs.belongsTo(groupes)
groupes.hasMany(joueurs)
joueurs.hasMany(paiement)
paiement.belongsTo(joueurs)
// sequelize.sync()
// exports.seq = sequelize.authenticate()
// .then(() => {
//   console.log('Connection has been established successfully.');
// })
// .catch(err => {
//   console.error('Unable to connect to the database:', err);
// });

  //send the connector to the ORM files
  // ipcMain.on('connector', (event, arg) =>{
  //   event.reply('connector-reply', sequelize)
  // })
