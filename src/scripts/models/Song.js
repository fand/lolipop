'use strict';

var fs = require('fs');
var mime = require('mime');
var songDB = PouchDB('song');

var checker = document.createElement('audio');
var isLoadable = function (path) {
  if (fs.existsSync(path)) {
    var type = mime.lookup(path);
    return !!(checker.canPlayType(type).replace('no', ''));
  }
  return false;
};

var Song = function (opts) {
  this.name = opts.name;
  this.path = opts.path;
  this.rate = opts.rate;
  this.duration = opts.duration;
  this._id = this.path;
  if (opts._rev) { this._rev = opts._rev; }
};
Song.prototype.save = function () {
  var opts = {
    _id: this._id,
    name: this.name,
    path: this.path,
    rate: this.rate,
    duration: this.duration
  };

  return songDB.get(opts._id)
    .then(function (doc) {
      return opts._rev = doc._rev;
    })
    .catch(function (err) {
      if (err.status !== 404) { throw err; }
      return opts._rev = self._rev;
    })
    .then(function (doc) {
      return songDB.put(opts);
    })
    .catch(function (err) {
      if (err.status !== 404) {
        console.error('song save error');
        console.error(err);
      }
    })
    .then(function () {
      return self;
    });
};

// Factory
Song.create = function (file) {
  var song;
  if (isLoadable(file.path)) {
    song = new Song({
      name: file.name,
      path: file.path,
      rate: 1.0,
      duration: null
    });
  }
  return song;
};
Song.load = function (id) {
  return songDB.get(id)
    .then(function (opts) {
      return new Song(opts);
    });
};
module.exports = Song;
