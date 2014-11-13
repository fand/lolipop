'use strict';

var fs = require('fs');
var mime = require('mime');

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
