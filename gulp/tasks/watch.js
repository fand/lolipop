var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var reload = require('browser-sync').reload;
var config = require('../config').watch;

// Watch
gulp.task('watch', ['html', 'bundle', 'webserver'], function () {
  // Watch .html files
  gulp.watch(config.src.html, ['html', reload]);

  // Watch .scss files
  gulp.watch(config.src.styles, ['styles', reload]);

  // Watch .js or .coffee files
  gulp.watch(config.src.scripts, ['scripts', reload]);
});
