module.exports = {
  upgrade: true,
  // target: 'newest',
  reject: [
    'webpack-dev-server',
    'webpack-cli',
    'webpack',
    'css-loader',
    'less',
    'less-loader',
    'mini-css-extract-plugin',
    'optimize-css-assets-webpack-plugin',
    'postcss-loader',
    'stylus',
    'stylus-loader',
    'terser-webpack-plugin',
  ]
}
