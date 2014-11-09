'use strict';

var Vue = require('vue');

var LoliPlaylist = Vue.extend({
  template: require('../templates/LoliPlaylist.html'),
  methods: {
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
