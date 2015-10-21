var gulp       = require('gulp');
var browserify = require('browserify');
var source     = require('vinyl-source-stream');
var gutil      = require('gulp-util');
var config     = require('../config').scripts;
var babelify   = require('babelify');

// Scripts
gulp.task('scripts', function () {
  var bundler = browserify({
    entries: config.entries,
    debug: true,
    detectGlobals: false,
    ignoreMissing: true,
    builtins: []
  });

  bundler.transform(babelify.configure({
    stage : 0,
  }));
  bundler.transform('partialify');

  return bundler.bundle()
    .on('error', gutil.log.bind(gutil))
    .pipe(source('app.js'))
    .pipe(gulp.dest(config.dst));
});
