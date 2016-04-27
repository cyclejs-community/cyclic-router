import {createAPI} from './api'
import {makeHistoryDriver} from '@cycle/history'
import RxAdapter from '@cycle/rx-adapter'

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
  function routerDriver(sink$, runSA) {
    const history$ = historyDriver(sink$, runSA)
    const rxHistory$ = RxAdapter.adapt(history$, runSA.streamSubscribe)
    return createAPI(rxHistory$.share(), [], history$.createHref)
  }

  routerDriver.streamAdapter = RxAdapter
  return routerDriver
}

export {makeRouterDriver}
