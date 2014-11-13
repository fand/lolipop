'use strict';

var Vue = require('vue');

var Droppable = require('./Droppable');
var Header = require('./Header');
var Player = require('./Player');
var remote = require('remote');
var app = remote.require('app');

var main = new Vue({
  el: '#app',
  data: {
    currentView: 'player'
  },
  created: function () {
    this.$on('close', this.close);
    this.$on('hide', this.hide);
  },
  methods: {
    close: function () {
      app.quit();
    },
    hide: function () {
      remote.getCurrentWindow().minimize();
    }
  }
});
