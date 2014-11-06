var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var config = require('../config').scripts;

// Scripts
gulp.task('scripts', function () {
  var bundler = browserify({
    entries: config.entries,
    extensions: ['.coffee'],
    debug: true,
    insertGlobals: true
  });

  bundler.transform('partialify');

  return bundler.bundle()
    .on('error', gutil.log.bind(gutil))
    .pipe(source('app.js'))
    .pipe(gulp.dest(config.dst));
});
