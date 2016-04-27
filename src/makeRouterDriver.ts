import {StreamAdapter} from '@cycle/base';
import {makeHistoryDriver} from '@cycle/history';
import {Location, Pathname, History, HistoryDriverOptions} from '@cycle/history/lib/interfaces';
import XSAdapter from '@cycle/xstream-adapter';
import {Stream} from 'xstream';

import {RouterSource} from './RouterSource';

/**
 * Instantiates an new router driver function using the same arguments required
 * by @cycle/history.
 * @public
 * @method makeRouterDriver
 * @return {routerDriver} The router driver function
 */
function makeRouterDriver(history: History, options?: HistoryDriverOptions) {
  const historyDriver = makeHistoryDriver(history, options);
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
  function routerDriver(sink$: Stream<Location | Pathname>, runSA: StreamAdapter) {
    const history$ = historyDriver(sink$, XSAdapter);
    return new RouterSource(history$, [], history$.createHref, runSA);
  }

  (<any> routerDriver).streamAdapter = XSAdapter;
  return routerDriver;
}

export {makeRouterDriver}
