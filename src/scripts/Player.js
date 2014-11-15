'use strict';

var Vue = require('vue');
var Droppable = require('./Droppable');
var LoliPlaylist = require('./LoliPlaylist');
var Song = require('./Song');
var Audio = require('./Audio');

Vue.filter('rate', function (value) {
  var s = value + '';
  if (s.length === 1) {
    s += '.00';
  }
  s = (s + '000').slice(0, 4);
  return s;
});

Vue.filter('time', function (value) {
  if (value !== null) {
    var min = ('00' + ((value / 60) | 0)).slice(-2);
    var sec = ('00' + ((value % 60) | 0)).slice(-2);
    return min + ':' + sec;
  }
  return ' - ';
});

var Player = Vue.extend({
  template: require('../templates/Player.html'),
  data: function () {
    return {
      tracks: [],
      track: null,
      currentTrack: 0,
      isPlaying: false,
      isLoop: false,
      rateRaw: 100,
      gainRaw: 100,
      timeRaw: 0,
      time: 0,
      overControl: false,
      overList: false
    };
  },
  created: function () {
    this.$watch('rateRaw', function () {
      if (! this.track) { return; }
      var rate = this.rateRaw / 100.0;
      this.track.rate = rate;
      Audio.setRate(rate);
    });

    this.$watch('timeRaw', function () {
      var newTime = (this.timeRaw / 10000.0) * this.track.song.duration;
      if (Math.abs(this.time - newTime) < (this.rateRaw / 100.0) * 2) { return; }
      this.time = newTime;
      this.playAt(this.time);
    });

    this.$watch('gainRaw', function () {
      Audio.setGain(this.gainRaw / 100.0);
    });

    this.$on('doubleClick', function (index) {
      this.pause();
      this.currentTrack = index;
      this.track = this.tracks[index];
      this.playAt(0);
    });

    Audio.onEnded(this.playNext.bind(this));
  },
  methods: {
    play: function (e) {
      this.playAt(this.time);
    },
    playAt: function (at) {
      if (!this.track) { return; }

      at = at || 0;
      this.pause();
      this.isPlaying = true;

      // Load if unloaded
      var self = this;
      Audio.play(this.track.song, at, function () {
        self.time = at;
        self.timer = setInterval(function () {
          if (self.time > self.track.song.duration) { return; }
          self.time = self.time + self.rateRaw / 100.0;
          self.timeRaw = (self.time / self.track.song.duration) * 10000.0;
        }, 999);
      });
    },
    playNext: function () {
      if (this.currentTrack < this.tracks.length - 1 || this.isLoop) {
        this.forward();
      }
      else {
        this.stop();
      }
    },
    pause: function () {
      clearInterval(this.timer);
      Audio.pause();
      this.isPlaying = false;
    },
    stop: function () {
      this.pause();
      this.track.song.buffer = null;
      this.currentTrack = 0;
      this.track = this.tracks[0];
      this.rateRaw = this.track.rate * 100;
      this.time = this.timeRaw = 0;
    },
    forward: function () {
      if (this.currentTrack >= this.tracks.length - 1 && !this.isLoop) { return; }
      this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
      this.track = this.tracks[this.currentTrack];
      this.rateRaw = this.track.rate * 100;
      this.time = this.timeRaw = 0;
      if (this.isPlaying) {
        this.playAt(this.time);
      }
    },
    backward: function () {
      if (this.time < 3 && this.currentTrack !== 0) {
        this.currentTrack--;
        this.track = this.tracks[this.currentTrack];
        this.rateRaw = this.track.rate * 100;
      }
      this.time = this.timeRaw = 0;
      if (this.isPlaying) {
        this.playAt(this.time);
      }
    },
    toggleLoop: function () {
      this.isLoop = !this.isLoop;
    },
    onDropList: function (files) {
      for (var i = 0; i < files.length; i++) {
        var song = Song.create(files[i]);
        if (song) {
          this.tracks.push({
            song: song,
            rate: 1.0
          });
        }
      }
    }
  }
});

Vue.component('player', Player);

module.exports = Player;
