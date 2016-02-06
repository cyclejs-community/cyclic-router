import {createAPI} from './api'

/**
 * Creates a router instance from a history$
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
