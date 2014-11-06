'use strict';

var gulp = require('gulp');
var requireDir = require('require-directory');
requireDir(module, './gulp/tasks');

// Build
gulp.task('build', ['html', 'bundle']);

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
