import Vue from 'vue'
import { sync } from 'vuex-router-sync'


import createStore from './store'
import createRouter from './router'


import App from './App'


// Vue.prototype.$http = axios

export default () => {
  const router = createRouter()
  const store = createStore()

  sync(store, router)

  const app = new Vue({
    router,
    store,
    render: h => h(App),
  })

  return { app, router, store }
}
