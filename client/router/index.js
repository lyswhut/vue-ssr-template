import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'

import paths from './paths'


function route(path, view, name, meta) {
  return {
    name: name || view,
    path,
    meta,
    component: (resovle) => import(`../views/${view}.vue`).then(resovle),
  }
}

Vue.use(Meta)
Vue.use(Router)

export default () => new Router({
  mode: 'history',
  routes: paths.map(path => route(path.path, path.view, path.name, path.meta)).concat([
    { path: '*', redirect: '/home' },
  ]),
  linkActiveClass: 'active-link',
  linkExactActiveClass: 'exact-active-link',
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
        } else {
          const position = {}
          // new navigation.
          // scroll to anchor by returning the selector
          if (to.hash) {
            position.selector = to.hash
          }
          // check if any matched route config has meta that requires scrolling to top
          if (to.matched.some(m => m.meta.scrollToTop)) {
          // cords will be used if no selector is provided,
          // or if the selector didn't match any element.
            position.x = 0
            position.y = 0
          }
          // if the returned position is falsy or an empty object,
          // will retain current scroll position.
          resolve(position)
        }
      }, 500)
    })
  },
})
