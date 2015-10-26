import Vue from 'vue';

import template from './templates/LoliPlaylist.html';

const LoliPlaylist = Vue.extend({

  template,

  props : {
    playlist     : null,
    currentTrack : Number,
    isPlaying    : Boolean,
  },

  data : () => ({
    selected   : [],
    isSelected : [],
    lastClick : {
      time  : new Date().getTime(),
      index : 0,
    },
    isDragging    : false,
    isPlaceholder : [],
    dragOpts : {
      insertPos           : null,
      elementsAfterInsert : [],
    },
  }),

  computed : {
    size () {
      if (!this.playlist) { return 0; }
      return this.playlist.size();
    },
    tracks () {
      if (!this.playlist) { return []; }
      return this.playlist.tracks;
    },

    isTrackPlaying () {
      const result = [];
      for (let i = 0; i < this.playlist.size(); i++) {
        result.push(this.currentTrack === i && this.isPlaying);
      }
      console.log('>>>> isTrackPlaying');
      console.log(result);
      return result;
    },

    isTrackPaused () {
      const result = [];
      for (let i = 0; i < this.playlist.size(); i++) {
        result.push(this.currentTrack === i && !this.isPlaying);
      }
      console.log('>>>> isTrackPaused');
      console.log(result);
      return result;
    },

    isTrackKilled () {
      const result = [];
      for (let i = 0; i < this.playlist.size(); i++) {
        result.push(this.playlist.at(i).isUnavailable);
      }
      console.log('>>>> isTrackUn');
      console.log(result);
      return result;
    },

  },

  created () {

    this.$watch('selected', () => {
      if (!this.playlist) { return; }
      this.isSelected = new Array(this.playlist.size());
      for (let i = 0; i < this.playlist.size(); i++) {
        this.isSelected.$set(i, (this.selected.indexOf(i + '') !== -1));
      }
    });
    this.$watch('playlist', () => {
      this.selected = [];
    });
  },

  methods : {

    play (index) {
      this.$dispatch('doubleClick', index);
    },

    delete (e) {
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.playlist.removeAll(this.selected);

      // Play next track
      if (this.isSelected[this.currentTrack]) {
        let nextTrack = this.currentTrack;
        while (this.isSelected[nextTrack]) {
          nextTrack++;
        }
        let removed = 0;
        for (let i = 0; i < nextTrack; i++) {
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

    deselectOthers (index) {
      this.selected = [index + ""];
    },

    click (index, isDraggableElement) {
      if (isDraggableElement) {
        this.deselectOthers(index);
        this.$$.real.focus();
      }
    },

    onDragStart (e) {
      e.dataTransfer.setData('draggingTracksNumber', this.selected.length);
      this.dragOpts.optionHeight = this.$el.querySelector('option.option').getBoundingClientRect().height;
      this.isDragging = true;
      this.dragOpts.e = e;
      this.dragOpts.timer = setInterval(this.moveTracks.bind(this), 20);
    },

    onDragEnd () {
      this.isDragging = false;
      this.dragOpts.insertPos = null;
      clearInterval(this.dragOpts.timer);
      this.dragOpts.elementsAfterInsert.forEach((e) => {
        e.style.marginTop = '0px';
      });
    },

    onDragOver (e) {
      var items = e.dataTransfer.getData('draggingTracksNumber');
      this.dragOpts.e = e;
      this.dragOpts.items = items;
    },

    onDrop (e) {
      var rect = this.$$.real.getBoundingClientRect();
      var newPos = ((e.clientY - rect.top) / this.dragOpts.optionHeight) | 0;
      this.playlist.moveTracks(this.selected, newPos);
      this.selected = [];
    },

    moveTracks () {
      if (!this.dragOpts.e || !this.dragOpts.items) { return; }
      const opts   = this.dragOpts;
      const rect   = this.$$.real.getBoundingClientRect();
      const newPos = ((opts.e.clientY - rect.top) / opts.optionHeight) | 0;
      if (opts.insertPos === newPos) { return; }
      opts.insertPos = newPos;
      opts.elementsAfterInsert.forEach((e) => {
        e.style.marginTop = '0px';
      });

      if (newPos < this.playlist.size()) {
        const newElements = [];
        const playlistElements = this.$el.querySelectorAll('.LoliPlaylist');
        [].forEach.call(playlistElements, (e) => {
          var newE = e.querySelectorAll('.option')[opts.insertPos];
          newE.style.marginTop = (opts.optionHeight * opts.items) + 'px';
          newElements.push(newE);
        });
        opts.elementsAfterInsert = newElements;
      }
    },
  },

});

export default LoliPlaylist;
