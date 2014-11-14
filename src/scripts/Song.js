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
  this._id = opts._id;
  this._rev = opts._rev;
};
Song.prototype.save = function () {
  var obj = {
    _id: this.path,
    name: this.name,
    path: this.path,
    rate: this.rate,
    duration: this.duration
  };
  if (this._rev) {
    obj._rev = this._rev;
  }
  return songDB.put(obj);
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
