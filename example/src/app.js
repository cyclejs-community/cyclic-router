import {div, nav} from 'cycle-snabbdom'

import Sidebar from './components/sidebar'
import Home from './components/home'
import Inbox from './components/inbox'
import Compose from './components/compose'
import NotFound from './components/notfound'

const routes = {
  '/': Home,
  '/inbox': Inbox,
  '/compose': Compose,
  '*': NotFound,
}

function view(sidebar, children) {
  return div(
    {
      style: {
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      },
    },
    [
      nav({style: {
        zIndex: '1',
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        width: '10em',
        backgroundColor: '#cccccc',
        borderRight: '2px solid rgba(34, 34, 34, 0.4)',
      }}, [sidebar]),
      div({style: {
        marginLeft: '10em',
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: '#dfdfdf',
      }}, [children]),
    ])
}

function App(sources) {
  const {router} = sources
  const {path$, value$} = router.define(routes)
  const sidebar = Sidebar(sources, path$)
  const childrenDOM$ = path$.zip(value$,
    (path, value) => value({...sources, router: router.path(path)}).DOM
  )

  return {
    DOM: sidebar.DOM.combineLatest(childrenDOM$, view),
  }
}

export default App
