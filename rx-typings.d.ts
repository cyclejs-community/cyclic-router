import {Observable} from 'rx';
import {Pathname, Location} from '@cycle/history/lib/interfaces';
import {RouteDefinitions, SwitchPathReturn} from './lib/interfaces';
export interface RouterSource {
    history$: Observable<Location>;
    path(pathname: Pathname): RouterSource;
    define(routes: RouteDefinitions): Observable<SwitchPathReturn>;
    createHref(path: Pathname): Pathname;
}