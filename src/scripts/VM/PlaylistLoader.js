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
      self.playlists = docs;
      self.currentPlaylist = 0;
    });

    this.$on('newList', this.newList);
  },
  methods: {
    addPlaylist: function () {
      var self = this;
      var newlist = new Playlist({
        _id: new Date().toString(),
        tracks: this.templist.tracks,
        created_at: new Date().toString(),
        updated_at: new Date().toString(),
        changed: true
      });
      newlist.save().then(function (doc) {
        newlist._rev = doc._rev;
        self.playlists.push(newlist);
        self.templist.tracks = [];
      });
    },
    close: function () {
      var self = this;
      return Promise.all(this.playlists.map(function (p) {
        return p.saveAll();
      }));
    }
  }
};


Vue.component('PlaylistLoader', PlaylistLoader);

module.exports = PlaylistLoader;
