import Vue from 'vue';
import template from './templates/Editable.html';

const Editable = Vue.extend({
  template,

  props : {
    model : String,
    index : Number,
  },

  data : () => ({
    isEditing : false,
  }),

  created () {
    this.$on('editName', (index) => {
      if (this.index !== index) { return; }
      this.focus();
    });
  },

  methods : {

    focus () {
      this.isEditing = true;
      this.$$.input.focus();
    },

    blur () {
      this.$$.input.blur();
      this.isEditing = false;
      this.$dispatch('editedPlaylistName', this.index, this.model);
    },

    onKeyDown (e) {
      if (e.keyCode === 13 || e.keyCode === 27) {
        this.blur();
      }
    },

    onBlur () {
      this.blur();
    },

  },
});

export default Editable;
