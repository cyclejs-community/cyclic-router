import {StreamAdapter} from '@cycle/base';
import {makeHistoryDriver} from '@cycle/history';
import {History, HistoryDriverOptions} from '@cycle/history/lib/interfaces';
import {RouteMatcher} from './interfaces';
import {RouterSource} from './RouterSource';

/**
 * Instantiates an new router driver function using the same arguments required
 * by @cycle/history.
 * @public
 * @method makeRouterDriver
 * @return {routerDriver} The router driver function
 */
function makeRouterDriver(history: History, routeMatcher: RouteMatcher, options?: HistoryDriverOptions) {
  const historyDriver = makeHistoryDriver(history, options);
  /**
   * The actual router driver.
   * @public
   * @typedef {routerDriver}
   * @name routerDriver
   * @method routerDriver
   * @param  {Stream<string|Location>} sink$ - This is the same input that the
   * history driver would expect.
   * @return {routerAPI}
   */
  return function routerDriver(sink$: any, runSA: StreamAdapter) {
    const history$ = runSA.remember(historyDriver(sink$, runSA));
    return new RouterSource(history$, [], history.createHref, runSA, routeMatcher);
  };
}

export {makeRouterDriver}
