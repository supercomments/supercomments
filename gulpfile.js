// Lovingly stolen from https://gist.github.com/AndersNS/bc075cb76bbed77cce49

var gulp = require('gulp');
var browserify = require('browserify');
var source = require("vinyl-source-stream");
var babelify = require("babelify");
var watchify = require('watchify');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback')
var notify = require("gulp-notify");
 
var opts = {
  appJs: './app/index.js',
  appFolder: './dist',
  jsOutfile: 'superComments.js',
  jsOutFolder: './dist/js',
  globalScripts: [
    './node_modules/jquery/dist/j/jquery.min.js',
    './node_modules/jquery/dist/j/jquery.min.map',
  ]
};

gulp.task('copy-globals', function(){
  return gulp.src(opts.globalScripts).pipe(gulp.dest(opts.jsOutFolder));
})
 
// Save a reference to the `reload` method
var reload = browserSync.reload;
gulp.task('browserify', function(){
  var bundler = watchify(browserify({ entries: opts.appJs, debug: true }, watchify.args));
  bundler.transform(babelify);
  bundler.on('update', rebundle);
 
  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('error', swallowError)
      .pipe(source(opts.jsOutfile))
      .pipe(gulp.dest(opts.jsOutFolder))
      .pipe(reload({stream:true}))
      .pipe(notify("Browser reloaded after watchify update!"));;
  }
 
  return rebundle();
});
 
function swallowError(error) {
  //If you want details of the error in the console
  console.log(error.toString());
  this.emit('end');
}
 
gulp.task('browser-sync', function() {
  browserSync({
  server: {
    baseDir: opts.appFolder,
    middleware: [historyApiFallback]
  },
  startPath: 'html/reddit.html'
  });
});
 
gulp.task('default', ['copy-globals', 'browser-sync', 'browserify'], function() {
});