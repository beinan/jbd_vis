'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var assign = require('lodash.assign');


var less = require('gulp-less');
var path = require('path');


var babelify = require('babelify');
// add custom browserify options here

gulp.task('client_js', function(){
  var customOpts = {
    entries: ['./client/app.js'],
    debug: true
  };
  var opts = assign({}, watchify.args, customOpts);
  var b = watchify(browserify(opts)); 
  b.transform(babelify);
  
  //define bundle function
  var bundle = function(){
    b.bundle()
    // log errors if they happen
    .on('error', function(err) {console.log(err.toString(),"\n",err.codeFrame);})
    .pipe(source('application.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    //.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    //.pipe(sourcemaps.write('./')) // writes .map file   
    .pipe(gulp.dest('./public/js'));
    console.log("Client side js is ready!");
  };

  b.on('update', bundle); // on any dep update, runs the bundler
  b.on('log', gutil.log); // output build logs to terminal
  
  bundle();  //do bundle
  
}); // so you can run `gulp client_js` to build the file


var spawn = require('child_process').spawn,
    node;
gulp.task("server", function(){
  if (node) 
    node.kill();
  node = spawn('node', ['--harmony', 'app.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task("default", ["less", "client_js","server"], function(){
  gulp.watch(['./app.js', './controllers/**/*.js', './models/**/*.js', './aggregation/**/*.js'], function() {
    gulp.run('server');
  });

});


gulp.task('less', function () {
  return gulp.src('./less/main.less')
    .pipe(less())
    .pipe(gulp.dest('./public/css'));
});
