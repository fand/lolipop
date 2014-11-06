'use strict;'

var Vue = require('vue');

var Dropper = new Vue({
  el: '#dropper',
  template: require('../templates/dropper.html'),
  methods: {
    onDrop: function () {
      console.log('yo');
    },
    onClick: function () {
      console.log('clicked!!!');
    }
  }
});

module.exports = Dropper;
