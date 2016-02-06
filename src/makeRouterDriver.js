import {createAPI} from './api'

/**
 * Factory function that returns the router driver
 * @public
 * @param {function} historyDriver - a valid history API driver
 * @return {routerDriver} - a router driver function composed
 * with the history driver
 */
function makeRouterDriver(historyDriver) {
  if (!historyDriver || typeof historyDriver !== 'function') {
    throw new Error('First argument to makeRouterDriver must be a valid ' +
      'history driver')
  }
  /**
   * The actual router driver.
   * @public
   * @method routerDriver
   * @param  {Observable<string|Object>} sink$ - This is the same input that the
   * history driver would expect.
   * @return {routerAPI}
   */
  return function routerDriver(sink$) {
    const history$ = historyDriver(sink$)
    return createAPI(history$, [], history$.createHref)
  }
}

export {makeRouterDriver}
