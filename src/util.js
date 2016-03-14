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

export {
  splitPath,
  filterPath,
  makeCreateHref,
}
