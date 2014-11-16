'use strict';

var Vue = require('vue');

var Sidebar = Vue.extend({
  template: require('./templates/Sidebar.html'),
  data: function () {
    return {
      playlists: []
    };
  },
  created: function () {

  },
  methods: {
  }
});

Vue.component('sidebar', Sidebar);

module.exports = Sidebar;
