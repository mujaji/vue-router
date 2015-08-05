var routerUtil = require('./util')
var Recognizer = require('route-recognizer')
var HTML5History = require('./history/html5')
var HashHistory = require('./history/hash')
var installed = false

/**
 * Router constructor
 *
 * @param {Object} [options]
 *                 - {String} root
 *                 - {Boolean} hashbang  (default: true)
 *                 - {Boolean} pushstate (default: false)
 */

function Router (options) {
  if (!installed) {
    throw new Error(
      'Please install the Router with Vue.use() before ' +
      'creating an instance.'
    )
  }

  options = options || {}

  // Vue instances
  this.app = null
  this._children = []

  // route recognizer
  this._recognizer = new Recognizer()
  this._guardRecognizer = new Recognizer()

  // state
  this._started = false
  this._currentRoute = { path: '/' }

  // feature detection
  this._hasPushState = typeof history !== 'undefined' && history.pushState

  // global handler/hooks
  this._notFoundHandler = options.notFound || null
  this._beforeEachHook = options.beforeEach || null
  this._afterEachHook = options.afterEach || null

  // other options
  this._hashbang = options.hashbang !== false
  this._history = !!(this._hasPushState && options.history)
  this._saveScrollPosition = !!options.saveScrollPosition
  this._linkActiveClass = options.linkActiveClass || 'v-link-active'

  // create history object
  var self = this
  var History = this._history
    ? HTML5History
    : HashHistory
  this.history = new History({
    root: options.root,
    hashbang: this._hashbang,
    onChange: function (path, state, anchor) {
      self._match(path, state, anchor)
    }
  })
}

/**
 * Installation interface.
 * Install the necessary directives.
 */

Router.install = function (Vue) {
  if (installed) {
    routerUtil.warn('already installed.')
    return
  }
  require('./api')(Vue, Router)
  require('./internal')(Vue, Router)
  require('./directives/view')(Vue)
  require('./directives/link')(Vue)
  require('./override')(Vue, Router)
  installed = true
}

// auto install
if (window.Vue) {
  Router.install(window.Vue)
}

module.exports = Router
