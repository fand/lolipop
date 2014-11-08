var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var config = require('../config').watch;

// Watch
gulp.task('watch', ['html', 'bundle', 'reload'], function () {
  gulp.watch(config.src.html, ['html', 'reload']);
  gulp.watch(config.src.styles, ['styles', 'reload']);
  gulp.watch(config.src.scripts, ['scripts', 'reload']);
});
