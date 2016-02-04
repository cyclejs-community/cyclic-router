import {Observable} from 'rx'
import {div, h2} from 'cycle-snabbdom'

function NotFound() {
  return {DOM: Observable.of(div([
    h2({style: {padding: '1em'}}, 'This page can not be found (intentionally)'),
  ]))}
}

export default NotFound
