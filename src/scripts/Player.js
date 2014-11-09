'use strict';

var Vue = require('vue');
var Droppable = require('./Droppable');
var LoliPlaylist = require('./Playlist');

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

var SAMPLE_RATE = 48000;

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

Vue.filter('rate', function (value) {
  var s = value + '';
  if (s.length === 1) {
    s += '.00';
  }
  s = (s + '000').slice(0, 4);
  return s;
});

Vue.filter('time', function (value) {
  var min = ('00' + ((value / 60) | 0)).slice(-2);
  var sec = ('00' + ((value % 60) | 0)).slice(-2);
  return min + ':' + sec;
});

var Player = new Vue({
  el: '#player',
  data: {
    songs: [],
    currentTrack: 0,
    isPlaying: false,
    rateRaw: 100,
    gainRaw: 100,
    timeRaw: 0,
    time: 0,
    duration: 0,
    overControl: false,
    overList: false
  },
  created: function () {
    this.ctx = new webkitAudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.value = 1.0;
    this.gainNode.connect(this.ctx.destination);

    this.$watch('rateRaw', function () {
      if (! this.songs[this.currentTrack]) { return; }
      var rate = this.rateRaw / 100.0;
      this.source.playbackRate.value = rate;
      this.songs[this.currentTrack].rate = rate;
    });

    this.$watch('timeRaw', function () {
      var newTime = (this.timeRaw / 10000.0) * this.duration;
      if (Math.abs(this.time - newTime) < (this.rateRaw / 100.0) * 2) { return; }
      this.time = newTime;
      this.playAt(this.time);
    });
  },
  methods: {
    play: function (e) {
      this.playAt(0);
    },
    playAt: function (at) {
      if (!this.songs[this.currentTrack]) { return; }

      at = at || 0;
      if (this.source) {
        this.source.stop(0);
        this.source = null;
        clearInterval(this.timer);
      }
      this.isPlaying = true;
      var song = this.songs[this.currentTrack];

      // Load if unloaded
      this.loadBuffer(function () {
          // play
          this.source = this.ctx.createBufferSource();
          this.source.buffer = song.buffer;
          this.source.playbackRate.value = this.rateRaw / 100.0;
          this.source.connect(this.gainNode);
          this.source.start(0, at);

          // set values
          this.duration = song.duration;
          this.time = at;
          this.timer = setInterval(function () {
            if (this.time > this.duration) { return; }
            this.time = this.time + this.rateRaw / 100.0;
            this.timeRaw = (this.time / this.duration) * 10000.0;
          }.bind(this), 999);
      }.bind(this));
    },
    loadBuffer: function (callback) {
      var song = this.songs[this.currentTrack];
      if (song.buffer) {
        callback();
      }
      else {
        var buf = fs.readFileSync(song.path);
        var abuf = toArrayBuffer(buf);
        this.ctx.decodeAudioData(abuf, function (buf) {
          song.buffer = buf;
          song.duration = buf.length / SAMPLE_RATE;
          callback();
        }.bind(this));
      }
    },
    onDropList: function (files) {
      var self = this;
      for (var i = 0; i < files.length; i++) {
        if (isLoadable(files[i].path)) {
          var song = {
            name: files[i].name,
            path: files[i].path,
            rate: 1.0
          };
          self.songs.push(song);
        }
      }
    }
  }
});

module.exports = Player;
