import {Pathname} from '@cycle/history';
import {LocationDescriptorObject} from 'history';

function splitPath(path: Pathname): Pathname[] {
  return path.split('/').filter(p => p.length > 0);
}

function filterPath(pathParts: Pathname[], namespace: Pathname[]): Pathname {
  return pathParts.filter(part => namespace.indexOf(part) < 0).join('/');
}

const startsWith = (param: string, value: string) => param[0] === value;

const startsWith2 = (param: string, value1: string, value2: string) =>
  param[0] === value1 && param[1] === value2;

function makeCreateHref(namespace: Pathname[], _createHref: (pathname: LocationDescriptorObject) => Pathname) {
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
  return function createHref(location: Pathname | LocationDescriptorObject): Pathname {
    if (typeof location === 'object' && location !== null) {
      const fullPath = `${namespace.join('/')}${location.pathname}`;
      return startsWith(fullPath, '/') || startsWith2(fullPath, '#', '/')
        ? _createHref({
            ...location,
            pathname: fullPath,
          })
        : _createHref({
            ...location,
            pathname: '/' + fullPath
          });
    } else if (typeof location === 'string') {
      const fullPath = `${namespace.join('/')}${location}`;
      return startsWith(fullPath, '/') || startsWith2(fullPath, '#', '/')
        ? _createHref({
            pathname: fullPath
          })
        : _createHref({
            pathname: '/' + fullPath
          });
    }
  };
}

export {
  splitPath,
  filterPath,
  makeCreateHref,
}
