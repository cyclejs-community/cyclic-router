import {div, ul, li, a} from 'cycle-snabbdom'

import Why from './why'
import Compose from './compose'
import Built from './built'

const routes = {
  '*': () => ({DOM: div({style: {opacity: 0}})}),
  '/why': Why,
  '/built': Built,
  '/compose': Compose,
}

const ulStyle = {
  padding: '0',
  margin: '0',
  width: '100%',
  listStyle: 'none',
}

const liStyle = {
  padding: '0',
  margin: '0',
  marginTop: '0.5em',
  height: '2em',
  borderBottom: '1px solid rgba(34, 34, 34, 0.3)',
}

const linkStyle = {
  paddingLeft: '1em',
  height: '100%',
  width: '100%',
  display: 'block',
  textDecoration: 'none',
}

function view(createHref) {
  return (children) =>
    div({},[
      ul({style: ulStyle}, [
        li({style: liStyle}, [
          a({style: linkStyle,
            props: {href: createHref('/why')},
          }, 'Why Cyclic Router?'),
        ]),
        li({style: liStyle}, [
          a({
            style: linkStyle,
            props: {href: createHref('/built')},
          }, 'Built For Cycle.js'),
        ]),
        li({style: liStyle}, [
          a({
            style: linkStyle,
            props: {href: createHref('/compose')},
          }, 'Compose a Message'),
        ]),
      ]),
      children,
    ])
}

function Inbox(sources) {
  const {router} = sources
  const match$ = router.define(routes)

  const childrenDOM$ = match$.map(({value}) => value(sources).DOM)

  return {DOM: childrenDOM$.map(view(router.createHref))}
}

export default Inbox
