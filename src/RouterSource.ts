import {StreamAdapter} from '@cycle/base';
import {Stream} from 'xstream';
import XSAdapter from '@cycle/xstream-adapter';

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
  constructor(private _history$: Stream<Location>,
              private _namespace: Pathname[],
              private _createHref: (path: Pathname) => Pathname,
              private _runSA: StreamAdapter) {}

  get history$() {
    return this._runSA.adapt(
      this._history$,
      XSAdapter.streamSubscribe
    );
  }

  path(pathname: Pathname): RouterSource {
    const scopedNamespace = this._namespace.concat(pathname);
    const scopedHistory$ = this._history$
      .filter(({pathname: _path}) => isStrictlyInScope(scopedNamespace, _path))
      .remember();

    return new RouterSource(scopedHistory$, scopedNamespace, this._createHref, this._runSA);
  }

  define(routes: RouteDefinitions): any {
    const namespace = this._namespace;
    const createHref = util.makeCreateHref(namespace, this._createHref);

    const _match$ = this._history$
      .map((location: Location) => {
        const filteredPath = getFilteredPath(namespace, location.pathname);
        const {path, value} = switchPath(filteredPath, routes);
        return {path, value, location, createHref};
      })
      .remember();

    const match$ = this._runSA.adapt(_match$, XSAdapter.streamSubscribe);
    (<any> match$).createHref = createHref;
    return match$;
  }

  createHref(path: Pathname): Pathname {
    return util.makeCreateHref(this._namespace, this._createHref)(path);
  }
}
