const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const baseConfig = require('./webpack.config.base')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProdTest = process.env.RUN_MODE === 'test'

const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: isDev ? '"development"' : '"production"',
      RUN_MODE: isProdTest ? '"test"' : '"production"',
    },
  }),
  new VueSSRClientPlugin(),
]

const config = merge(baseConfig, {
  target: 'web',
  entry: path.join(__dirname, '../client/entry-client.js'),
  resolve: {
    alias: {
      'create-api': './create-api-client.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(vue|js)$/,
        loader: 'eslint-loader',
        options: {
          formatter: require('eslint-formatter-friendly'),
        },
        exclude: /node_modules/,
        enforce: 'pre',
      },
    ],
  },
})
module.exports = isDev
  ? merge(config, {
    devtool: 'cheap-source-map',
    output: {
      filename: 'bundle.[hash:8].js',
    },
    plugins: defaultPlugins,
  })
  : merge(config, {
    output: {
      filename: '[name].[chunkhash:8].js',
    },
    devtool: false,
    plugins: defaultPlugins.concat([
      new MiniCssExtractPlugin({
        filename: '[name].[contentHash:8].css',
        chunkFilename: '[id].[contentHash:8].css',
      }),
      new webpack.NamedChunksPlugin(),
    ]),
    optimization: {
      minimizer: [
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin({}),
      ],
      splitChunks: {
        cacheGroups: {
        // chunks: 'all',
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            enforce: true,
            chunks: 'initial',
          },
          // styles: {
          //   name: 'styles',
          //   test: /\.css$/,
          //   chunks: 'all',
          //   enforce: true
          // }
          styles: {
            name: 'styles',
            test: /\.(css|less)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
      runtimeChunk: true,
    },
    performance: {
      hints: 'warning',
    },
  })
