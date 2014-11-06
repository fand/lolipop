var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var reload = require('browser-sync').reload;
var config = require('../config').styles;

// Styles
gulp.task('styles', function () {
  return gulp.src(config.src)
    .pipe($.sass())
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest(config.dst))
    .pipe($.size());
});
