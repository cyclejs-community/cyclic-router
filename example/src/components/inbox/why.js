import {Observable} from 'rx'
import {div, h2} from 'cycle-snabbdom'

import {containerStyle} from './childStyles'

function Why() {
  return {DOM: Observable.of(div({style: containerStyle},[
    h2({}, 'Why Cyclic Router?'),
  ]))}
}

export default Why
