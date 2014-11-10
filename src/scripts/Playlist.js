'use strict';

var Vue = require('vue');

var LoliPlaylist = Vue.extend({
  template: require('../templates/LoliPlaylist.html'),
  methods: {
    select: function (index) {

    },
    play: function (index) {
      this.$dispatch('doubleClick', index);
    }
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
