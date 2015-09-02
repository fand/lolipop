'use strict';

var Vue = require('vue');

var Playlist = require('../models/Playlist');
var PlaylistCollection = require('../models/PlaylistCollection');

var PlaylistLoader = Vue.extend({
  template: require('./templates/PlaylistLoader.html'),
  data: function () {
    return {
      currentPlaylist : 0,
    };
  },
  props : ['collection'],
  conputed: {
    playlists: function () {
      return this.collection.playlists;
    },
    length: function () {
      return this.collection.playlists.length;
    }
  },
  created: function () {
    var self = this;
    PlaylistCollection.load('lolipop')
      .then(function (c) {
        self.collection = c;
      })
      .then(function () {
        if (self.collection.size() === 0) {
          return self.addPlaylist();
        }
        return true;
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
      var count = self.collection.size();
      var newlist = new Playlist({name: 'playlist ' + count});
      return newlist.save().then(function (doc) {
        self.collection.push(newlist);
        return newlist;
      });
    },
    playPlaylist: function (index) {
      var self = this;
      this.collection.at(this.currentPlaylist).save().then(function (saved) {
        self.currentPlaylist = index;
      });
    },
    movePlaylists: function (operands, pos) {
      this.collection.movePlaylists(operands, pos);
    },
    removePlaylists: function (indexes) {
      this.collection.removeAll(indexes);
    },
    close: function () {
      return this.collection.saveAll()
        .catch(function (err) {
          console.error(err);
        });
    }
  }
});


Vue.component('playlist-loader', PlaylistLoader);

module.exports = PlaylistLoader;
