import {Observable} from 'rx'
import {div, h2} from 'cycle-snabbdom'

function Home() {
  return {DOM: Observable.of(div([
    h2({style: {padding: '1em'}},'Home Stuffs'),
  ]))}
}

export default Home
