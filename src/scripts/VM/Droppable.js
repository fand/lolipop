'use strict';

var Vue = require('vue');

var cancelEvent = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

var Droppable = Vue.directive('droppable', {
  data: {
    first    : true,
    vm       : null,
    callback : null,
    over     : 'over'
  },
  bind: function (value) {
    this.data[this.arg] = value;
    this.data.vm = this.vm;
    if (this.data.first) {
      this.data.first = false;
      var self = this;
      this.el.addEventListener('dragover', function (e) {
        cancelEvent(e);
        self.data.vm.$data[self.data.over] = true;
      });
      this.el.addEventListener('dragleave', function (e) {
        cancelEvent(e);
        self.data.vm.$data[self.data.over] = false;
      });
      this.el.addEventListener('drop', function (e) {
        cancelEvent(e);
        self.data.vm.$data[self.data.over] = false;
        if (self.data.callback) {
          self.data.callback(e.dataTransfer.files);
        }
      });
    }
  },
  update: function (value) {
    this.data[this.arg] = value;
  }
});


module.exports = Droppable;
