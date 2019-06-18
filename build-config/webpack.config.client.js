const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const baseConfig = require('./webpack.config.base')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const cssLoaderConfig = require('./css-loader.config')

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

function cssLoaderMerge(beforeLoader) {
  const loader = isDev ? [
    // 这里匹配 `<style module>`
    {
      resourceQuery: /module/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: Object.assign({
            sourceMap: true,
          }, cssLoaderConfig),
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    },
    // 这里匹配普通的 `<style>` 或 `<style scoped>`
    {
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    },
  ] : [
    // 这里匹配 `<style module>`
    {
      resourceQuery: /module/,
      use: [
        MiniCssExtractPlugin.loader,
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
        MiniCssExtractPlugin.loader,
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
        test: /\.css$/,
        oneOf: cssLoaderMerge(),
      },
      {
        test: /\.less$/,
        oneOf: cssLoaderMerge({
          loader: 'less-loader',
          options: {
            sourceMap: true,
          },
        }),
      },
      {
        test: /\.stylus$/,
        oneOf: cssLoaderMerge({
          loader: 'stylus-loader',
          options: {
            sourceMap: true,
          },
        }),
      },
    ],
  },
})
module.exports = isDev ? merge(config, {
  output: {
    filename: 'bundle.[hash:8].js',
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: defaultPlugins,
}) : merge(config, {
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
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: false, // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      cacheGroups: {
        // chunks: 'all',
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all',
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
