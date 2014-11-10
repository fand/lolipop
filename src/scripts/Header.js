'use strict';

var Vue = require('vue');
// var remote = require('remote');
// var BrowserWindow = remote.require('browser-window');

var Header = new Vue({
  el: '#header',
  methods: {
    close: function () {
      //BrowserWindow.close();
    },
    hide: function () {
      //BrowserWindow.hide();
    }
  }
});

module.exports = Header;
