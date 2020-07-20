const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseConfig = require('./webpack.config.base')
const VueServerPlugin = require('vue-server-renderer/server-plugin')

const cssLoaderConfig = require('./css-loader.config')

const isDev = process.env.NODE_ENV === 'development'

function cssLoaderMerge(beforeLoader) {
  const loader = isDev ? [
    // 这里匹配 `<style module>`
    {
      resourceQuery: /module/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: cssLoaderConfig,
        },
        'postcss-loader',
      ],
    },
    // 这里匹配普通的 `<style>` 或 `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader',
        'postcss-loader',
      ],
    },
  ] : [
    // 这里匹配 `<style module>`
    {
      resourceQuery: /module/,
      use: [
        {
          loader: 'css-loader',
          options: cssLoaderConfig,
        },
        'postcss-loader',
      ],
    },
    // 这里匹配普通的 `<style>` 或 `<style scoped>`
    {
      use: [
        'css-loader',
        'postcss-loader',
      ],
    },
  ]
  if (beforeLoader) {
    loader[0].use.push(beforeLoader)
    loader[1].use.push(beforeLoader)
  }
  return loader
}

module.exports = merge(baseConfig, {
  target: 'node',
  devtool: false,
  entry: path.join(__dirname, '../client/entry-server.js'),
  output: {
    libraryTarget: 'commonjs2',
    filename: 'server-entry.js',
  },
  externals: [nodeExternals({ // in order to ignore all modules in node_modules folder
    allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
  })],
  resolve: {
    alias: {
      'create-api': './create-api-server.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        oneOf: cssLoaderMerge(),
      },
      {
        test: /\.less$/,
        oneOf: cssLoaderMerge('less-loader'),
      },
      {
        test: /\.stylus$/,
        oneOf: cssLoaderMerge('stylus-loader'),
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"',
    }),
    new VueServerPlugin(),
  ],
})
