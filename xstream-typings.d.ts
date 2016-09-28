import {Stream} from 'xstream';
import {Pathname} from '@cycle/history/lib/interfaces';
import {RouteDefinitionsMap, RouteMatcherReturn} from './lib/interfaces';
export interface RouterSource {
    history$: Stream<Location>;
    path(pathname: Pathname): RouterSource;
    define(routes: RouteDefinitionsMap): Stream<RouteMatcherReturn>;
    createHref(path: Pathname): Pathname;
}