'use strict';

var playlistDB = PouchDB('playlist');
var PlaylistCollectionDB = PouchDB('playlistCollection');
var Playlist = require('./Playlist');

//PlaylistCollectionDB.destroy();
var PlaylistCollection = function (opts) {
  var now = new Date().getTime().toString();
  opts = opts || {};
  this._id = opts._id || now;
  this.playlists = opts.playlists || [];
  this.created_at = opts.created_at || now;
  this.updated_at = opts.updated_at || now;
  this._rev = opts._rev || null;
};
PlaylistCollection.prototype.save = function () {
  var playlistIDs = this.playlists.map(function (playlist) {
    return playlist._id;
  });
  var opts = {
    _id: this._id,
    playlistIDs: playlistIDs,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
  if (this._rev != null)  {
    opts._rev = this._rev;
  }

  var self = this;
  return PlaylistCollectionDB.put(opts)
    .then(function (doc) {
      self._rev = doc.rev;
    })
    .catch(function (err) {
      console.error('playlistCollection save error');
      console.error(err);
    }).then(function () {
      return self;
    });
};
PlaylistCollection.prototype.saveAll = function () {
  var self = this;
  return Promise.all(self.playlists.map(function (playlist) {
    return playlist.saveAll();
  })).then(function () {
    return self.save();
  });
};
PlaylistCollection.prototype.at = function (i) {
  return this.playlists[i];
};
PlaylistCollection.prototype.remove = function (i) {
  this.playlists = this.playlists.splice(i, 1);
};
PlaylistCollection.prototype.push = function (playlist) {
  this.playlists.push(playlist);
};
PlaylistCollection.prototype.size = function () {
  return this.playlists.length;
};
PlaylistCollection.prototype.removeAll = function (indexes) {
  indexes = indexes.map(function (s) {
    return +s;
  });
  this.playlists = this.playlists.filter(function (x, i) {
    return indexes.indexOf(+i) === -1;
  });
};
PlaylistCollection.prototype.movePlaylists = function (operands, pos) {
  var self = this;
  var tmp = [];
  operands.forEach(function (i) {
    tmp.push(self.playlists[i]);
  });
  this.removeAll(operands);
  var head = this.playlists.slice(0, pos);
  var tail = this.playlists.slice(pos);
  this.playlists = head.concat(tmp, tail);
};

// factory
PlaylistCollection.load = function (id) {
  var self = this;
  return PlaylistCollectionDB.get(id)
    .catch(function (err) {
      if (err.status !== 404) { throw err; }
      return {
        _id: id,
        playlistIDs: []
      };
    })
    .then(function (doc) {
      // Load all playlists
      return Promise.all(doc.playlistIDs.map(function (playlistID) {
        return Playlist.load(playlistID);
      }))
      .then(function (playlists) {
        doc.playlists = playlists;
        return new PlaylistCollection(doc);
      });
    });
};
module.exports = PlaylistCollection;
