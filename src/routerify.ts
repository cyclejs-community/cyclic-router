import xs from 'xstream';
import {adapt} from '@cycle/run/lib/adapt';
import {RouteMatcher} from './interfaces';
import {RouterSource} from './RouterSource';
import {Location, createPath} from 'history';
import {HistoryInput,  GenericInput} from '@cycle/history';
import {Stream} from 'xstream';

export declare type HistoryAction = HistoryInput | GenericInput | string;
export declare type RouterSink = Stream<HistoryAction>;

/**
 * Wraps main to provide an advanced interface over @cycle/history
 * @public
 * @method routerify
 * @return {main} The augmented main function
 */
function routerify(main: (a: any) => any, routeMatcher: RouteMatcher, basename = '/', historyName = 'history', routerName = 'router') {
    if (typeof main !== 'function') {
        throw new Error('First argument to routerify must be a valid cycle app');
    }
    const createHref = (location: Location) => basename + createPath(location);
    return function(sources: any): any {
        const routerSource = new RouterSource(sources[historyName], [], createHref, routeMatcher);
        const sinks = main({ ...sources, [routerName]: routerSource });
        return {
            ...sinks,
            [historyName]: adapt(xs.merge(
                sinks[historyName] ? xs.fromObservable(sinks[historyName]) : xs.never(),
                sinks[routerName] ? xs.fromObservable(sinks[routerName]) : xs.never()
            ))
        };
    };
}

export {routerify}
