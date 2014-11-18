'use strict';

var Vue = require('vue');

var Sidebar = Vue.extend({
  template: require('./templates/Sidebar.html'),
  methods: {
    saveCurrent: function () {
      this.$dispatch('saveCurrent');
    }
  }
});

Vue.component('sidebar', Sidebar);

module.exports = Sidebar;
