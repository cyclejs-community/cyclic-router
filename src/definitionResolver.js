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
function makeDefinitionResolver(history$, namespace, createHref) {
  /**
   * Function used to match the current route to a set of routes using
   * switch-path
   * @public
   * @typedef {define}
   * @name define
   * @method define
   * @param  {Object}   definitions Route definitions as expected by switch-path
   * @return {defineAPI}
   */
  return function define(definitions) {
    const matches$ = history$.map(
      ({pathname}) => {
        const filteredPath = `/${filterPath(splitPath(pathname), namespace)}`
        const {path, value} = getPathValue(filteredPath, definitions)
        return {path, value, pathname}
      }
    )

    const path$ = matches$.pluck('path').replay(1)
    const pathDisposable = path$.connect()

    const value$ = matches$.pluck('value').replay(1)
    const valueDisposable = value$.connect()

    const fullPath$ = matches$.pluck('pathname').replay(1)
    const fullPathDisposable = fullPath$.connect()

    const dispose = () => {
      pathDisposable.dispose()
      fullPathDisposable.dispose()
      valueDisposable.dispose()
    }
    /**
     * Propeties and methods returned from define()
     * @typedef {defineAPI}
     * @name defineAPI
     * @type {Object}
     * @prop {Observable<string>} path$ - an Observable of the path matched
     * by switch-path
     * @prop {Observable<any>} value$ - an Observable of the value matched
     * by switchPath
     * @prop {Observable<string>} fullPath$ - an Observable of the current
     * url entirely unfiltered
     * @prop {createHref} createHref - method used to define nested HREFs
     * @props {function} dispose() - method used to dispose of the history$
     */
    const defineAPI = {
      path$,
      value$,
      fullPath$,
      createHref: makeCreateHref(namespace, createHref),
      dispose,
    }
    return defineAPI
  }
}

export {makeDefinitionResolver}
