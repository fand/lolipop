'use strict';

var Vue = require('vue');
var _ = require('lodash');

var LoliPlaylist = Vue.extend({
  template: require('./templates/LoliPlaylist.html'),
  data: function () {
    return {
      selected: [],
      isSelected: [],
      lastClick: new Date().getTime(),
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
    onDragStart:function (e) {
      e.dataTransfer.setData('draggingTracksNumber', this.selected.length);
      this.dragOpts.optionHeight = this.$el.querySelector('option.option').getBoundingClientRect().height;
      this.isDragging = true;
      this.dragOpts.e = e;
      this.dragOpts.timer = setInterval(this.moveTracks.bind(this), 20);
    },
    onDragOver: function (e) {
      var items = e.dataTransfer.getData('draggingTracksNumber');
      this.dragOpts.e = e;
      this.dragOpts.items = items;
    },
    onDrop: function (e) {
      this.isDragging = false;
      this.dragOpts.insertPos = null;
      clearInterval(this.dragOpts.timer);
      this.dragOpts.elementsAfterInsert.forEach(function (e) {
        e.style.marginTop = '0px';
      });
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
