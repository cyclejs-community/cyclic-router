import { adapt } from '@cycle/run/lib/adapt';
import { HistoryDriver, makeHistoryDriver, makeServerHistoryDriver } from '@cycle/history';
import { History, MemoryHistory } from '@types/history';
import { BrowserHistoryBuildOptions } from 'history';
import { RouteMatcher } from './interfaces';
import { RouterSource } from './RouterSource';

function isMemoryHistory(history: History): history is MemoryHistory {
  return (<MemoryHistory>history).index !== undefined;
}

/**
 * Instantiates an new router driver function using the same arguments required
 * by @cycle/history.
 * @public
 * @method makeRouterDriver
 * @return {routerDriver} The router driver function
 */
function makeRouterDriver(history: History, routeMatcher: RouteMatcher, options?: BrowserHistoryBuildOptions) {
  let historyDriver: HistoryDriver;

  if (isMemoryHistory(history)) {
    historyDriver = makeServerHistoryDriver(options);
  } else {
    historyDriver = makeHistoryDriver(options);
  }

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
  return function routerDriver(sink$: any) {
    const history$ = adapt(historyDriver(sink$));
    return new RouterSource(history$, [], history.createHref, routeMatcher);
  };
}

export { makeRouterDriver }
