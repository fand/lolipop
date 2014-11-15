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
      .then(function (doc) {
        return Promise.all(doc.tracks.map(function (track) {
          return songDB.get(track.songID)
            .then(function (doc) {
              return {
                song: new Song(doc),
                rate: track.rate
              };
            });
        }));
      })
      .then(function (tracks) {
        self.$.player.tracks = tracks;
      })
      .catch(function (err) {
        if (err.status !== 404) { throw err; }
      });
  },
  methods: {
    close: function () {
      var self = this;
      Promise.resolve(this.$.player.tracks)
        .then(function (tracks) {
          // Save songs
          return Promise.all(tracks.map(function (track) {
            return track.song.save();
          }));
        })
        .then(function () {
          // Save playlist
          var rev;
          return playlistDB.get('playlist')
            .then(function (doc) { rev = doc._rev; })
            .catch(function (err) {
              if (err.status !== 404) { throw err; }
            })
            .then(function () {
              var tracks = self.$.player.tracks.map(function (track) {
                return {
                  songID: track.song._id,
                  rate: track.rate
                };
              });
              var obj = {
                _id: 'playlist',
                tracks: tracks
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
