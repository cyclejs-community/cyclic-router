import switchPath from 'switch-path'

import {splitPath, filterPath, makeCreateHref} from './util'

function getPathValue(pathname, definitions) {
  let path
  let value
  try {
    const match = switchPath(pathname, definitions)
    value = match.value
    path = match.path
  } catch (e) {
    // try handling default route
    if (definitions['*']) {
      path = pathname
      value = definitions['*']
    } else {
      throw e
    }
  }
  return {path, value}
}

function makeDefinitionResolver(history$, namespace, createHref) {
  return function definitionResolver(definitions) {
    const matches$ = history$.map(
      ({pathname}) => {
        const filteredPath = `/${filterPath(splitPath(pathname), namespace)}`
        const {path, value} = getPathValue(filteredPath, definitions)
        return {path, value, pathname}
      }
    )

    const path$ = matches$.pluck('path').replay(1)
    const pathDisposable = path$.connect()

    const value$ = matches$.pluck('value').replay(1)
    const valueDisposable = value$.connect()

    const fullPath$ = matches$.pluck('pathname').replay(1)
    const fullPathDisposable = fullPath$.connect()

    const dispose = () => {
      pathDisposable.dispose()
      fullPathDisposable.dispose()
      valueDisposable.dispose()
    }

    return {
      path$,
      value$,
      fullPath$,
      createHref: makeCreateHref(namespace, createHref),
      dispose,
    }
  }
}

export {makeDefinitionResolver}
