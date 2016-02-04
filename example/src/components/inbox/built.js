import {Observable} from 'rx'
import {div, h2} from 'cycle-snabbdom'

import {containerStyle} from './childStyles'

function Built() {
  return {DOM: Observable.of(div({style: containerStyle},[
    h2({}, 'Built for Cycle.js'),
  ]))}
}

export default Built
