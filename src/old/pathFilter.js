import {createAPI} from './api'
import {splitPath} from './util'

function isStrictlyInScope(namespace, path) {
  const pathParts = splitPath(path)
  return namespace.every((v, i) => {
    return pathParts[i] === v
  })
}

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
