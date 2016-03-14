import {createAPI} from './api'

/**
 * Creates a router instance from a history$. The history$ must have a
 * `.createHref` method attached to it
 * @method createRouter
 * @public
 * @param  {Observable<location>}     history$ An observable of the
 * current location object as defined by rackt/history
 * @return {routerAPI}
 */
function createRouter(history$) {
  return createAPI(history$, [], history$.createHref)
}

export {createRouter}
