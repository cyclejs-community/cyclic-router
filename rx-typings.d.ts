import {Observable} from 'rx';
import {Pathname, Location} from '@cycle/history';
import {RouteDefinitionsMap, RouteMatcherReturn} from './lib/interfaces';
export interface RouterSource {
    history$: Observable<Location>;
    path(pathname: Pathname): RouterSource;
    define(routes: RouteDefinitionsMap): Observable<RouteMatcherReturn>;
    createHref(path: Pathname): Pathname;
}