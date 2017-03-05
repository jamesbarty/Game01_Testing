var path = require('path');

module.exports = {
  entry: ['babel-polyfill', './scripts/main.ts'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      
      { test: /\.tsx?$/, exclude: /node_modules/, use: "ts-loader" },
      { test: /\.js$/, exclude: /node_modules/, use: "babel-loader" },
    ]
  }
};