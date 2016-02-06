/**
 * Function that returns whether or not the current environment
 * supports the HistoryAPI
 * @public
 * @type {function}
 * @name supportsHistory()
 * @method supportsHistory()
 * @return {Boolean} Returns true if the current environment supports
 * the History API; false if it does not.
 */
function supportsHistory() {
  const ua = navigator.userAgent

  if ((ua.indexOf(`Android 2.`) !== -1 ||
      ua.indexOf(`Android 4.0`) !== -1) &&
      ua.indexOf(`Mobile Safari`) !== -1 &&
      ua.indexOf(`Chrome`) === -1 &&
      ua.indexOf(`Windows Phone`) === -1)
  {
    {return false }
  }

  if (typeof window !== `undefined`) {
    return window.history && `pushState` in window.history
  } else {
    return false
  }
}

/**
 * Splits a path into parts
 * @private
 * @method splitPath
 * @param  {string}  path the route in which to split
 * @return {Array<string>}       Array of the separate parts of the route
 */
function splitPath(path) {
  return path.split('/').filter(p => p.length > 0)
}

/**
 * Filters the parts of a path against a namespace
 * @private
 * @method filterPath
 * @param  {Array<String}   pathParts parts of the current route
 * @param  {Array<String>}   namespace each part of the paths to filter upon
 * as defined by `path()`
 * @return {Array<String>}             Array of the paths that pathParts
 * contains but is not contained by namespace
 */
function filterPath(pathParts, namespace) {
  return pathParts.filter(part => namespace.indexOf(part) < 0).join('/')
}

const startsWith = (param, value) => param[0] === value

const startsWith2 = (param, value1, value2) =>
  param[0] === value1 && param[1] === value2

/**
 * creates the public method createHref()
 * @private
 * @method makeCreateHref
 * @param  {Array<string>}       namespace  each part of the paths to filter
 * upon as defined by `path()`
 * @param  {function}       createHref method to create an href as expected
 * by the current history instance
 * @return {function}                  the public createHref() function
 */
function makeCreateHref(namespace, _createHref) {
  /**
   * Function used to create HREFs that are properly namespaced
   * @typedef {createHref}
   * @name createHref
   * @method createHref
   * @param  {string}   path the HREF that will be appended to the current
   * namespace
   * @return {string}        a fully qualified HREF composed from the current
   * namespace and the path provided
   */
  return function createHref(path) {
    const fullPath = `${namespace.join('/')}${path}`
    if (startsWith(fullPath, '/') || startsWith2(fullPath, '#', '/')) {
      return _createHref(fullPath)
    }
    return _createHref('/' + fullPath)
  }
}

/**
 * Default parameters for createLocation; Same structure used by rackt/history
 * @public
 * @typedef {location}
 * @name location
 * @type {Object}
 * @property {string} pathname  defaults to '/'
 * @property {string} action  defaults to 'POP'
 * @property {string} hash  defaults to ''
 * @property {string} search defaults to  ''
 * @property {Object|Null} state defautls to null
 * @property {string|Null} key defaults to null
 */
const locationDefaults = {
  pathname: '/',
  action: 'POP',
  hash: '',
  search: '',
  state: null,
  key: null,
}

/**
 * Create a location object - particularly useful for server-side rendering
 * @method createLocation
 * @param  {location} [location=locationDefaults]  A location as
 * defined by rackt/history with sane defaults
 * @return {location}                a complete location object as defined by
 * rackt/history
 */
function createLocation(location = locationDefaults) {
  if (typeof location === 'string') {
    return Object.assign(locationDefaults, {pathname: location})
  }
  return Object.assign(locationDefaults, location)
}

export {
  supportsHistory,
  splitPath,
  filterPath,
  makeCreateHref,
  createLocation,
}
