const path = require('path')
const fs = require('fs')
const MemoryFS = require('memory-fs')
const webpack = require('webpack')
const chokidar = require('chokidar')
const koaWebpack = require('koa-webpack')

const clientConfig = require('./webpack.config.client')
const serverConfig = require('./webpack.config.server')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {
    console.log(e)
  }
}

module.exports = (app, templatePath, cb) => {
  let bundle, clientManifest, template
  const bundlePath = path.join(
    serverConfig.output.path,
    'vue-ssr-server-bundle.json'
  )

  const update = () => {
    if (bundle && clientManifest) {
      cb(bundle, clientManifest, template)
    }
  }
  const updateTemplate = (count = 0) => {
    let data = fs.readFileSync(templatePath, 'utf-8')
    if (data === '') {
      if (count > 20) return console.log('read template fail')
      return updateTemplate(++count)
    }
    template = data
    console.log('index.pug template updated.')
    update()
  }

  template = fs.readFileSync(templatePath, 'utf-8')
  chokidar.watch(templatePath).on('change', updateTemplate)

  // Client compiler
  clientConfig.entry = [clientConfig.entry]
  // clientConfig.output.filename = '[name].js'
  const clientCompiler = webpack(clientConfig)
  koaWebpack({
    compiler: clientCompiler,
    devMiddleware: {
      publicPath: clientConfig.output.publicPath,
      index: false,
      // stats: 'minimal',
      logLevel: 'silent',
    },
    hotClient: {
      logLevel: 'warn',
    },
  }).then((middleware) => {
    app.use(middleware)
    clientCompiler.plugin('done', stats => {
      stats = stats.toJson()
      // stats.errors.forEach(err => console.error(err))
      // stats.warnings.forEach(err => console.warn(err))
      if (stats.errors.length) return
      clientManifest = JSON.parse(readFile(
        middleware.devMiddleware.fileSystem,
        'vue-ssr-client-manifest.json'
      ))
      update()
      console.log('new manifest generated.')
    })
  })

  // Server compiler
  const serverCompiler = webpack(serverConfig)
  const mfs = new MemoryFS()
  serverCompiler.outputFileSystem = mfs

  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    // stats.errors.forEach(err => console.log(err))
    // stats.warnings.forEach(warn => console.log(warn))
    if (stats.errors.length) return

    // console.log(bundlePath)
    bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
    update()
    console.log('new bundle generated.')
  })
}
