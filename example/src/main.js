import {run} from '@cycle/core'
import {makeDOMDriver} from 'cycle-snabbdom'
import {makeHTTPDriver} from '@cycle/http'
import {makeRouterDriver} from '../../lib'
import {createHashHistory} from 'history'

import app from './app'

const history = createHashHistory({queryKey: false})

run(app, {
  DOM: makeDOMDriver('#app'),
  router: makeRouterDriver(history),
  HTTP: makeHTTPDriver(),
})
