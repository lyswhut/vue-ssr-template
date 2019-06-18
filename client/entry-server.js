import createApp from './create-app'

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()

    const { url } = context
    const { fullPath } = router.resolve(url).route

    if (fullPath !== url) {
      return reject({ url: fullPath })
    }
    router.push(url)

    router.onError((to, from, next) => {
      console.log('======================onError')
    })
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) return reject({ code: 404, msg: 'not component matched' })
      Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
        route: router.currentRoute,
        store,
      }))).then(() => {
        context.meta = app.$meta()
        context.state = store.state
        resolve(app)
      }).catch(err => {
        store.state.errors = err
        context.meta = app.$meta()
        context.state = store.state
        resolve(app)
      })
    }, err => {
      console.log('======onReady==error====' + err.message)
      reject()
    })
  })
}
