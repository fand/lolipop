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

var loadFile = function (file) {
  console.log(isLoadable(file.path));
  return true;
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

var Player = new Vue({
  el: '#player',
  data: {
    songs: [],
    currentTrack: 0,
    rate: 100,
    overControl: false,
    overList: false
  },
  created: function () {
    this.ctx = new webkitAudioContext();
    this.gain = this.ctx.createGain();
    this.gain.value = 1.0;
    this.gain.connect(this.ctx.destination);

    this.$watch('rate', function () {
      if (! this.songs[this.currentTrack]) { return; }
      var rate = this.rate / 100.0;
      this.source.playbackRate.value = rate;
      this.songs[this.currentTrack].rate = rate;
    });
  },
  methods: {
    play: function () {
      if (this.songs[this.currentTrack]) {
        var song = this.songs[this.currentTrack];

        // Load if unloaded
        if (! song.buffer) {
          var buf = fs.readFileSync(song.path);
          var abuf = toArrayBuffer(buf);
          this.ctx.decodeAudioData(abuf, function (buf) {
            song.buffer = buf;
            song.duration = buf.length / SAMPLE_RATE;

            // play
            this.source = this.ctx.createBufferSource();
            this.source.buffer = buf;
            this.source.playbackRate.value = this.rate / 100.0;
            this.source.connect(this.gain);
            this.source.start(0);
          }.bind(this));
        }
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
          console.log(self.songs);
        }
      }
    }
  }
});

module.exports = Player;
