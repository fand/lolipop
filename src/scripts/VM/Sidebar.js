'use strict';

var Vue = require('vue');

var Playlist = require('../models/Playlist');

var Sidebar = Vue.extend({
  template: require('./templates/Sidebar.html'),
  data: function () {
    return {
      playlists: []
    };
  },
  created: function () {
    var self = this;
    Playlist.getRecent().then(function (docs) {
      var l = docs.rows.map(function (d) {
        return d.doc;
      });
      console.log(l);
      self.playlists = l;
    });
  },
  methods: {
  }
});

Vue.component('sidebar', Sidebar);

module.exports = Sidebar;
