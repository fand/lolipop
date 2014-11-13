'use strict';

var fs = require('fs');

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
Audio.prototype.playBuffer = function (buffer, rate, at, callback) {console.log(buffer);
  this.source = this.ctx.createBufferSource();
  this.source.buffer = buffer;
  this.source.playbackRate.value = rate;
  this.source.connect(this.gainNode);
  this.source.start(0, at);
  this.source.onended = this.callbackOnEnded;
  callback();
};
Audio.prototype.pause = function () {console.log('pause?');
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
