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
  var obj = {
    _id: this._id,
    name: this.name,
    path: this.path,
    rate: this.rate,
    duration: this.duration
  };
  var p = (this._rev) ?
        Promise.resolve({_rev: this._rev}) :
        songDB.get(obj._id);
  return p.then(function (doc) {
    obj._rev = doc._rev;
    return songDB.put(obj);
  }).catch(function (err) {
    console.error('song save error');
    console.error(err);
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

module.exports = Song;
