const webpack = require('webpack')

const clientConfig = require('./webpack.config.client')
const serverConfig = require('./webpack.config.server')

// Client compiler
console.log('building client assets...')
const clientCompiler = webpack(clientConfig)
clientCompiler.run((err, stats) => {
  if (err) console.log(err)
  stats = stats.toJson('minimal')
  // stats.errors.forEach(err => console.error(err))
  // stats.warnings.forEach(err => console.warn(err))
  if (stats.errors.length) return
  // console.log('client', stats)
  console.log('client assets is builded.')
})

// Server compiler
console.log('building server bundle...')
const serverCompiler = webpack(serverConfig)
serverCompiler.run((err, stats) => {
  if (err) console.log(err)
  stats = stats.toJson('minimal')
  // stats.errors.forEach(err => console.error(err))
  // stats.warnings.forEach(err => console.warn(err))
  if (stats.errors.length) return
  // console.log('server', stats)
  console.log('server bundle is builded.')
})
