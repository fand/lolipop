'use strict';

var Vue = require('vue');

var Editable = require('./Editable');

var Sidebar = Vue.extend({
  template: require('./templates/Sidebar.html'),
  props: {
    collection      : Object,
    currentPlaylist : Number,
  },
  components : {
    editable : Editable,
  },
  data: function () {
    return {
      selectedPlaylists: [],
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
      },
      isEditingName: false
    };
  },
  computed: {
    playlists: function () {
      return this.collection.playlists;
    }
  },
  created: function () {
    var self = this;
    this.$watch('selectedPlaylists', function () {
      if (! self.collection) { return; }
      self.isSelected = new Array(self.collection.length);
      for (var i = 0; i < self.collection.size(); i++) {
        self.isSelected.$set(i, (self.selectedPlaylists.indexOf(i + "") !== -1));
      }
    });
    this.$watch('collection', function () {
      this.selectedPlaylists = [];
    });

    this.$on('editedPlaylistName', function (index, value) {
      this.collection.at(index).name = value;
    });
  },
  methods: {
    addPlaylist: function () {
      this.$dispatch('addPlaylist');
    },
    playPlaylist: function (index) {
      this.$dispatch('playPlaylist', index);
    },
    play: function (index) {
      this.$dispatch('playPlaylist', index);
    },
    delete: function (e) {
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.$dispatch('removePlaylists', this.selectedPlaylists);
      this.selectedPlaylists = [];
    },
    deselectOthers: function (index) {
      this.selectedPlaylists = [index + ""];
    },
    click: function (e, index, isDraggableElement) {
      var now = new Date().getTime();
      if (this.lastClick.index === index) {
        if (now - this.lastClick.time < 500) {
          this.play(index);
        }
        else if (now - this.lastClick.time < 2000) {
          this.editName(index);
        }
      }
      this.lastClick.time = now;
      this.lastClick.index = index;

      if (isDraggableElement) {
        this.deselectOthers(index);
      }
    },
    editName: function (index) {
      this.$broadcast('editName', index);
    },
    onDragStart:function (e) {
      e.dataTransfer.setData('draggingPlaylistsNumber', this.selectedPlaylists.length);
      this.dragOpts.optionHeight = this.$el.querySelector('option.option').getBoundingClientRect().height;
      this.isDragging = true;
      this.dragOpts.e = e;
      this.dragOpts.timer = setInterval(this.movePlaylists.bind(this), 20);
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
      var items = e.dataTransfer.getData('draggingPlaylistsNumber');
      this.dragOpts.e = e;
      this.dragOpts.items = items;

      // this is needed for onDrop fires
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: function (e) {
      var rect = this.$$.real.getBoundingClientRect();
      var newPos = ((e.clientY - rect.top) / this.dragOpts.optionHeight) | 0;
      this.$dispatch('movePlaylists', this.selectedPlaylists, newPos);
      this.selectedPlaylists = [];
    },
    movePlaylists: function () {
      if (!this.dragOpts.e || !this.dragOpts.items) { return; }
      var opts = this.dragOpts;
      var rect = this.$$.real.getBoundingClientRect();
      var newPos = ((opts.e.clientY - rect.top) / opts.optionHeight) | 0;
      if (opts.insertPos === newPos) { return; }
      opts.insertPos = newPos;
      opts.elementsAfterInsert.forEach(function (e) {
        e.style.marginTop = '0px';
      });

      if (newPos < this.collection.size()) {
        var newElements = [];
        var playlistElements = this.$el.querySelectorAll('.SidebarPlaylist');
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

module.exports = Sidebar;
