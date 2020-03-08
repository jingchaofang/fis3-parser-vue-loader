const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')
const scopedPlugin = require('./stylePlugins/scoped')
// LRU算法缓存机制，高速缓存对象，用于删除最近最少使用的项目
const LRU = require("lru-cache")
cache = new LRU(100)

/**
 * Add attribute selector to css
 *
 * @param {String} id
 * @param {String} css
 * @param {Boolean} scoped
 * @param {Object} options
 * @return {Promise}
 */

module.exports = function (id, css, scoped, options, cbk) {
  var key = id + '!!' + scoped + '!!' + css
  var val = cache.get(key)
  if (val) {
    cbk(null, val)
  } else {
    var plugins = []
    var postCSSOptions = {}

    if (scoped && plugins.indexOf(scopedPlugin) === -1) {
      plugins.push(scopedPlugin(id))
    }

    if (!scoped && plugins.indexOf(scopedPlugin) !== -1) {
      plugins.splice(plugins.indexOf(scopedPlugin), 1)
    }

    let result = postcss(plugins).process(css, postCSSOptions)

    cache.set(key, result.css)

    return result.css
  }
}

