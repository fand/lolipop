'use strict';

var Vue = require('vue');
var Droppable = require('./Droppable');
var LoliPlaylist = require('./LoliPlaylist');
var Song = require('../models/Song');
var Playlist = require('../models/Playlist');
var Audio = require('../utils/Audio');

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
  template: require('./templates/Player.html'),
  data: function () {
    return {
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
    var self = this;

    this.$watch('rateRaw', function () {
      if (! self.track) { return; }
      var rate = self.rateRaw / 100.0;
      self.track.rate = rate;
      Audio.setRate(rate);
    });

    this.$watch('timeRaw', function () {
      if (! self.track) { return; }
      var newTime = (self.timeRaw / 10000.0) * self.track.song.duration;
      if (Math.abs(self.time - newTime) < (self.rateRaw / 100.0) * 2) { return; }
      self.time = newTime;
      if (self.isPlaying) {
        self.playAt(self.time);
      }
    });

    this.$watch('gainRaw', function () {
      Audio.setGain(self.gainRaw / 100.0);
    });

    this.$on('doubleClick', function (index) {
      self.isPlaying = true;
      self.setTrack(index);
    });

    this.$on('delete', function (nextTrack) {
      self.setTrack(nextTrack);
      if (self.playlist.size() == 0) {
        self.pause();
        self.track = null;
      }
    });

    Audio.onEnded(this.playNext.bind(this));
  },
  methods: {
    play: function (e) {
      if (this.track == null) {
        this.setTrack(this.currentTrack);
      }
      if (!this.isPlaying) {
        this.playAt(this.time);
      }
    },
    playAt: function (at) {
      if (!this.track) { return; }

      at = at || 0;
      at = Math.min(this.track.song.duration, at);
      this.pause();
      this.isPlaying = true;

      // Load if unloaded
      var self = this;
      Audio.play(this.track.song, at, this.track.rate, function () {
        self.time = at;
        self.timer = setInterval(function () {
          if (self.time > self.track.song.duration) { return; }
          self.time = self.time + self.rateRaw / 100.0;
          self.timeRaw = (self.time / self.track.song.duration) * 10000.0;
        }, 999);
      });
    },
    playNext: function () {
      if (this.currentTrack < this.playlist.size() - 1 || this.isLoop) {
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
      this.track.song.buffer = null;
      this.setTrack(0);
    },
    setTrack: function (index) {
      if (index < 0 || this.playlist.size() <= index) { return; }
      var gonnaPlay = this.isPlaying;
      this.pause();
      this.currentTrack = index;
      this.track = this.playlist.at(index);
      this.rateRaw = this.track.rate * 100;
      this.time = this.timeRaw = 0;
      Audio.setRate(this.track.rate);
      if (gonnaPlay) {
        this.playAt(0);
      }
    },
    forward: function () {
      if (this.currentTrack >= this.playlist.size() - 1 && !this.isLoop) { return; }
      this.setTrack((this.currentTrack + 1) % this.playlist.size());
    },
    backward: function () {
      if (this.time < 3 && this.currentTrack !== 0) {
        this.setTrack(this.currentTrack - 1);
      }
      this.time = this.timeRaw = 0;
    },
    toggleLoop: function () {
      this.isLoop = !this.isLoop;
    },
    onDropList: function (files) {
      for (var i = 0; i < files.length; i++) {
        var song = Song.create(files[i]);
        if (song) {
          this.playlist.push({
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
