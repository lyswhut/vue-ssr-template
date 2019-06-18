const LRU = require('lru-cache')
const router = require('koa-router')()
const handleSSR = require('../render/ssr')
const serverInfo =
  `koa/${require('koa/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const handleError = (ctx, next, err) => {
  if (err.url) {
    ctx.redirect(err.url)
  } else if (err.code === 404) {
    ctx.status = 404
    ctx.body = '404 | Page Not Found'
  } else {
    // Render Error Page or Redirect
    ctx.status = 500
    ctx.body = '500 | Internal Server Error'
    console.error(`error during render : ${ctx.url}`)
    console.error(`error message: ${err.message}`)
  }
}

const microCache = new LRU({
  max: 1000,
  maxAge: 1000 * 60 * 15, // 重要提示：条目在 1 秒后过期。
})

const isCacheable = ctx => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定(non-user-specific)页面才会缓存
  return false
}

router.get('*', async(ctx, next) => {
  ctx.set('Server', serverInfo)

  if (global.mb_siteInfo.time && (Date.now() - global.mb_siteInfo.time > 10000)) {
    await global.mb_fn.loadSiteInfo()
  }

  const cacheable = isCacheable(ctx)
  if (cacheable) {
    const hit = microCache.get(ctx.path)
    if (hit) {
      return ctx.body = hit
    }
  }

  let html
  try {
    html = await handleSSR({ url: ctx.request.url })
  } catch (err) {
    return handleError(ctx, next, err)
  }
  if (cacheable) {
    microCache.set(ctx.path, html)
  }
  ctx.body = html
})

module.exports = router
