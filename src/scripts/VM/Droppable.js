import Vue from 'vue';

const cancelEvent = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const Droppable = Vue.directive('droppable', {

  data : {
    first    : true,
    vm       : null,
    callback : null,
    over     : 'over',
  },

  bind (value) {
    this.data[this.arg] = value;
    this.data.vm = this.vm;

    if (this.data.first) {
      this.data.first = false;

      this.el.addEventListener('dragover', (e) => {
        cancelEvent(e);
        this.data.vm.$data[this.data.over] = true;
      });

      this.el.addEventListener('dragleave', (e) => {
        cancelEvent(e);
        this.data.vm.$data[this.data.over] = false;
      });

      this.el.addEventListener('drop', (e) => {
        cancelEvent(e);
        this.data.vm.$data[this.data.over] = false;
        if (this.data.callback) {
          this.data.callback(e.dataTransfer.files);
        }
      });
    }
  },

  update (value) {
    this.data[this.arg] = value;
  },

});

export default Droppable;
