var path = require('path');
var BASE_DIR = __dirname + './../';
var BASE = function (p) {
  return path.join(BASE_DIR, p);
};

var SRC_DIR = BASE('src');
var DST_DIR = BASE('public');
var HTML = BASE('src/*.html');
var SCRIPTS = BASE('src/scripts/**/*');
var STYLES = BASE('src/styles/**/*');


module.exports = {
  bundle: {
    src: BASE('src/assets/**/*'),
    dst: DST_DIR
  },
  clean: {
    src: DST_DIR
  },
  html: {
    src: HTML,
    dst: DST_DIR
  },
  scripts: {
    entries: [BASE('src/scripts/app.js')],
    dst: DST_DIR
  },
  styles: {
    src: BASE('src/styles/main.scss'),
    dst: DST_DIR
  },
  watch: {
    src: {
      html: HTML,
      styles: STYLES,
      scripts: SCRIPTS
    },
    dst: DST_DIR
  },
  reload: {
    electron: BASE('/node_modules/.bin/electron'),
    inspector: BASE('/node_modules/.bin/node-inspector'),
    module: BASE('.').toString(),
    port: 5858
  }
};
