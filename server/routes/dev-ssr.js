const router = require('koa-router')()

const serverInfo =
  `koa/${require('koa/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const handleError = (ctx, next, err) => {
  if (err.url) {
    ctx.redirect(err.url)
  } else if (err.code === 404) {
    // ctx.status = 404
    // ctx.body = '404 | Page Not Found'
    next()
  } else {
    // Render Error Page or Redirect
    ctx.status = 500
    ctx.body = '500 | Internal Server Error'
    console.error(`error during render : ${ctx.url}`)
    console.error(`error message: ${err.message}`)
  }
}

module.exports = app => {
  const handleSSR = require('../render/dev-ssr')(app)
  router.get('*', async(ctx, next) => {
    await next()
    if (ctx.body) return

    ctx.set('Server', serverInfo)

    let html
    try {
      html = await handleSSR({ url: ctx.request.url, csrf: ctx.csrf })
    } catch (err) {
      return handleError(ctx, next, err)
    }
    ctx.body = html
  })
  return router
}
