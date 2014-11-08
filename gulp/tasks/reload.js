'use strict';

var gulp = require('gulp');
var config = require('../config').reload;
var spawn = require('child_process').spawn;

var atom;

gulp.task('reload', function (cb) {
  if (atom) {
    atom.kill();
  }
  atom = spawn(config.command, [config.module], {
    detached: true,
    stdio: [0, 1, 2]
  });
  atom.unref();
  cb();
});
