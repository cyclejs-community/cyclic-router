import xs from 'xstream';
import { adapt } from '@cycle/run/lib/adapt';
import { RouteMatcher } from './interfaces';
import { RouterSource } from './RouterSource';
import { Location, createPath } from 'history';
import { HistoryInput, GenericInput } from '@cycle/history';
import { Stream } from 'xstream';

export declare type HistoryAction = HistoryInput | GenericInput | string;
export declare type RouterSink = Stream<HistoryAction>;

export interface RouterOptions {
    basename?: string;
    historyName?: string;
    routerName?: string;
    omitHistory?: boolean;
}

/**
 * Wraps main to provide an advanced interface over @cycle/history
 * @public
 * @method routerify
 * @return {main} The augmented main function
 */
function routerify(
    main: (a: any) => any,
    routeMatcher: RouteMatcher,
    options?: RouterOptions
) {
    if (typeof main !== 'function') {
        throw new Error(
            'First argument to routerify must be a valid cycle app'
        );
    }
    const opts: RouterOptions = {
        basename: '/',
        historyName: 'history',
        routerName: 'router',
        omitHistory: true,
        ...options
    };
    const createHref = (location: Location) =>
        opts.basename + createPath(location);

    return function(sources: any): any {
        const routerSource = new RouterSource(
            xs.fromObservable(sources[opts.historyName]).remember(),
            [],
            createHref,
            routeMatcher
        );
        let srcs = sources;
        if (opts.omitHistory) {
            delete srcs[opts.historyName];
        }
        const sinks = main({
            ...srcs,
            [opts.routerName]: routerSource
        });
        return {
            ...sinks,
            [opts.historyName]: adapt(
                xs.merge(
                    sinks[opts.historyName] && !opts.omitHistory
                        ? xs.fromObservable(sinks[opts.historyName])
                        : xs.never(),
                    sinks[opts.routerName]
                        ? xs.fromObservable(sinks[opts.routerName])
                        : xs.never()
                )
            )
        };
    };
}

export { routerify };
