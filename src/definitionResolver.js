import switchPath from 'switch-path'

import {splitPath, filterPath, makeCreateHref} from './util'

function makeDefinitionResolver(history$, namespace, _createHref, adapt) {
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
      const {path, value} = switchPath(filteredPath, definitions)
      return {path, value, location, createHref}
    }).replay(null, 1)

    const disposable = match$.connect()

    match$.createHref = createHref
    match$.dispose = () => disposable.dispose()
    return adapt(match$)
  }
}

export {makeDefinitionResolver}
