var gulp = require('gulp');
var browserSync = require('browser-sync');
var webpack = require('gulp-webpack');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var mustache = require('gulp-mustache');

var configApp = {
  devtool: 'source-map',
  output: {
    filename: 'supercomments.js',
    sourceMapFilename: '../js/supercomments.js.map'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /disqus-thread.js$/, loader: 'babel-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  watch: true
};

var configEmbed = {
  output: {
    filename: 'supercomments-embed.js'
  },
  watch: true,
  module: {
    loaders: [
      { test: /\.html$/, loader: "html-loader" }
    ]
  }
};

gulp.task('webpack-app', function() {
  return gulp.src('./app/index.js')
    .pipe(webpack(configApp))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('compress-app', function() {
  return gulp.src('dist/js/supercomments.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('webpack-embed', function() {
  return gulp.src('./embed.js.mustache')
    .pipe(mustache({
      suffix: ''
    }))
    .pipe(rename('embed.js'))
    .pipe(gulp.dest('.'))
    .pipe(webpack(configEmbed))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('compress-embed', function() {
  return gulp.src('./embed.js.mustache')
    .pipe(mustache({
      suffix: '.min'
    }))
    .pipe(rename('embed.js'))
    .pipe(gulp.dest('.'))
    .pipe(webpack(configEmbed))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('browser-sync', function() {
  browserSync({
  server: {
    baseDir: './dist'
  },
  startPath: 'html/example.html'
  });
});
 
gulp.task('default', [ 'browser-sync', 'webpack-app', 'webpack-embed' ], function() {
});

gulp.task('compress', [ 'compress-app', 'compress-embed' ], function() {
});