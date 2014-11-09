'use strict';

var Vue = require('vue');
var fs = require('fs');
var mime = require('mime');

var checker = document.createElement('audio');
var isLoadable = function (path) {
  if (fs.existsSync(path)) {
    var type = mime.lookup(path);
    return !!(checker.canPlayType.replace('no', ''));
  }
  return false;
};

var loadFile = function (file) {
  console.log(isLoadable(file.path));
  return true;
};

var LoliPlaylist = Vue.extend({
  template: require('../templates/LoliPlaylist.html'),
  data: function () {
    return {
      over: false,
      songs: []
    };
  },
  methods: {
    onDrop: function (files) {
      var self = this;
      for (var i = 0; i < files.length; i++) {
        if (isLoadable(files[i].path)) {
          var song = {
            name: files[i].name,
            path: files[i].path,
            rate: 1.0
          };
          self.$data.songs.push(song);
        }
      }
    }
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
