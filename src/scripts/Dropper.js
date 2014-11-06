'use strict;'

var Vue = require('vue');

var cancelEvent = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

var Dropper = new Vue({
  el: '#dropper',
  template: require('../templates/Dropper.html'),
  data: {
    over: false
  },
  methods: {
    onDragOver: function (e) {
      cancelEvent(e);
      this.$data.over = true;
    },
    onDragLeave: function (e) {
      cancelEvent(e);
      this.$data.over = false;
    },
    onDrop: function (e) {
      cancelEvent(e);
      this.$data.over = false;
    }
  }
});

module.exports = Dropper;
