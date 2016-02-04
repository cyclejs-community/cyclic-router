import {run} from '@cycle/core'
import {makeDOMDriver} from 'cycle-snabbdom'
import {makeHistoryDriver} from 'cyclic-history'
import {makeRouterDriver} from '../../src'
import {createHashHistory} from 'history'

import app from './app'

run(app, {
  DOM: makeDOMDriver('#app'),
  router: makeRouterDriver(makeHistoryDriver(createHashHistory())),
})
