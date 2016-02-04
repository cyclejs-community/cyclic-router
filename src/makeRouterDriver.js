import {createAPI} from './api'

function makeRouterDriver(historyDriver) {
  if (!historyDriver || typeof historyDriver !== 'function') {
    throw new Error('First argument to makeRouterDriver must be a valid ' +
      'history driver')
  }
  return function routerDriver(sink$) {
    const history$ = historyDriver(sink$)
    return createAPI(history$, [], history$.createHref)
  }
}

export {makeRouterDriver}
