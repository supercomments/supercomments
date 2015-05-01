// Lovingly stolen from https://gist.github.com/AndersNS/bc075cb76bbed77cce49

var gulp = require('gulp');
var browserSync = require('browser-sync');
var webpack = require('gulp-webpack');

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

gulp.task('webpack-embed', function() {
  return gulp.src('./embed.js')
    .pipe(webpack(configEmbed))
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
 
gulp.task('default', ['browser-sync', 'webpack-app', 'webpack-embed'], function() {
});