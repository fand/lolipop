'use strict';

var gulp = require('gulp');
var config = require('../config').reload;

var atom;
var inspector;

var spawn = function (command, args) {
  var baby = require('child_process').spawn(command, args, {
    detached: true,
    stdio: [0, 1, 2]
  })
  baby.unref();
  return baby;
};

var kill = function (victim) {
  if (victim) {
    victim.kill('SIGKILL');
  }
}

gulp.task('reload', function (cb) {
  // kill(atom);
  // kill(inspector);
  //
  // var dbg = '--debug=' + config.port;
  // atom = spawn(config.electron, [dbg, config.module]);
  // inspector = spawn(config.inspector);
  //
  cb();
});

process.on('exit', function(code) {
  kill(atom);
  kill(inspector);
});
