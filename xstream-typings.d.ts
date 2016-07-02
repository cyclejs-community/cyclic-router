import {Stream} from 'xstream';
import {Pathname} from '@cycle/history/lib/interfaces';
import {RouteDefinitions, SwitchPathReturn} from './lib/interfaces';
export interface RouterSource {
    history$: Stream<Location>;
    path(pathname: Pathname): RouterSource;
    define(routes: RouteDefinitions): Stream<SwitchPathReturn>;
    createHref(path: Pathname): Pathname;
}