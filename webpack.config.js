const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    main: './js/main.js',
    dbhelper: './js/dbhelper.js',
    restaurant: './js/restaurant_info.js',
    sw: './js/sw.js',
    idb: './node_modules/idb/lib/idb.js'
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, './dist')
  },
  plugins: [
    new webpack.ProgressPlugin({}),
    new HtmlWebpackPlugin({
      hash: false,
      template: './index.html',
      title: 'Restaurant Reviews',
      chunksSortMode: 'manual',
      chunks: [ 'idb', 'dbhelper', 'main', 'sw'],
      filename: 'index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      hash: false,
      template: './restaurant.html',
      title: 'Restaurant Info',
      chunksSortMode: 'none',
      chunks: ['idb', 'dbhelper', 'restaurant', 'sw'],
      filename: 'restaurant.html',
      inject: false
    }),
    new CopyWebpackPlugin([
      { from: './data/', to: './data/' },
      { from: './images/', to: './img/'}
    ]),
    new ExtractTextWebpackPlugin("style.css"),
    new ExtractTextWebpackPlugin("custom.css")
  ],
  module: {
    rules: [
      {
        test: /\.css/,
        use: ExtractTextWebpackPlugin.extract({
          use: "css-loader",
          fallback: "style-loader"
        })
      }
    ]
  },
  devtool: 'source-map'
};