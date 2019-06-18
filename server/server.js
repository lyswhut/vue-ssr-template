const fs = require('fs')
const Koa = require('koa')
const onerror = require('koa-onerror')
const send = require('koa-send')
const bodyparser = require('koa-bodyparser')
const compress = require('koa-compress')
const path = require('path')
const log4js = require('log4js')
const staticCache = require('koa-static-cache')
const zlib = require('zlib')
const LRU = require('lru-cache')

const isDev = process.env.NODE_ENV !== 'production'
const isProdTest = process.env.RUN_MODE === 'test'

const config = global.server_config = require('./config')
config.envConfig = global.server_config.envConfig = isDev || isProdTest ? config.development : config.production
// process.traceDeprecation = true
const app = new Koa()

// --------------------- log init ---------------------
if (!fs.existsSync(config.envConfig.logDir)) {
  try {
    fs.mkdirSync(config.envConfig.logDir, { recursive: true })
  } catch (e) {
    if (e.code !== 'EEXIST') {
      console.error('Could not set up log directory, error was: ', e)
      process.exit(1)
    }
  }
}

// Initialise log4js
log4js.configure(require('./config/log4js')(isDev))
const log_app = log4js.getLogger('app')
const log_startup = log4js.getLogger('startup')
const log_http = log4js.getLogger('http')
log_startup.info(`----- Server is starting in '${(isDev && 'development') || (isProdTest && 'test') || 'production'}' mode... -----`)

// ---------------------- Error handling ----------------------
onerror(app)

app.use(async(ctx, next) => {
  try {
    // console.log(ctx.query)
    // console.log(ctx.request.body)
    // console.log(ctx.status)
    await next()
    if (ctx.status === 404) {
      ctx.status = 404
      ctx.body = { code: 404, msg: '404 - Not Found' }
      // await ctx.render('error', {
      //   message: '404 - Not Found'
      // })
    }
  } catch (err) {
    ctx.status = err.status || 500
    if (err.message === 'Invalid CSRF token') {
      ctx.body = { code: 403, msg: err.message }
      return
    }

    ctx.body = config.showErrorDetail ? { code: 500, msg: '500 - Server Error', error: err.message } : { code: 500, msg: '500 - Server Error' }
    // await ctx.render('error', { message: '500 - Server Error' })
    ctx.app.emit('error', err, ctx)
  }
})

app.on('error', (err, ctx) => {
  log_app.error('server error', err, ctx)
})

process.on('uncaughtException', function(err) {
  console.error('An uncaught error occurred!')
  console.error(err)
})
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise ', p)
  console.error(' reason: ', reason)
})


// ---------------------- middlewares ----------------------
// logger
app.use(async(ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  log_http.trace(`${ctx.method} - ${ctx.status} - ${ctx.host} - ${ctx.url} - ${ctx.headers['x-real-ip'] ? ctx.headers['x-real-ip'] : ctx.ip.replace(/::ffff:/, '')} - ${ms}ms\n${ctx.headers['user-agent']}\n${ctx.headers.referer || 'No Referer'}\n`)
})

app.use(async(ctx, next) => {
  if (ctx.path === '/favicon.ico') {
    await send(ctx, '/favicon.ico', { root: __dirname })
  } else {
    await next()
  }
})

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text'],
}))

// gzip压缩
app.use(compress({
  filter(content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: zlib.Z_SYNC_FLUSH,
}))


// static file Cache
const excludeFile = [
  '/public/vue-ssr-client-manifest.json',
  '/public/vue-ssr-server-bundle.json',
]
const prefix = '/public/'
app.use(async(ctx, next) => {
  if (!excludeFile.includes(ctx.path)) return next()
  ctx.status = 404
})
const files = new LRU({ max: 1000 })
app.use(staticCache({
  dir: path.join(__dirname, '../public'),
  prefix,
  dynamic: true,
  files: files,
  filter: fileName => !excludeFile.includes(prefix + fileName),
  gzip: true,
  maxAge: 365 * 24 * 60 * 60,
}))

require('./routes')(app)

// ---------------------- listening port ----------------------
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || (isDev || isProdTest ? config.development.port : config.production.port)

app.listen(PORT, HOST, () => {
  log_startup.info(`server is listening on ${HOST}:${PORT}`)
})
