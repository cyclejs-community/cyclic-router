import {makeHistoryDriver} from '@cycle/history';
import {RouteMatcher} from './interfaces';
import {RouterSource} from './RouterSource';
import {History} from 'history';
import {HistoryInput,  GenericInput} from '@cycle/history';
import {Stream} from 'xstream';

export declare type HistoryAction = HistoryInput | GenericInput | string;
export declare type RouterSink = Stream<HistoryAction>;

/**
 * Instantiates an new router driver function using the same arguments required
 * by @cycle/history.
 * @public
 * @method makeRouterDriver
 * @return {routerDriver} The router driver function
 */
function makeRouterDriver(history: History, routeMatcher: RouteMatcher) {
  if (!history) {
    throw new Error('Cyclic router must be given a history object');
  }
  const historyDriver = makeHistoryDriver(history);
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
  return function routerDriver(sink$: RouterSink) {
    const history$ = historyDriver(sink$).remember();
    return new RouterSource(history$, [], history.createHref, routeMatcher);
  };
}

export {makeRouterDriver}
