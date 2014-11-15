'use strict';

var Vue = require('vue');

var LoliPlaylist = Vue.extend({
  template: require('./templates/LoliPlaylist.html'),
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
    var self = this;
    this.$watch('selected', function () {
      if (! self.playlist) { return; }
      self.isSelected = new Array(self.playlist.size());
      for (var i = 0; i < this.playlist.size(); i++) {
        self.isSelected.$set(i, (self.selected.indexOf(i + "") !== -1));
      }
    });
  },
  methods: {
    play: function (index) {
      this.$dispatch('doubleClick', index);
    },
    delete: function (e) {
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.playlist.removeAll(this.selected);
      this.selected = [];
    }
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
