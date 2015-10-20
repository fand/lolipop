import Vue from 'vue';

Vue.config.debug = true; // turn on debugging mode

// Directives
import Droppable from './VM/Droppable';

// Components
import Header         from './VM/Header';
import PlaylistLoader from './VM/PlaylistLoader';

import remote from 'remote';
const app = remote.require('app');

const main = new Vue({

  el : '#app',

  components : {
    loliHeader     : Header,
    playlistLoader : PlaylistLoader,
  },

  data : {
    currentView : 'player',
  },

  created () {
    this.$on('close', this.close);
    this.$on('hide', this.hide);
  },

  ready () {
    // Prevent breaking app on miss drop
    this.$el.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    this.$el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  },

  methods : {
    close () {
      this.$.loader.close()
        .then(() => {
          console.log('QUIT!');
          app.quit();
        });
    },

    hide () {
      remote.getCurrentWindow().minimize();
    },
  },

});
