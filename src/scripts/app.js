'use strict';

var Vue = require('vue');

// models
var Song = require('./models/Song');

// Directives
var Droppable = require('./VM/Droppable');

// Components
var Header         = require('./VM/Header')
var PlaylistLoader = require('./VM/PlaylistLoader');

var remote = require('remote');
var app = remote.require('app');

var main = new Vue({
  el: '#app',
  components : {
    loliHeader     : Header,
    playlistLoader : PlaylistLoader,
  },
  data: {
    currentView: 'player'
  },
  created: function () {
    this.$on('close', this.close);
    this.$on('hide', this.hide);
  },
  ready: function () {
    // Prevent breaking app on miss drop
    this.$el.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    this.$el.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  },
  methods: {
    close: function () {
      this.$.loader.close()
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
