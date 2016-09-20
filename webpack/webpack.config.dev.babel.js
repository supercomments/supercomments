import path from 'path';

export default {
  debug: true,
  target: 'web',
  devtool: 'sourcemap',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dev'),
    filename: 'supercomments.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$|\.js$/,
      loaders: ['babel-loader'],
      include: path.resolve(__dirname, '../src')
    }]
  },
  resolve: {
    extensions: ['', '.js']
  }
};
