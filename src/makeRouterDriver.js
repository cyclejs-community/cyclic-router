import {createAPI} from './api'
import {makeHistoryDriver} from '@cycle/history'

/**
 * Instantiates an new router driver function using the same arguments required
 * by @cycle/history.
 * @public
 * @method makeRouterDriver
 * @return {routerDriver} The router driver function
 */
function makeRouterDriver(...historyArgs) {
  const historyDriver = makeHistoryDriver(...historyArgs)
  /**
   * The actual router driver.
   * @public
   * @typedef {routerDriver}
   * @name routerDriver
   * @method routerDriver
   * @param  {Observable<string|Object>} sink$ - This is the same input that the
   * history driver would expect.
   * @return {routerAPI}
   */
  return function routerDriver(sink$) {
    const history$ = historyDriver(sink$)
    return createAPI(history$.share(), [], history$.createHref)
  }
}

export {makeRouterDriver}
