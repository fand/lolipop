'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
app.on('ready', function () {
  var frameOffset = 22;    // for atom-shell bug
  mainWindow = new BrowserWindow({
    width: 480, height: 360 - frameOffset,
    "min-width": 480, "min-height": 280 - frameOffset,
    frame: false
  });
  mainWindow.loadUrl('file://' + __dirname + '/public/index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});
