// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
function createWindows () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  mainWindow.loadFile('joueurs/index.html')
  mainWindow.once("ready-to-show", function(){
    mainWindow.show();
  })
  ipcMain.on('change-main', function(event, args){
    mainWindow.loadFile(args)
    mainWindow.once("ready-to-show", function(){
      mainWindow.show();
    })
  })
  ipcMain.on('refresh-group', function(){
    mainWindow.reload();
  })
  // ipcMain.on('idPlayer', function(event, args){
  //   console.log(args);
  //   event.reply('redirect-idPlayer', args)
  // })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// connecting to the database
const Sequelize = require('sequelize');

exports.sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'config/db/EcoleDeTerraines.db'
})
