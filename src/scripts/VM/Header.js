/* global twemoji */

import Vue from 'vue';

import template from './templates/Header.html';

const Header = Vue.extend({

  template,

  attached () {
    // Set window title
    const emoji = twemoji.parse('\uD83D\uDC96\uD83D\uDC95\uD83D\uDC97');
    this.$$.logo.innerHTML = `${emoji}<div>L  O  L  I  P  O  P</div>${emoji}`;
  },

  methods : {

    close () {
      this.$dispatch('close');
    },

    hide () {
      this.$dispatch('hide');
    },

  },

});

export default Header;
