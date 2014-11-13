'use strict';

var Vue = require('vue');
var Droppable = require('./Droppable');
var LoliPlaylist = require('./LoliPlaylist');
var Song = require('./Song');

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
    isLoop: false,
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
    this.gainNode.gain.value = 1.0;
    this.gainNode.connect(this.ctx.destination);

    this.$watch('rateRaw', function () {
      if (! this.songs[this.currentTrack]) { return; }
      var rate = this.rateRaw / 100.0;
      if (this.source) {
        this.source.playbackRate.value = rate;
      }
      this.songs[this.currentTrack].rate = rate;
    });

    this.$watch('timeRaw', function () {
      var newTime = (this.timeRaw / 10000.0) * this.duration;
      if (Math.abs(this.time - newTime) < (this.rateRaw / 100.0) * 2) { return; }
      this.time = newTime;
      this.playAt(this.time);
    });

    this.$watch('gainRaw', function () {
      this.gainNode.gain.value = this.gainRaw / 100.0;
    });

    this.$on('doubleClick', function (index) {
      this.pause();
      this.currentTrack = index;
      this.playAt(0);
    });
  },
  methods: {
    play: function (e) {
      this.playAt(this.time);
    },
    playAt: function (at) {
      if (!this.songs[this.currentTrack]) { return; }

      at = at || 0;
      this.pause();
      this.isPlaying = true;

      var song = this.songs[this.currentTrack];

      // Load if unloaded
      song.loadBuffer(this.ctx, function () {
        // play
        this.source = this.ctx.createBufferSource();
        this.source.buffer = song.buffer;
        this.source.playbackRate.value = this.rateRaw / 100.0;
        this.source.connect(this.gainNode);
        this.source.start(0, at);
        this.source.onended = function () {
          if (this.currentTrack < this.songs.length - 1 || this.isLoop) {
            this.forward();
          }
          else {
            this.stop();
          }
        }.bind(this);

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
    pause: function () {
      if (this.source) {
        this.source.onended = null;
        this.source.stop(0);
        this.source = null;
        clearInterval(this.timer);
      }
      this.isPlaying = false;
    },
    stop: function () {
      this.pause();
      this.currentTrack = 0;
      this.rateRaw = this.songs[this.currentTrack].rate * 100;
      this.time = this.timeRaw = 0;
    },
    forward: function () {
      if (this.currentTrack >= this.songs.length - 1 && !this.isLoop) { return; }
      this.pause();
      this.currentTrack = (this.currentTrack + 1) % this.songs.length;
      this.rateRaw = this.songs[this.currentTrack].rate * 100;
      this.time = this.timeRaw = 0;
      this.playAt(this.time);
    },
    backward: function () {
      if (this.time < 3 && this.currentTrack !== 0) {
        this.currentTrack--;
        this.rateRaw = this.songs[this.currentTrack].rate * 100;
      }
      this.time = this.timeRaw = 0;
      this.playAt(this.time);
    },
    toggleLoop: function () {
      this.isLoop = !this.isLoop;
    },
    onDropList: function (files) {
      var self = this;
      for (var i = 0; i < files.length; i++) {
        var song = Song.create(files[i]);
        if (song) { self.songs.push(song); }
      }
    }
  }
});

module.exports = Player;
