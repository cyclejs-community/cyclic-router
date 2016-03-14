import switchPath from 'switch-path'

import {splitPath, filterPath, makeCreateHref} from './util'

/**
 * Workaround for issues with switch-path finding the * parameter
 * @private
 * @method getPathValue
 * @param  {string}     pathname    the route to match against
 * @param  {Object}     definitions route definitions object as defined by
 * switch-path
 * @return {Object}                 an object containing the path matched
 * and the value associated with that route.
 */
function getPathValue(pathname, definitions) {
  let path
  let value
  try {
    const match = switchPath(pathname, definitions)
    value = match.value
    path = match.path
  } catch (e) {
    // try handling default route
    if (definitions['*']) {
      path = pathname
      value = definitions['*']
    } else {
      throw e
    }
  }
  return {path, value}
}

/**
 * Creates the method used publicly as .define()
 * @private
 * @method makeDefinitionResolver
 * @param  {Observable<location>}               history$   Observable
 * of the current location as defined by rackt/history
 * @param  {Array<String>}               namespace  An array which contains
 * all of the `.path()`s that have be created to this point
 * @param  {function}               createHref function used to create HREFs
 * as defined by the current history instance
 * @return {function}                          the public API function used
 * for `.define()`
 */
function makeDefinitionResolver(history$, namespace, _createHref) {
  /**
   * Function used to match the current route to a set of routes using
   * switch-path
   * @public
   * @typedef {define}
   * @name define
   * @method define
   * @param  {Object}   definitions Route definitions as expected by switch-path
   * @return {Observable<Object>} an observable containing the `path` and
   * `value` returned by switch-path. `location` as returned by @cycle/history
   * and a createHref method for creating nested HREFs
   */
  return function define(definitions) {
    const createHref = makeCreateHref(namespace, _createHref)
    const match$ = history$.map(location => {
      const {pathname} = location
      const filteredPath = `/${filterPath(splitPath(pathname), namespace)}`
      const {path, value} = getPathValue(filteredPath, definitions)
      return {path, value, location, createHref}
    }).replay(null, 1)

    const disposable = match$.connect()

    match$.createHref = createHref
    match$.dispose = () => disposable.dispose()
    return match$
  }
}

export {makeDefinitionResolver}
