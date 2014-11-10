'use strict';

var Vue = require('vue');
var remote = require('remote');

var Header = new Vue({
  el: '#header',
  methods: {
    close: function () {
      var app = remote.require('app');
      app.quit();
    },
    hide: function () {
      remote.getCurrentWindow().minimize();
    }
  }
});

module.exports = Header;
