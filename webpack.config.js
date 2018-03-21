const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './js/main.js',
    dbhelper: './js/dbhelper.js',
    restaurant: './js/restaurant_info.js'
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, './dist')
  },
  plugins: [
    new webpack.ProgressPlugin({}),
    new HtmlWebpackPlugin({
      hash: true,
      template: './index.html',
      title: 'Restaurant Reviews',
      chunks: ['main', 'dbhelper'],
      filename: 'index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      hash: true,
      template: './restaurant.html',
      title: 'Restaurant Info',
      chunks: ['restaurant', 'dbhelper'],
      filename: 'restaurant.html',
      inject: false
    }),
    new CopyWebpackPlugin([
      { from: './data/', to: './dist/data/' }
    ])
  ],
  devtool: 'source-map'
};