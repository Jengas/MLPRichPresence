/* eslint-disable no-console */

const electron = require('electron');
const {
  app,
  BrowserWindow,
  Menu,
  Tray
} = electron;
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');
const config = require('./config.json');
const fs = require('fs');
const parse = require('parse-duration')
const moment = require('moment')
const nativeImage = electron.nativeImage;
const AutoLaunch = require('auto-launch');
var Promises = require('bluebird');
var city = require('./assets/city.json')
var storages = require('electron-json-storage');

if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

if (config.defaultText || config.imageKeys) {
  console.log('ERROR: The config system has been altered since the last update. Please check config.json.example and update your config.\n')
  return app.quit();
}

const ClientId = config.clientID;
var openTimestamp
let mainWindow;
let appIcon = nativeImage.createFromPath(path.join(__dirname, 'assets/img/icon.ico'))

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});


const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

if (isSecondInstance) {
  app.quit()
}


storages.get('activity', function(error, data) {
  if (error) throw error;
  var autoload = data.autoload;
  const appFolder = path.dirname(process.execPath)
  const updateExe = path.resolve(appFolder, '..', 'Update.exe')
  const exeName = path.basename(process.execPath)

  app.setLoginItemSettings({
    openAtLogin: autoload,
    path: updateExe,
    args: [
      '--processStart', `"${exeName}"`,
      '--process-start-args', `"--hidden"`
    ]
  })
});

app.on('ready', function() {
  var width = 500
  var height = 600
  mainWindow = new BrowserWindow({
    width: width,
    heigh: height,
    frame: false,
    backgroundColor: "#222222",
    icon: appIcon
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  mainWindow.on('minimize', function(event) {
    event.preventDefault();
    mainWindow.hide();
    tray = new Tray(appIcon)
    const contextMenu = Menu.buildFromTemplate([{
        label: 'Открыть',
        type: 'normal',
        click: () => {
          mainWindow.show();
          tray.destroy();
        }
      },
      {
        label: 'Закрыть',
        type: 'normal',
        click: () => {
          app.quit();
        }
      }
    ])
    tray.setToolTip('Equestria Space RPC.')
    tray.setContextMenu(contextMenu)
  });
});


function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
      return true;
  }
};

DiscordRPC.register(ClientId);

const rpc = new DiscordRPC.Client({
  transport: 'ipc'
});

function checkday() {
  var hours = new Date().getHours()
  var isDayTime = hours > 6 && hours < 20;
  if (isDayTime) {
    return "sun";
  } else {
    return "moon";
  }
}

async function setActivity() {
  if (!rpc || !mainWindow)
    return;

  var checker = checkday();
  var storage = Promises.promisifyAll(require('electron-json-storage'));
  var storagedata = await storage.getAsync('activity').then(data => data);
  try {
    if (storagedata.state == undefined) {
      var newstate = "Кантерлот";
      var newstatekey = "canterlot";
    } else {
      var newstate = city[storagedata.state].city;
      var newstatekey = city[storagedata.state].state;
    }
    if (storagedata.details == undefined) {
      var newdetails = "Только приехал";
    } else {
      var newdetails = storagedata.details
    }
    var state = newstate
    var ltext = newstate
    var lkey = newstatekey
    var details = newdetails
  } catch (e) {
    var ltext = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("ltext")[text];')
    var details = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("details").value;')
    var state = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("state")[text];')
    var lkey = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("lkey")[text];')
  }
  if (checker == 'sun') {
    var stext = 'День'
  } else {
    var stext = 'Ночь'
  }
  var skey = checkday();

  if (state == "Космос") {
    var state = "В " + state + "е"
  } else {
    var state = "Город: " + state
  }

  var activity = {
    details: details,
    state: state,
    largeImageKey: lkey,
    largeImageText: ltext,
    instance: false
  }

  if (skey !== 'none') {
    activity.smallImageKey = skey
    activity.smallImageText = stext
  }

  if (!openTimestamp) {
    openTimestamp = new Date();
  }

  rpc.setActivity(activity);
}

rpc.on('ready', () => {
  setActivity();

  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login({
  clientId: ClientId
}).catch(console.error);
