'use strict';

var Vue = require('vue');

var Header = Vue.extend({
  template: require('./templates/Header.html'),
  attached: function () {
    // Set window title
    var logo = twemoji.parse('\uD83D\uDC96\uD83D\uDC95\uD83D\uDC97');
    logo = logo + '<div>L  O  L  I  P  O  P</div>' + logo;
    this.$$.logo.innerHTML = logo;
  },
  methods: {
    close: function () {
      this.$dispatch('close');
    },
    hide: function () {
      this.$dispatch('hide');
    }
  }
});

module.exports = Header;
