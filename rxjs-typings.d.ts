import {Observable} from 'rxjs';
import {Pathname, Location} from '@cycle/history/lib/interfaces';
import {RouteDefinitionsMap, RouteMatcherReturn} from './lib/interfaces';
export interface RouterSource {
    history$: Observable<Location>;
    path(pathname: Pathname): RouterSource;
    define(routes: RouteDefinitionsMap): Observable<RouteMatcherReturn>;
    createHref(path: Pathname): Pathname;
}