import {Stream} from 'most';
import {Pathname, Location} from '@cycle/history';
import {RouteDefinitionsMap, RouteMatcherReturn} from './lib/interfaces';
export interface RouterSource {
    history$: Stream<Location>;
    path(pathname: Pathname): RouterSource;
    define(routes: RouteDefinitionsMap): Stream<RouteMatcherReturn>;
    createHref(path: Pathname): Pathname;
}