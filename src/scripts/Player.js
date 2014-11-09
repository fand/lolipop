'use strict';

var Vue = require('vue');

var LoliPlaylist = require('./Playlist');

var PlayerPlaylist = new Vue({
  el: '#player-playlist',
  data: {
    over: false
  },
  methods: {
    onDrop: function (files) {
      this.$.playlist.onDrop(files);
    },
    getSongs: function () {
      return this.$.playlist.songs;
    }
  }
});

var Player = new Vue({
  el: '#player',
  methods: {
    onClick: function () {
      console.log('yo');
      console.log(PlayerPlaylist.getSongs());
    }
  }
});


module.exports = Player;
