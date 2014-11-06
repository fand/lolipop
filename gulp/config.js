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
    src: HTML,
    dst: DST_DIR
  },
  clean: {
    src: [BASE('public/styles'), BASE('public/scripts')]
  },
  html: {
    src: HTML,
    dst: DST_DIR
  },
  scripts: {
    entries: [BASE('src/scripts/app.js')],
    dst: BASE('public/scripts')
  },
  styles: {
    src: BASE('src/styles/main.scss'),
    dst: BASE('public/styles')
  },
  watch: {
    src: {
      html: HTML,
      styles: STYLES,
      scripts: SCRIPTS
    },
    // dst: BASE('public/**/*');
    dst: DST_DIR
  },
  webserver: {
    root: DST_DIR
  }
};
