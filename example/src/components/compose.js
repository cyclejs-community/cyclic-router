import {Observable} from 'rx'
import {div, h2} from 'cycle-snabbdom'

function Compose() {
  return {DOM: Observable.of(div([
    h2({style: {padding: '1em'}}, 'Compose Stuffs'),
  ]))}
}

export default Compose
