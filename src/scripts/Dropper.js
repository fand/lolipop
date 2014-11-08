'use strict';

var Vue = require('vue');

var cancelEvent = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

var Droppable = Vue.directive('droppable', function (callback) {
  var self = this;
  this.el.addEventListener('dragover', function (e) {
    cancelEvent(e);
    self.vm.$data.over = true;
  });
  this.el.addEventListener('dragleave', function (e) {
    cancelEvent(e);
    self.vm.$data.over = false;
  });
  this.el.addEventListener('drop', function (e) {
    cancelEvent(e);
    self.vm.$data.over = false;
    if (callback) {
      callback(e.dataTransfer.files);
    }
  });
});

module.exports = Droppable;
