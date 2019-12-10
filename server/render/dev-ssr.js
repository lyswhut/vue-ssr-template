const path = require('path')
const { createBundleRenderer } = require('vue-server-renderer')

const serverRender = require('./server-render')

let bundle, clientManifest, template
const templatePath = path.join(__dirname, '../server.template.pug')

module.exports = app => {
  require('../../build-config/build-dev')(app, templatePath, (_bundle, _clientManifest, _template) => {
    bundle = _bundle
    clientManifest = _clientManifest
    template = _template
  })

  return async context => {
    if (!(bundle && clientManifest)) {
      return 'bundle 生成中...'
    }

    const renderer = createBundleRenderer(bundle, {
      runInNewContext: false,
      inject: false,
      clientManifest,
    })

    const html = await serverRender(context, renderer, template)
    return html
  }
}
