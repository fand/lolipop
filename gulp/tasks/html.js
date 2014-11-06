var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var config = require('../config').html;

// HTML
gulp.task('html', function () {
  return gulp.src(config.src)
    .pipe($.plumber())
    .pipe($.useref())
    .pipe(gulp.dest(config.dst))
    .pipe($.size());
});
