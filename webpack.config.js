const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: 'bundle.min.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
