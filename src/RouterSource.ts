import {Location, Pathname} from '@cycle/history/lib/interfaces';
import switchPath, {RouteDefinitions} from 'switch-path';

import * as util from './util';

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
              private _createHref: (path: Pathname) => Pathname) {}

  get history$() {
    return this._history$;
  }

  path(pathname: Pathname): RouterSource {
    const scopedNamespace = this._namespace.concat(util.splitPath(pathname));
    const scopedHistory$ = this._history$
      .filter(({pathname: _path}) => isStrictlyInScope(scopedNamespace, _path));

    return new RouterSource(scopedHistory$, scopedNamespace, this._createHref);
  }

  define(routes: RouteDefinitions): any {
    const namespace = this._namespace;
    const createHref = util.makeCreateHref(namespace, this._createHref);

    let match$ = this._history$
      .map((location: Location) => {
        const filteredPath = getFilteredPath(namespace, location.pathname);
        const {path, value} = switchPath(filteredPath, routes);
        return {path, value, location, createHref};
      });

    match$.createHref = createHref;
    return match$;
  }

  createHref(path: Pathname): Pathname {
    return util.makeCreateHref(this._namespace, this._createHref)(path);
  }
}
