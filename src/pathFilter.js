import {createAPI} from './api'
import {splitPath} from './util'

/**
 * filters a path based on the current namespace
 * @private
 * @method isStrictlyInScope
 * @param  {Array<string>}          namespace an array of nested path
 * @param  {string}          path      the current pathaname
 * @return {Boolean}                   whether or not the current route is
 *  within the current namespace
 */
function isStrictlyInScope(namespace, path) {
  const pathParts = splitPath(path)
  return namespace.every((v, i) => {
    return pathParts[i] === v
  })
}

/**
 * Creates the function used publicly as .path()
 * @private
 * @method makePathFilter
 * @param  {Observable<history.location>}               history$   Observable
 * of the current location as defined by rackt/history
 * @param  {Array<String>}               namespace  An array which contains
 * all of the `.path()`s that have be created to this point
 * @param  {function}               createHref function used to create HREFs
 * as defined by the current history instance
 * @return {function}                          the public API function used
 * for `.path()`
 */
function makePathFilter(history$, namespace, createHref) {
  /**
   * Filters the current location to easily create nested routes
   * @public
   * @typedef {path}
   * @name path
   * @method path
   * @param  {string} pathname the route at which to filter
   * @return {routerAPI}
   */
  return function path(pathname) {
    const scopedNamespace = namespace.concat(splitPath(pathname))
    const scopedHistory$ = history$.filter(
      ({pathname: _path}) => isStrictlyInScope(scopedNamespace, _path)
    )
    return createAPI(scopedHistory$, scopedNamespace, createHref)
  }
}

export {makePathFilter}
