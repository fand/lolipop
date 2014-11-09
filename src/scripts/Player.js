'use strict';

var Vue = require('vue');
var Droppable = require('./Droppable');
var LoliPlaylist = require('./Playlist');

var fs = require('fs');
var mime = require('mime');

var checker = document.createElement('audio');
var isLoadable = function (path) {
  if (fs.existsSync(path)) {
    var type = mime.lookup(path);
    return !!(checker.canPlayType(type).replace('no', ''));
  }
  return false;
};

var loadFile = function (file) {
  console.log(isLoadable(file.path));
  return true;
};

var Player = new Vue({
  el: '#player',
  data: {
    songs: [],
    overControl: false,
    overList: false
  },
  methods: {
    play: function () {
      console.log('yo');
    },
    onDropList: function (files) {
      var self = this;
      for (var i = 0; i < files.length; i++) {
        if (isLoadable(files[i].path)) {
          var song = {
            name: files[i].name,
            path: files[i].path,
            rate: 1.0
          };
          self.songs.push(song);
          console.log(self.songs);
        }
      }
    }
  }
});

module.exports = Player;
