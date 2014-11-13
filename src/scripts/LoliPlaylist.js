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
  created: function () {
    this.$watch('selected', function () {
      this.isSelected = new Array(this.songs.length);
      for (var i = 0; i < this.songs.length; i++) {
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
