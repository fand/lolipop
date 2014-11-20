'use strict';

var fs = require('fs');

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

var Audio = function () {
  this.ctx = new webkitAudioContext();
  this.gainNode = this.ctx.createGain();
  this.gainNode.gain.value = 1.0;
  this.gainNode.connect(this.ctx.destination);
  this.source = null;
  this.sourcePath = null;
};
Audio.prototype.setGain = function (val) {
  this.gainNode.gain.value = val;
};
Audio.prototype.setRate = function (val) {
  if (this.source) {
    this.source.playbackRate.value = val;
  }
};
Audio.prototype.play = function (song, time, rate, callback) {
  if (this.sourcePath === song.path) {
    this.playBuffer(this.buffer, time, rate, callback);
    return;
  }
  var abuf = toArrayBuffer(fs.readFileSync(song.path));
  this.ctx.decodeAudioData(abuf, function (buf) {
    this.buffer = buf;
    this.sourcePath = song.path;
    song.duration = buf.length / buf.sampleRate;
    this.playBuffer(this.buffer, time, rate, callback);
  }.bind(this));

};
Audio.prototype.playBuffer = function (buffer, at, rate, callback) {
  this.source = this.ctx.createBufferSource();
  this.source.buffer = buffer;
  this.source.playbackRate.value = rate;
  this.source.connect(this.gainNode);
  this.source.start(0, at);
  this.source.onended = this.callbackOnEnded;
  callback();
};
Audio.prototype.pause = function () {
  if (this.source) {
    this.source.onended = null;
    this.source.stop(0);
    this.source = null;
  }
};
Audio.prototype.onEnded = function (fn) {
  this.callbackOnEnded = fn;
};

module.exports = new Audio();
