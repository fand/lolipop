'use strict';

var Vue = require('vue');

var Editable = Vue.extend({
  template: require('./templates/Editable.html'),
  props: ['model', 'index'],
  data: function () {
    return {
      isEditing: false
    };
  },
  created: function () {
    this.$on('editName', function (index) {
      if (this.index !== index) { return; }
      this.focus();
    });
  },
  methods: {
    focus: function () {
      this.isEditing = true;
      this.$$.input.focus();
    },
    blur: function () {
      this.$$.input.blur();
      this.isEditing = false;
      this.$dispatch('editedPlaylistName', this.index, this.model);
    },
    onKeyDown: function (e) {
      if (e.keyCode === 13 || e.keyCode === 27) {
        this.blur();
      }
    },
    onBlur: function () {
      this.blur();
    }
  }
});

Vue.component('editable', Editable);

module.exports = Editable;
