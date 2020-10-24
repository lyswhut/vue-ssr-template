const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseConfig = require('./webpack.config.base')
const VueServerPlugin = require('vue-server-renderer/server-plugin')

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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"',
    }),
    new VueServerPlugin(),
  ],
})
