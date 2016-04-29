import {Pathname} from '@cycle/history/lib/interfaces';

function splitPath(path: Pathname): Pathname[] {
  return path.split('/').filter(p => p.length > 0);
}

function filterPath(pathParts: Pathname[], namespace: Pathname[]): Pathname {
  return pathParts.filter(part => namespace.indexOf(part) < 0).join('/');
}

const startsWith = (param: string, value: string) => param[0] === value;

const startsWith2 = (param: string, value1: string, value2: string) =>
  param[0] === value1 && param[1] === value2;

function makeCreateHref(namespace: Pathname[], _createHref: (pathname: Pathname) => Pathname) {
  /**
   * Function used to create HREFs that are properly namespaced
   * @typedef {createHref}
   * @name createHref
   * @method createHref
   * @param  {string} path - the HREF that will be appended to the current
   * namespace
   * @return {string} a fully qualified HREF composed from the current
   * namespace and the path provided
   */
  return function createHref(path: Pathname): Pathname {
    const fullPath = `${namespace.join('/')}${path}`;
    return startsWith(fullPath, '/') || startsWith2(fullPath, '#', '/') ?
      _createHref(fullPath) :
      _createHref('/' + fullPath);
  };
}

export {
  splitPath,
  filterPath,
  makeCreateHref,
}
