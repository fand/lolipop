'use strict';

var Vue = require('vue');

var Playlist = require('../models/Playlist');
var Playlists = require('../models/Playlist');

var PlaylistLoader = {
  data: function () {
    return {
      currentPlaylist: null,
      playlists: []
    };
  },
  created: function () {
    var self = this;
    Playlist.getRecent().then(function (docs) {
      if (docs && docs.length > 0) {
        self.playlists = docs;
        return self.playlists;
      }
      else {
        return self.addPlaylist();
      }
    })
    .then(function () {
      self.currentPlaylist = 0;
    });

    this.$on('addPlaylist', this.addPlaylist.bind(this));
    this.$on('removePlaylists', this.removePlaylists.bind(this));
    this.$on('playPlaylist', this.playPlaylist.bind(this));
    this.$on('movePlaylists', this.movePlaylists.bind(this));
  },
  methods: {
    addPlaylist: function () {
      var self = this;
      var newlist = new Playlist();
      return newlist.save().then(function (doc) {
        self.playlists.push(newlist);
        return newlist;
      });
    },
    playPlaylist: function (index) {
      var self = this;
      console.log(this.playlists);
      this.playlists[this.currentPlaylist].save().then(function (saved) {
        self.currentPlaylist = index;
      });
    },
    movePlaylists: function (operands, pos) {console.log('called');console.log(arguments);
      var self = this;
      var tmp = [];
      operands.forEach(function (i) {
        tmp.push(self.playlists[i]);
      });
      this.removeAll(operands);
      var head = this.playlists.slice(0, pos);
      var tail = this.playlists.slice(pos);
      this.playlists = head.concat(tmp, tail);
    },
    removePlaylists: function () {

    },
    close: function () {
      var self = this;
      return Promise.all(this.playlists.map(function (p) {
        return p.saveAll();
      })).catch(function (err) {
        console.error(err);
      });
    }
  }
};


Vue.component('PlaylistLoader', PlaylistLoader);

module.exports = PlaylistLoader;
