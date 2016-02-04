import Rx from 'rx'
import {createAPI} from './api'

function makeRouterDriver(history) {
  if (!history || typeof history !== 'object' ||
    typeof history.listen !== 'function')
  {
    throw new Error('First argument to makeRouterDriver must be a valid ' +
      'history instance with a listen() method')
  }
  return function routerDriver() {
    const history$ = new Rx.ReplaySubject(1)
    history.listen(location => history$.onNext(location))
    return createAPI(history$, [], history.createHref)
  }
}

export {makeRouterDriver}
