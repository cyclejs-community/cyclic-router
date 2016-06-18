import {StreamAdapter} from '@cycle/base';
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
  _history$: any;
  constructor(_history$: any,
              private _namespace: Pathname[],
              private _createHref: (path: Pathname) => Pathname,
              private _runSA: StreamAdapter) {
    this._history$ = _runSA.remember(_history$);

  }

  get history$() {
    return this._history$;
  }

  path(pathname: Pathname): RouterSource {
    const scopedNamespace = this._namespace.concat(util.splitPath(pathname));
    const scopedHistory$ = this._history$
      .filter(({pathname: _path}: Location) => isStrictlyInScope(scopedNamespace, _path));

    const createHref = this._createHref;
    return new RouterSource(scopedHistory$, scopedNamespace, createHref, this._runSA);
  }

  define(routes: RouteDefinitions): any {
    const namespace = this._namespace;
    const _createHref = this._createHref;
    const createHref = util.makeCreateHref(namespace, _createHref);

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
