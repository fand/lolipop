'use strict';

var Vue = require('vue');

var Playlist = require('../models/Playlist');

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

    this.$on('addPlaylist', this.addPlaylist);
    this.$on('playPlaylist', this.playPlaylist);
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
