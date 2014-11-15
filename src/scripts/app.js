'use strict';

var Vue = require('vue');

var Droppable = require('./Droppable');
var Header = require('./Header');
var Player = require('./Player');
var remote = require('remote');
var app = remote.require('app');
var songDB = PouchDB('song');
var playlistDB = PouchDB('playlist');
var Song = require('./Song');

var main = new Vue({
  el: '#app',
  data: {
    currentView: 'player'
  },
  created: function () {
    this.$on('close', this.close);
    this.$on('hide', this.hide);
  },
  methods: {
    close: function () {
      this.$.player.close()
        .then(function () {
          console.log('QUIT!');
          app.quit();
        });
    },
    hide: function () {
      remote.getCurrentWindow().minimize();
    }
  }
});
