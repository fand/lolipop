import Vue from 'vue';

import Playlist           from '../models/Playlist';
import PlaylistCollection from '../models/PlaylistCollection';
import Sidebar            from './Sidebar';
import Player             from './Player';

import template from './templates/PlaylistLoader.html';

const PlaylistLoader = Vue.extend({

  template,

  components : {
    sidebar : Sidebar,
    player  : Player,
  },

  data : () => ({
    currentPlaylist : 0,
    collection      : new PlaylistCollection(),
  }),

  computed : {

    playlists () {
      return this.collection.playlists;
    },

    length () {
      return this.collection.playlists.length;
    },

  },

  created () {
    PlaylistCollection.load('lolipop')
      .then((c) => {
        this.collection = c;
      })
      .then(() => {
        if (this.collection.size() === 0) {
          return this.addPlaylist();
        }
        return true;
      })
      .then(() => {
        this.currentPlaylist = 0;
      });

    this.$on('addPlaylist',     this.addPlaylist.bind(this));
    this.$on('removePlaylists', this.removePlaylists.bind(this));
    this.$on('playPlaylist',    this.playPlaylist.bind(this));
    this.$on('movePlaylists',   this.movePlaylists.bind(this));
  },

  methods : {

    addPlaylist () {
      var count   = this.collection.size();
      var newlist = new Playlist({ name : `playlist ${count}` });

      return newlist.save().then(() => {
        this.collection.push(newlist);
        return newlist;
      });
    },

    playPlaylist (index) {
      this.collection.at(this.currentPlaylist)
        .save()
        .then(() => {
          this.currentPlaylist = index;
        });
    },

    movePlaylists (operands, pos) {
      this.collection.movePlaylists(operands, pos);
    },

    removePlaylists (indexes) {
      this.collection.removeAll(indexes);
    },

    close () {
      return this.collection.saveAll()
        .catch((err) => console.error(err));
    },

  },

});

export default PlaylistLoader;
