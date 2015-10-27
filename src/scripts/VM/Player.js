import Vue from 'vue';
import LoliPlaylist from './LoliPlaylist';
import Song  from '../models/Song';
import Audio from '../utils/Audio';
import template from './templates/Player.html';

Vue.filter('rate', (value) => {
  let s = value + '';
  if (s.length === 1) {
    s += '.00';
  }
  return (s + '000').slice(0, 4);
});

Vue.filter('time', (value) => {
  if (value !== null) {
    const min = ('00' + ((value / 60) | 0)).slice(-2);
    const sec = ('00' + ((value % 60) | 0)).slice(-2);
    return `${min}:${sec}`;n
  }
  return ' - ';
});

const Player = Vue.extend({

  template,

  props : ['playlist'],

  components : {
    loliPlaylist: LoliPlaylist,

  },

  data : () => ({
    track        : null,
    currentTrack : 0,
    isPlaying    : false,
    isLoop       : false,
    rateRaw      : 100,
    gainRaw      : 100,
    timeRaw      : 0,
    time         : 0,
    overControl  : false,
    overList     : false,
    killedTracks : {},
  }),

  computed : {
    duration () {
      if (!this.track) { return null; }
      return this.track.song.duration;
    },
  },

  created () {
    this.$watch('rateRaw', () => {
      if (!this.track) { return; }

      const rate = this.rateRaw / 100.0;

      this.track.rate = rate;
      Audio.setRate(rate);
    });

    this.$watch('timeRaw', () => {
      if (!this.track) { return; }

      var newTime = (this.timeRaw / 10000.0) * this.track.song.duration;

      if (Math.abs(this.time - newTime) < (this.rateRaw / 100.0) * 2) { return; }

      this.time = newTime;

      if (this.isPlaying) {
        this.playAt(this.time);
      }
    });

    this.$watch('gainRaw', () => {
      Audio.setGain(this.gainRaw / 100.0);
    });

    this.$on('doubleClick', (index) => {
      this.isPlaying = true;
      this.setTrack(index);
    });

    this.$on('delete', (nextTrack) => {
      this.setTrack(nextTrack);
      if (this.playlist.size() === 0) {
        this.pause();
        this.track = null;
      }
    });

    Audio.onEnded(this.playNext.bind(this));
  },

  methods : {

    play () {
      if (this.track == null) {
        this.setTrack(this.currentTrack);
      }
      if (!this.isPlaying) {
        this.playAt(this.time);
      }
    },

    playAt (_at) {
      if (!this.track) { return; }

      const at = Math.min(this.track.song.duration, _at || 0);
      this.pause();
      this.isPlaying = true;

      // Load if unloaded
      Audio.play(this.track.song, at, this.track.rate)
        .then(() => {
          this.time = at;

          this.timer = setInterval(() => {
            if (this.time > this.track.song.duration) { return; }

            this.time = this.time + this.rateRaw / 100.0;
            this.timeRaw = (this.time / this.track.song.duration) * 10000.0;
          }, 999);
        })
        .catch((e) => {
          this.killedTracks = {
            ...this.killedTracks,
            [this.track.song.path] : true,
          };
          this.playNext();
        });
    },

    playNext () {
      const hasNext = this.currentTrack < this.playlist.size() - 1;
      if (hasNext || this.isLoop) {
        this.forward();
      }
      else {
        this.stop();
      }
    },

    pause () {
      clearInterval(this.timer);
      Audio.pause();
      this.isPlaying = false;
    },

    stop () {
      this.track.song.buffer = null;
      this.setTrack(0);
    },

    setTrack (index) {
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

    forward () {
      if (this.currentTrack >= this.playlist.size() - 1 && !this.isLoop) { return; }
      this.setTrack((this.currentTrack + 1) % this.playlist.size());
    },

    backward () {
      if (this.time < 3 && this.currentTrack !== 0) {
        this.setTrack(this.currentTrack - 1);
      }
      else {
        this.setTrack(this.currentTrack);
      }
    },

    toggleLoop () {
      this.isLoop = !this.isLoop;
    },

    onDropList (files) {
      for (let i = 0; i < files.length; i++) {
        var song = Song.create(files[i]);
        if (song) {
          this.playlist.push({
            song,
            rate : 1.0,
          });
        }
      }
    },

  },

});

export default Player;
