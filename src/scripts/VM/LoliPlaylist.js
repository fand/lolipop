'use strict';

var Vue = require('vue');
var _ = require('lodash');

var LoliPlaylist = Vue.extend({
  template: require('./templates/LoliPlaylist.html'),
  data: function () {
    return {
      selected: [],
      isSelected: [],
      lastClick: new Date().getTime()
    };
  },
  computed: {
    size: function () {
      return this.playlist.size();
    },
    tracks: function () {
      return this.playlist.tracks;
    }
  },
  created: function () {
    var self = this;
    this.$watch('selected', function () {
      if (! self.playlist) { return; }
      self.isSelected = new Array(self.playlist.size());
      for (var i = 0; i < this.playlist.size(); i++) {
        self.isSelected.$set(i, (self.selected.indexOf(i + "") !== -1));
      }
    });
    this.$watch('playlist', function () {
      this.selected = [];
    });
    console.log(this.isSelected);
  },
  methods: {
    play: function (index) {
      this.$dispatch('doubleClick', index);
    },
    delete: function (e) {
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.playlist.removeAll(this.selected);
      this.selected = [];
    },
    deselectOthers: function (index) {
      this.selected = [index + ""];
    },
    click: function (e, index, isDragger) {
      var lastClick = this.lastClick;
      this.lastClick = new Date().getTime();
      if (this.lastClick - lastClick < 1000) {
        this.play(index);
      }
      if (isDragger) {
        this.deselectOthers(index);
      }
    },
    onDragStart: function (e) {
      e.dataTransfer.setData('draggingTracksNumber', this.selected.length);
    },
    onDragOver: function (e) {
      console.log(e.dataTransfer.getData('draggingTracksNumber'));
    },
    onDrop: function (e) {

    }
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
