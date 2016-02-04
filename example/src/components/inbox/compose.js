import {Observable} from 'rx'
import {div, h2} from 'cycle-snabbdom'

import {containerStyle} from './childStyles'

function Compose() {
  return {DOM: Observable.of(div({style: containerStyle}, [
    h2({}, 'Compose Stuffs'),
  ]))}
}

export default Compose
