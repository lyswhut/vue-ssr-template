import Vue from 'vue'

import createApp from './create-app'


// a global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to,
      }).then(() => {
        if (store.getters.errors) store.commit('set_errors', null)
        next()
      }).catch(err => {
        store.commit('set_errors', err)
        next()
      })
    } else {
      if (store.getters.errors) store.commit('set_errors', null)
      next()
    }
  },
})

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      if (store.getters.errors) store.commit('set_errors', null)
      return next()
    }

    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to }))).then(() => {
      if (store.getters.errors) store.commit('set_errors', null)
      next()
    }).catch(err => {
      store.commit('set_errors', err)
      next()
    })
  })

  app.$mount('#root')
})
