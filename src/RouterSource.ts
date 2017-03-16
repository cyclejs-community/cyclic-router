import {Location, Pathname} from '@cycle/history';
import {LocationDescriptorObject} from 'history';
import {RouteDefinitionsMap, RouteDefinitionsArray, RouteMatcher} from './interfaces';
import * as util from './util';
import {adapt} from '@cycle/run/lib/adapt';

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
  constructor(private _history$: any,
              private _namespace: Pathname[],
              private _createHref: (path: LocationDescriptorObject) => Pathname,
              private _routeMatcher: RouteMatcher) {}

  history$ = adapt(this._history$);

  path(pathname: Pathname): RouterSource {
    const scopedNamespace = this._namespace.concat(util.splitPath(pathname));
    const scopedHistory$ = this._history$
      .filter(({pathname: _path}: Location) => isStrictlyInScope(scopedNamespace, _path))
      .remember();

    const createHref = this._createHref;
    return new RouterSource(scopedHistory$, scopedNamespace, createHref, this._routeMatcher);
  }

  define(routes: RouteDefinitionsMap | RouteDefinitionsArray, routeMatcher?: RouteMatcher): any {
    const namespace = this._namespace;
    const _createHref = this._createHref;
    const createHref = util.makeCreateHref(namespace, _createHref);

    let match$ = this._history$
      .map((location: Location) => {
        const matcher = routeMatcher || this._routeMatcher;
        const filteredPath = getFilteredPath(namespace, location.pathname);
        const {path, value} = matcher(filteredPath, routes);
        return {path, value, location, createHref};
      })
      .remember();

    const out$ = adapt(match$);
    out$.createHref = createHref;
    return out$;
  }

  createHref(path: Pathname): Pathname {
    return util.makeCreateHref(this._namespace, this._createHref)(path);
  }
}
