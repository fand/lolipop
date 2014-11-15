'use strict';

var Vue = require('vue');

var LoliPlaylist = Vue.extend({
  template: require('../templates/LoliPlaylist.html'),
  data: function () {
    return {
      selected: [],
      isSelected: []
    };
  },
  computed: {
    size: function () {
      return this.playlist.size();
    },
    tracks: function () {
      return this.playlist.tracks;
    }
  },
  created: function () {
    this.$watch('selected', function () {
      if (! this.playlist) { return; }
      this.isSelected = new Array(this.playlist.size());
      for (var i = 0; i < this.playlist.size(); i++) {
        this.isSelected.$set(i, (this.selected.indexOf(i + "") !== -1));
      }
    }.bind(this));
  },
  methods: {
    play: function (index) {
      this.$dispatch('doubleClick', index);
    }
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
