'use strict';

var Vue = require('vue');

var Player = new Vue({
  el: '#player',
  data: {
    over: false
  },
  methods: {
    onDrop: function (files) {
     console.log(files);
    }
  }
});

module.exports = Player;
