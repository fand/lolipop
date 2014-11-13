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

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

var Song = function (opts) {
  this.name = opts.name;
  this.path = opts.path;
  this.rate = opts.rate;
  this.duration = opts.duration;
};
Song.prototype.loadBuffer = function (ctx, callback) {
  if (this.buffer) {
    callback(this.buffer, this.rate);
    return;
  }
  var buf = fs.readFileSync(this.path);
  var abuf = toArrayBuffer(buf);
  ctx.decodeAudioData(abuf, function (buf) {
    this.buffer = buf;
    this.duration = buf.length / buf.sampleRate;
    callback(this.buffer, this.rate);
  }.bind(this));
};


// Factory
Song.create = function (file) {
  var song;
  if (isLoadable(file.path)) {
    song = new Song({
      name: file.name,
      path: file.path,
      rate: 1.0,
      duration: 0
    });
  }
  return song;
};

module.exports = Song;
