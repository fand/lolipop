import Vue from 'vue';
import Editable from './Editable';

import template from './templates/Sidebar.html';

const Sidebar = Vue.extend({

  template,

  props: {
    collection      : Object,
    currentPlaylist : Number,
  },

  components : {
    editable : Editable,
  },

  data () {
    return {
      selectedPlaylists : [],
      isSelected        : [],
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
      isEditingName : false,
    };
  },

  computed : {
    playlists () {
      return this.collection.playlists;
    },
  },

  created () {
    this.$watch('selectedPlaylists', () => {
      if (! this.collection) { return; }
      this.isSelected = new Array(this.collection.length);
      for (let i = 0; i < this.collection.size(); i++) {
        this.isSelected.$set(i, (this.selectedPlaylists.indexOf(i + "") !== -1));
      }
    });
    this.$watch('collection', () => {
      this.selectedPlaylists = [];
    });

    this.$on('editedPlaylistName', (index, value) => {
      this.collection.at(index).name = value;
    });
  },

  methods : {

    addPlaylist () {
      this.$dispatch('addPlaylist');
    },

    playPlaylist (index) {
      this.$dispatch('playPlaylist', index);
    },

    play (index) {
      this.$dispatch('playPlaylist', index);
    },

    delete (e) {
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.$dispatch('removePlaylists', this.selectedPlaylists);
      this.selectedPlaylists = [];
    },

    deselectOthers (index) {
      this.selectedPlaylists = [index + ""];
    },

    click (e, index, isDraggableElement) {
      const now = new Date().getTime();
      if (this.lastClick.index === index) {
        if (now - this.lastClick.time < 500) {
          this.play(index);
        }
        else if (now - this.lastClick.time < 2000) {
          this.editName(index);
        }
      }
      this.lastClick.time  = now;
      this.lastClick.index = index;

      if (isDraggableElement) {
        this.deselectOthers(index);
      }
    },

    editName (index) {
      this.$broadcast('editName', index);
    },

    onDragStart (e) {
      e.dataTransfer.setData('draggingPlaylistsNumber', this.selectedPlaylists.length);
      this.dragOpts.optionHeight = this.$el.querySelector('option.option').getBoundingClientRect().height;
      this.isDragging = true;
      this.dragOpts.e = e;
      this.dragOpts.timer = setInterval(::this.movePlaylists, 20);
    },

    onDragEnd () {
      this.isDragging         = false;
      this.dragOpts.insertPos = null;

      clearInterval(this.dragOpts.timer);

      this.dragOpts.elementsAfterInsert.forEach((e) => {
        e.style.marginTop = '0px';
      });
    },

    onDragOver (e) {
      this.dragOpts.e     = e;
      this.dragOpts.items = e.dataTransfer.getData('draggingPlaylistsNumber');

      // this is needed for onDrop fires
      e.preventDefault();
      e.stopPropagation();
    },

    onDrop (e) {
      const rect   = this.$$.real.getBoundingClientRect();
      const newPos = ((e.clientY - rect.top) / this.dragOpts.optionHeight) | 0;
      this.$dispatch('movePlaylists', this.selectedPlaylists, newPos);
      this.selectedPlaylists = [];
    },

    movePlaylists () {
      if (!this.dragOpts.e || !this.dragOpts.items) { return; }

      const opts   = this.dragOpts;
      const rect   = this.$$.real.getBoundingClientRect();
      const newPos = ((opts.e.clientY - rect.top) / opts.optionHeight) | 0;

      if (opts.insertPos === newPos) { return; }

      opts.insertPos = newPos;
      opts.elementsAfterInsert.forEach((e) => {
        e.style.marginTop = '0px';
      });

      if (newPos < this.collection.size()) {
        const newElements = [];
        const playlistElements = this.$el.querySelectorAll('.SidebarPlaylist');
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

export default Sidebar;
