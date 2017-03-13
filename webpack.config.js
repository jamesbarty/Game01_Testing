var path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: ['babel-polyfill', './scripts/main.ts'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    loaders: [{
      test: /\.ts$/, loaders: ['babel-loader', 'ts-loader'], exclude: /node_modules/
    }]
  }
};
