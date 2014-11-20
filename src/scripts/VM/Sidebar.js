'use strict';

var Vue = require('vue');

var Sidebar = Vue.extend({
  template: require('./templates/Sidebar.html'),
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
      }
    };
  },
  created: function () {
    var self = this;
    this.$watch('selectedPlaylists', function () {
      if (! self.playlists) { return; }
      self.isSelected = new Array(self.playlists.length);
      for (var i = 0; i < self.playlists.length; i++) {
        self.isSelected.$set(i, (self.selectedPlaylists.indexOf(i + "") !== -1));
      }
    });
    this.$watch('playlists', function () {
      this.selectedPlaylists = [];
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
    delete: function (e) {console.log('im delete');
      if (e.keyCode !== 8 && e.keyCode !== 46) { return; }
      this.playlists.removeAll(this.selectedPlaylists);
      this.selectedPlaylists = [];
    },
    deselectOthers: function (index) {
      this.selectedPlaylists = [index + ""];
    },
    click: function (e, index, isDraggableElement) {console.log(e);
      var now = new Date().getTime();
      if (now - this.lastClick.time < 1000 && this.lastClick.index === index) {
        this.play(index);
      }
      this.lastClick.time = now;
      this.lastClick.index = index;

      if (isDraggableElement) {
        this.deselectOthers(index);
      }
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
      console.log('yo');
      var rect = this.$$.real.getBoundingClientRect();
      var newPos = ((e.clientY - rect.top) / this.dragOpts.optionHeight) | 0;
      //this.$dispatch('movePlaylists', this.selectedPlaylists, newPos);
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

      if (newPos < this.playlists.length) {
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

Vue.component('sidebar', Sidebar);

module.exports = Sidebar;
