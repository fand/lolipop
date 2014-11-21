'use strict';

var Vue = require('vue');
var _ = require('lodash');

var LoliPlaylist = Vue.extend({
  template: require('./templates/LoliPlaylist.html'),
  data: function () {
    return {
      selected: [],
      isSelected: [],
      lastClick: {
        time: new Date().getTime(),
        index: 0
      },
      isDragging: false,
      isPlaceholder: [],
      dragOpts: {
        insertPos: null,
        elementsAfterInsert: []
      }
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
  },
  methods: {
    play: function (index) {
      this.$dispatch('doubleClick', index);
    },
    delete: function (e) {
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.playlist.removeAll(this.selected);

      // Play next track
      if (this.isSelected[this.currentTrack]) {
        var nextTrack = this.currentTrack;
        while (this.isSelected[nextTrack]) {
          nextTrack++;
        }
        var removed = 0;
        for (var i = 0; i < nextTrack; i++) {
          if (this.isSelected[i]) { removed++; }
        }
        nextTrack -= removed;
        if (nextTrack < 0 || this.playlist.size() <= nextTrack) {
          nextTrack = 0;
        }
        this.$dispatch('delete', nextTrack);
      }

      this.selected = [];
    },
    deselectOthers: function (index) {
      this.selected = [index + ""];
    },
    click: function (e, index, isDraggableElement) {
      var now = new Date().getTime();
      if (now - this.lastClick.time < 1000 && this.lastClick.index === index) {
        this.play(index);
      }
      this.lastClick.time = now;
      this.lastClick.index = index;

      if (isDraggableElement) {
        this.deselectOthers(index);
        this.$$.real.focus();
      }
    },
    onDragStart:function (e) {
      e.dataTransfer.setData('draggingTracksNumber', this.selected.length);
      this.dragOpts.optionHeight = this.$el.querySelector('option.option').getBoundingClientRect().height;
      this.isDragging = true;
      this.dragOpts.e = e;
      this.dragOpts.timer = setInterval(this.moveTracks.bind(this), 20);
    },
    onDragEnd: function (e) {
      this.isDragging = false;
      this.dragOpts.insertPos = null;
      clearInterval(this.dragOpts.timer);
      this.dragOpts.elementsAfterInsert.forEach(function (e) {
        e.style.marginTop = '0px';
      });
    },
    onDragOver: function (e) {
      var items = e.dataTransfer.getData('draggingTracksNumber');
      this.dragOpts.e = e;
      this.dragOpts.items = items;
    },
    onDrop: function (e) {
      var rect = this.$$.real.getBoundingClientRect();
      var newPos = ((e.clientY - rect.top) / this.dragOpts.optionHeight) | 0;
      this.playlist.moveTracks(this.selected, newPos);
      this.selected = [];
    },
    moveTracks: function () {
      if (!this.dragOpts.e || !this.dragOpts.items) { return; }
      var opts = this.dragOpts;
      var rect = this.$$.real.getBoundingClientRect();
      var newPos = ((opts.e.clientY - rect.top) / opts.optionHeight) | 0;
      if (opts.insertPos === newPos) { return; }
      opts.insertPos = newPos;
      opts.elementsAfterInsert.forEach(function (e) {
        e.style.marginTop = '0px';
      });

      if (newPos < this.playlist.size()) {
        var newElements = [];
        var playlistElements = this.$el.querySelectorAll('.LoliPlaylist');
        [].forEach.call(playlistElements, function (e) {
          var newE = e.querySelectorAll('.option')[opts.insertPos];
          newE.style.marginTop = (opts.optionHeight * opts.items) + 'px';
          newElements.push(newE);
        });
        opts.elementsAfterInsert = newElements;
      }
    }
  }
});

Vue.component('loli-playlist', LoliPlaylist);

module.exports = LoliPlaylist;
