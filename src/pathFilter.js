import {createAPI} from './api'
import {splitPath} from './util'

function isStrictlyInScope(namespace, path) {
  const pathParts = path.split('/').filter(x => x.length > 0)
  return namespace.every((v, i) => {
    return pathParts[i] === v
  })
}

function makePathFilter(history$, namespace, createHref) {
  return function pathFilter(path) {
    const scopedNamespace = namespace.concat(splitPath(path))
    const scopedHistory$ = history$.filter(
      ({pathname}) => isStrictlyInScope(scopedNamespace, pathname)
    )
    return createAPI(scopedHistory$, scopedNamespace, createHref)
  }
}

export {makePathFilter}
