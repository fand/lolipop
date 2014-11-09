var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var config = require('../config').bundle;

// Bundle
gulp.task('bundle', ['styles', 'scripts'], function(){
  return gulp.src(config.src)
    .pipe($.plumber())
    .pipe(gulp.dest(config.dst));
});
