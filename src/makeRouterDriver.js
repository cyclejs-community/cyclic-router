import {createAPI} from './api'
import {makeHistoryDriver} from '@cycle/history'
import rxAdapter from '@cycle/rx-adapter'

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
  function routerDriver(sink$, runStreamAdapter) {
    const history$ = historyDriver(sink$)
    const adapt = stream => runStreamAdapter.adapt(stream, rxAdapter.streamSubscribe)
    return createAPI(history$.share(), [], history$.createHref, adapt)
  }
  routerDriver.streamAdapter = rxAdapter
  return routerDriver
}

export {makeRouterDriver}
