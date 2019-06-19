const path = require('path')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const vueLoaderConfig = require('./vue-loader.config')

const isDev = process.env.NODE_ENV === 'development'

// const publicPath = '/'
const publicPath = isDev ? '/' : '/public/'

module.exports = {
  mode: process.env.NODE_ENV,
  target: 'web',
  output: {
    path: isDev ? path.join(__dirname, '../') : path.join(__dirname, '../public'),
    publicPath,
  },
  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(vue|js)$/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-formatter-friendly'),
          },
        },
        exclude: /node_modules/,
        enforce: 'pre',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader',
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader',
        options: {
          publicPath,
          name: '[name].[ext]?[hash:8]',
        },
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              fallback: 'file-loader',
              outputPath: 'img/',
              name: '[name].[ext]?[hash:8]',
            },
          },
        ],
      },
    ],
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: false,
  },
  plugins: isDev ? [
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin(),
  ] : [
    new VueLoaderPlugin(),
  ],
}
