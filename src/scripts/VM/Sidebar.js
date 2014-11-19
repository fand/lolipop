'use strict';

var Vue = require('vue');

var Sidebar = Vue.extend({
  template: require('./templates/Sidebar.html'),
  methods: {
    addPlaylist: function () {
      this.$dispatch('addPlaylist');
    },
    playPlaylist: function (index) {
      this.$dispatch('playPlaylist', index);
    }
  }
});

Vue.component('sidebar', Sidebar);

module.exports = Sidebar;
