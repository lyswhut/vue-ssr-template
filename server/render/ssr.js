const path = require('path')
const fs = require('fs')
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')
const joinPath = p => path.join(__dirname, p)

const serverRender = require('./server-render')

const template = fs.readFileSync(joinPath('../server.template.pug'), 'utf-8')
const bundle = require('../../public/vue-ssr-server-bundle.json')
const clientManifest = require('../../public/vue-ssr-client-manifest.json')

const cache = new LRU({
  max: 1000,
  maxAge: 1000 * 60 * 15,
})

module.exports = async context => {
  const renderer = createBundleRenderer(bundle, {
    runInNewContext: false,
    inject: false,
    clientManifest,
    basedir: joinPath('../public'),
    cache,
  })
  const html = await serverRender(context, renderer, template)
  return html
}
