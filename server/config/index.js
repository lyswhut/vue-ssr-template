const path = require('path')

module.exports = {
  development: {
    port: 3001,
    showErrorDetail: true,
    logDir: path.join(__dirname, '../../logs'),
    cache: {
      api: {
        maxItem: 50, // 最大缓存条数
        maxAge: 1000 * 10, // 过期时间，毫秒
      },
    },
  },
  production: {
    port: 3101,
    showErrorDetail: false,
    logDir: path.join('/home/www/public/mb_main/logs'),
    cache: {
      api: {
        maxItem: 50, // 最大缓存条数
        maxAge: 1000, // 过期时间，毫秒
      },
    },
  },
}
