const isDev = process.env.NODE_ENV === 'development'
// const staticRouter = require('./static')

module.exports = app => {
  // 载入静态路由
  // app.use(staticRouter.routes()).use(staticRouter.allowedMethods())

  const pageRouter = isDev ? require('./dev-ssr')(app) : require('./ssr')
  // 载入ssr路由
  app.use(pageRouter.routes()).use(pageRouter.allowedMethods())
}
