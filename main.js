require("@electron/remote/main").initialize();
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const log = require("electron-log");
const {autoUpdater} = require("electron-updater")
const path = require("path");
const url = require("url");
const fs = require("fs");
const mkdirp = require("mkdirp");

var setupWindow = null;
var err;

var configDir =
  require("os").homedir() + "/Documents/My Games/SWG - Sentinels Republic";

app.commandLine.appendSwitch("disable-http-cache");

// Create config directory
if (!fs.existsSync(configDir)) created = mkdirp.sync(configDir);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1130,
    height: 610,
    resizable: false,
    fullscreen: false,
    fullscreenable: false,
    maximizable: false,
    minWidth: 1130,
    minHeight: 610,
    maxWidth: 1130,
    maxHeight: 610,
    transparent: true,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      enableRemoteModule: true,
      webviewTag: true,
      webview: true,
      nodeIntegration: true,
      contextIsolation: false,
      disableBlinkFeatures: "Auxclick",
    },
    icon: path.join(__dirname, "img/launcher-icon-64.png"),
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.once("closed", () => (mainWindow = null));
}

app.on("ready", () => setTimeout(createWindow, 100)); // Linux / MacOS transparancy fix
app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});
app.on("window-all-closed", () => app.quit());

// AutoUpdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});


ipcMain.on("open-directory-dialog", function (event, response) {
  dialog
    .showOpenDialog({
      properties: ["openFile", "openDirectory"],
    })
    .then((result) => {
      event.sender.send(response, result.filePaths[0]);
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on("setup-game", function () {
  setupGame();
});

function setupGame() {
  if (setupWindow == null) {
    setupWindow = new BrowserWindow({
      width: 810,
      height: 610,
      resizable: false,
      fullscreen: false,
      fullscreenable: false,
      maximizable: false,
      maxWidth: 810,
      maxHeight: 610,
      transparent: true,
      frame: false,
      autoHideMenuBar: true,
      webPreferences: {
        enableRemoteModule: true,
        webview: true,
        webviewTag: true,
        nodeIntegration: true,
        contextIsolation: false,
        disableBlinkFeatures: "Auxclick",
      },
      icon: path.join(__dirname, "img/installer-icon-64.png"),
    });
    setupWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "setup", "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
    setupWindow.on("closed", () => {
      setupWindow = null;
    });
  } else {
    setupWindow.focus();
  }
}

ipcMain.on("setup-complete", (event, arg) => {
  mainWindow.webContents.send("setup-begin-install", arg);
});

ipcMain.on("open-profcalc", function () {
  window = new BrowserWindow({
    width: 1296,
    height: 839,
    autoHideMenuBar: true,
    webPreferences: {
      enableRemoteModule: true,
      webview: true,
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.loadURL(
    url.format({
      pathname: path.join(__dirname, "profcalc", "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  if (require("electron-is-dev")) window.webContents.openDevTools();
});

ipcMain.on("minimise_mainwindow", function () {
  mainWindow.minimize();
});
ipcMain.on("close_mainwindow", function () {
  mainWindow.close();
});
