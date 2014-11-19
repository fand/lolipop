'use strict';

var playlistDB = PouchDB('playlist');
var Song = require('./Song');

//playlistDB.destroy();
var Playlist = function (opts) {
  var now = new Date().getTime().toString();
  opts = opts || {};
  this._id = opts._id || now;
  this.tracks = opts.tracks || [];
  this.created_at = opts.created_at || now;
  this.updated_at = opts.updated_at || now;
  this._rev = opts._rev || null;
};
Playlist.prototype.saveIfChanged = function () {
  if (this.changed) {
    this.changed = false;
    return this.save();
  }
  return Promise.resolve(this);
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
    tracks: tracks,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
  if (this._rev != null)  {
    opts._rev = this._rev;
  }

  var self = this;
  return playlistDB.put(opts)
    .then(function (doc) {
      self._rev = doc.rev;
    })
    .catch(function (err) {
      console.error('playlist save error');
      console.error(err);
    }).then(function () {
      return self;
    });
};
Playlist.prototype.saveAll = function () {
  var self = this;
  return Promise.all(self.tracks.map(function (track) {
    return track.song.save();
  })).then(function () {
    return self.save();
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
Playlist.prototype.removeAll = function (indexes) {
  indexes = indexes.map(function (s) {
    return +s;
  });
  this.tracks = this.tracks.filter(function (x, i) {
    return indexes.indexOf(+i) === -1;
  });
};

// factory
Playlist.load = function (id) {
  return playlistDB.get(id)
    .catch(function (err) {
      if (err.status === 404) { throw err;}
      return new Playlist();
    })
    .then(function (doc) {
      // Load all tracks
      return Promise.all(doc.tracks.map(function (track) {
        return Song.load(track.songID)
          .then(function (song) {
            return {
              song: song,
              rate: track.rate
            };
          });
      }))
      .then(function (tracks) {
        doc.tracks =  (tracks.length > 0) ? tracks : [];
        return new Playlist(doc);
      });
    });
};
Playlist.getRecent = function () {
  return playlistDB.allDocs()
    .then(function (docs) {
      return Promise.all(docs.rows.map(function (row) {
        return Playlist.load(row.id);
      }));
    })
    .catch(function (err) {
      console.log(err);
    });
};
module.exports = Playlist;
