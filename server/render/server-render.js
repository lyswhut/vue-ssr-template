const pug = require('pug')

module.exports = async(context, renderer, template) => {
  try {
    const appString = await renderer.renderToString(context)

    const { title, meta } = context.meta.inject()

    const html = await pug.render(template, {
      appString,
      styles: context.renderStyles(),
      scripts: context.renderScripts(),
      title: title.text(),
      meta: meta.text(),
      initalState: context.renderState(),
    })
    return html
  } catch (err) {
    // console.log('render error', err)
    throw err
  }
}
