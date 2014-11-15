'use strict';

var playlistDB = PouchDB('playlist');
var Song = require('./Song');

var Playlist = function (opts) {
  this._id = opts._id;
  this.tracks = opts.tracks || [];
  if (opts._rev) { this._rev = opts._rev; }
};
Playlist.prototype.save = function () {
  var tracks = this.tracks.map(function (track) {
    return {
      songID: track.song._id,
      rate: track.rate
    };
  });
  var opts = {
    _id: this._id,
    tracks: tracks
  };
  if (this._rev) { opts._rev = this._rev; }
  return playlistDB.put(opts)
    .catch(function (err) {
      console.error('playlist save error');
      console.error(err);
    });
};
Playlist.prototype.at = function (i) {
  return this.tracks[i];
};
Playlist.prototype.remove = function (i) {
  this.tracks = this.tracks.splice(i, 1);
};
Playlist.prototype.push = function (track) {
  this.tracks.push(track);
};
Playlist.prototype.size = function () {
  return this.tracks.length;
};


// factory
Playlist.load = function (id) {
  return playlistDB.get(id)
    .catch(function (err) {
      if (err.status === 404) { throw err;}
      return { _id: id };
    })
    .then(function (opts) {
      var d;
      if (opts.tracks) {
        d = Promise.all(opts.tracks.map(function (track) {
          return Song.load(track.songID)
            .then(function (song) {
              return {
                song: song,
                rate: track.rate
              };
            });
        }));
      }
      else {
        d = Promise.resolve([]);
      }
      return d.then(function (tracks) {
        opts.tracks = tracks;
        return new Playlist(opts);
      });
    });
};
module.exports = Playlist;
