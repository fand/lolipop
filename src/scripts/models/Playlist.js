'use strict';

var playlistDB = PouchDB('playlist');
var Song = require('./Song');

var Playlist = function (opts) {
  this._id = opts._id;
  this.tracks = opts.tracks || [];
  this.created_at = opts.created_at;
  this.updated_at = opts.updated_at;
  this.changed = opts.changed;
  if (opts._rev) { this._rev = opts._rev; }
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
  if (this._rev)  {
    opts._rev = this._rev;
  }
  var saved;
  return playlistDB.put(opts)
    .then(function (doc) {
      saved = doc;
    })
    .catch(function (err) {
      console.error('playlist save error');
      console.error(err);
    }).then(function () {
      return saved;
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
      return {
        _id: id,
        tracks: [],
        created_at: new Date().toString(),
        updated_at: new Date().toString()
      };
    })
    .then(function (doc) {
      var d;
      if (doc.tracks.length > 0) {
        d = Promise.all(doc.tracks.map(function (track) {
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
        doc.tracks = tracks;
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
