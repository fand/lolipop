var gulp = require('gulp');
var browserSync = require('browser-sync');
var config = require('../config').webserver;

// Webserver
gulp.task('webserver', function () {
  browserSync({
    server: {
      baseDir: config.root
    }
  });
});
