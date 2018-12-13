import { Location, Pathname } from '@cycle/history';
import { LocationDescriptorObject } from 'history';
import {
    RouteDefinitionsMap,
    RouteDefinitionsArray,
    RouteMatcher
} from './interfaces';
import * as util from './util';
import { adapt } from '@cycle/run/lib/adapt';

function isStrictlyInScope(namespace: Pathname[], path: Pathname): boolean {
    const pathParts = util.splitPath(path);
    return namespace.every((v, i) => {
        return pathParts[i] === v;
    });
}

function getFilteredPath(namespace: Pathname[], path: Pathname): Pathname {
    const pathParts = util.splitPath(path);
    return '/' + util.filterPath(pathParts, namespace);
}

export class RouterSource {
    constructor(
        private _history$: any,
        private _namespace: Pathname[],
        private _createHref: (path: LocationDescriptorObject) => Pathname,
        private _routeMatcher: RouteMatcher,
        private _name: string
    ) {}

    history$ = adapt(this._history$);

    path(pathname: Pathname): RouterSource {
        const scopedNamespace = this._namespace.concat(
            util.splitPath(pathname)
        );
        const scopedHistory$ = this._history$
            .filter(({ pathname: _path }: Location) =>
                isStrictlyInScope(scopedNamespace, _path)
            )
            .remember();

        const createHref = this._createHref;
        return new RouterSource(
            scopedHistory$,
            scopedNamespace,
            createHref,
            this._routeMatcher,
            this._name
        );
    }

    private _define(
        routes: RouteDefinitionsMap | RouteDefinitionsArray,
        routeMatcher?: RouteMatcher
    ): any {
        const namespace = this._namespace;
        const _createHref = this._createHref;
        const createHref = util.makeCreateHref(namespace, _createHref);

        return this._history$
            .map((location: Location) => {
                const matcher = routeMatcher || this._routeMatcher;
                const filteredPath = getFilteredPath(
                    namespace,
                    location.pathname
                );
                const { path, value } = matcher(filteredPath, routes);
                return { path, value, location, createHref };
            })
            .filter(({ path }: any) => path !== undefined && path !== null)
            .remember();
    }

    define(
        routes: RouteDefinitionsMap | RouteDefinitionsArray,
        routeMatcher?: RouteMatcher
    ): any {
        const _createHref = this._createHref;
        const createHref = util.makeCreateHref(this._namespace, _createHref);

        const out$ = adapt(this._define(routes, routeMatcher));
        out$.createHref = createHref;
        return out$;
    }

    routedComponent(
        routes: RouteDefinitionsMap | RouteDefinitionsArray,
        routeMatcher?: RouteMatcher
    ): (sources: any) => any {
        const name = this._name;
        return sources => {
            const match$ = this._define(routes, routeMatcher);
            const page$ = match$.map(({ path, value }: any) => {
                return value({
                    ...sources,
                    [name]: sources[name].path(path)
                });
            });
            return adapt(page$);
        };
    }

    createHref(path: Pathname): Pathname {
        return util.makeCreateHref(this._namespace, this._createHref)(path);
    }
}
