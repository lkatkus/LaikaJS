const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: 'bundle.min.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
