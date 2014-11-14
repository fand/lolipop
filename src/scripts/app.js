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

    var self = this;
    playlistDB.get('playlist')
      .then(function (playlist) {
        return Promise.all(playlist.songIDs.map(function (id) {
          return songDB.get(id);
        }));
      })
      .then(function (docs) {
        var songs = docs.map(function (song) {
          return new Song(song);
        });
        self.$.player.songs = songs;
      })
      .catch(function (err) {
        if (err.status !== 404) { throw err; }
      });
  },
  methods: {
    close: function () {
      Promise.resolve(this.$.player.songs)
        .then(function (songs) {
          // Save songs
          return Promise
            .all(songs.map(function (song) {
              return song.save();
            }))
            .catch(function (err) {
              console.error(err);
            });
        })
        .then(function (songs) {
          return songs.map(function (song) {
            return song.id;
          });
        })
        .then(function (songIDs) {
          // Save playlist
          var rev;
          return playlistDB.get('playlist')
            .then(function (doc) { rev = doc._rev; })
            .catch(function (err) {
              if (err.status !== 400) { throw err; }
            })
            .then(function () {
              var obj = {
                _id: 'playlist',
                songIDs: songIDs
              };
              if (rev) { obj._rev = rev; }
              return playlistDB.put(obj);
            });
        })
        .then(function (playlist) {
          console.log('saved songs:');
          console.log(playlist);
          console.log('QUIT!');
          app.quit();
        });
    },
    hide: function () {
      remote.getCurrentWindow().minimize();
    }
  }
});
