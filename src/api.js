import {makePathFilter} from './pathFilter'
import {makeDefinitionResolver} from './definitionResolver'
import {makeCreateHref} from './util'

/**
 * Creates the public API returned by the base router driver
 * as well as the API which is returned by `.path()`
 * @private
 * @method createAPI
 * @param  {Observable<history.location>}  history$   Observable of the current
 * location as defined by rackt/history
 * @param  {Array<String>}  namespace  An array which contains all of the
 * `.path()`s that have be created to this point
 * @param  {function}  createHref This is the method to create a HREF as defined
 * by the history object that is passed to the history driver
 * @return {routerAPI}
 */
function createAPI(history$, namespace, createHref) {
  const replayedHistory$ = history$.replay(null, 1)
  const disposable = replayedHistory$.connect()

  /**
   * The Public API returned by the router driver, createRouter(), and .path()
   * @typedef {routerAPI}
   * @name routerAPI
   * @type {Object}
   * @prop {path} path - used for filtering routes to a given path
   * @prop {define} define - used for defining a set of routes to values via
   * switch-path
   * @prop {Observable<location>} observable - a way to get access to the
   * current history$ from the historyDriver
   * @prop {createHref} createHref - a method for create HREFs that are properly
   * prefixed for the current namespace
   * @prop {function} dispose - a method to dispose of the history$ returned
   * by [.observable](#API)
   */
  return {
    path: makePathFilter(replayedHistory$, namespace, createHref),
    define: makeDefinitionResolver(replayedHistory$, namespace, createHref),
    observable: replayedHistory$,
    createHref: makeCreateHref(namespace, createHref),
    dispose: () => disposable.dispose(),
  }
}

export {createAPI}
