'use strict';

var Vue = require('vue');

var fs = require('fs');
console.log('fs');
console.log(fs.readFile);

var checker = document.createElement('audio');
var isLoadable = function (path) {
  if (fs.existsSync(path)) {
    return true;
    //if (checker.canPlayType)
  }
  return false;
};

var loadFile = function (file) {
  console.log('isLoadable(file.path)');
  console.log(isLoadable(file.path));
  console.log('hoge');
  console.log(isLoadable('hfdsosad'));
  return true;
};

var Player = new Vue({
  el: '#player',
  data: {
    over: false
  },
  methods: {
    onDrop: function (files) {
      for (var i = 0; i < files.length; i++) {
        loadFile(files[i]);
      }
    }
  }
});

module.exports = Player;
