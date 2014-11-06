var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var config = require('../config').bundle;

// Bundle
gulp.task('bundle', ['styles', 'scripts'], function(){
  var assets = $.useref.assets();
  return gulp.src(config.src)
    .pipe($.plumber())
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(config.dst));
});
