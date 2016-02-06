# cyclic-router
cyclic-router is a Router Driver built for Cycle.js

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install cyclic-router

Then with a module bundler like [browserify](http://browserify.org/), use as you would anything else:

```js
// using an ES6 transpiler, like babel
import {makeRouterDriver} from 'cyclic-router'

// not using an ES6 transpiler
var makeRouterDriver = require('cyclic-router').makeRouterDriver
```

## API

For API documentation pleave visit this link [here](http://tylors.github.io/cyclic-router/docs/)

## Example

The example found in the repo can be taken for a test-drive [here](http://tylors.github.io/cyclic-router/example)

## Getting started

###1.

Here is a rundown of the `example` provided with this repo in the folder `/example`. This should allow a better understanding of how to use cyclic-router, for simplicity the styling has been removed here.

Starting in the file which has Cycle `run`, router driver needs to be created here along with the other drivers that you might be using.
Looking at the imports below, [cyclic-history](https://github.com/tylors/cyclic-history) is being used instead of cycle-history.

```js
// main.js
import {run} from '@cycle/core'
import {makeDOMDriver} from 'cycle-snabbdom'
import {makeHistoryDriver} from 'cyclic-history'
import {makeRouterDriver} from 'cyclic-router'
import {createHashHistory} from 'history'

import app from './app' // the function of your app

run(app, {
  DOM: makeDOMDriver('#app'),
  // Notice how you need to feed in funcs from cyclic-history + history
  router: makeRouterDriver(makeHistoryDriver(createHashHistory())),
})
```

In this instance we are using `cyclic-history` and `history` to deal with the history API, have a read of the history [docs](https://github.com/rackt/history/tree/master/docs#readme) to find out more information on how that all works.

###2.

App.js will be used as the place for showing the correct component in reference to current url (what you'd expect from a router!).
When creating your `routes` object keep in mind that cyclic-router uses [switch-path](https://github.com/staltz/switch-path) and it is worth checking out that repo to understand the structure that `switch-path` expects.

```js
// app.js
import {div, nav} from 'cycle-snabbdom'

import Sidebar from './components/sidebar'
import Home from './components/home'
import Inbox from './components/inbox'
import Compose from './components/compose'
import NotFound from './components/notfound'

// routes is used for matching a route to a component
const routes = {
  '/': Home,
  '/inbox': Inbox,
  '/compose': Compose,
  '*': NotFound,
}

// the view has sidebar & children passed in
function view(sidebar, children) {
  return div([
      nav([sidebar]),
      div([children]),
    ])
}

function App(sources) {
  const {router} = sources // get router out of sources
  const {path$, value$} = router.define(routes) // pass routes into the router
  const sidebar = Sidebar(sources, path$) // pass in sources and path$ into our sidebar

  // childrenDOM$ takes path$ from `router.define(routes)` above and zips it with values, here is where
  // the components swap in reference to the current url, notice router.path(path) is also passed in
  // for later use in nested routes.
  // This allows components to be nested without ever knowing they are actually nested.
  const childrenDOM$ = path$.zip(value$,
    (path, value) => value({...sources, router: router.path(path)}).DOM
  )

  return {
    DOM: sidebar.DOM.combineLatest(childrenDOM$, view),
  }
}

export default App
```


###3.

Next, lets look at what triggers these url changes inside the sidebar

```js
// ./components/sidebar.js
import {ul, li, a} from 'cycle-snabbdom'

function Sidebar(sources, path$) {
  // take out createHref from our sources
  const {router: {createHref}} = sources

  // here the urls we want to use are passed into createHref.
  // createHref() will always create the proper href no matter how far it is nested within a hierarchy.
  const inboxHref = createHref('/inbox')
  const composeHref = createHref('/compose')
  const contactHref = createHref('/contact')

  // adding li's links and giving them Href's from above
  const view$ = path$.map(() => {
    return ul({style: ulStyle},[
      li([a({props: {href: inboxHref}}, 'Inbox')]),
      li([a({props: {href: composeHref}}, 'Compose')]),
      li([a({props: {href: contactHref}}, 'Contacts')]),
    ])
  })

  return {DOM: view$}
}

export default Sidebar
```

At this point you are at a good stage to be able to make a simple app/site with multiple pages. Next taking a look at nesting these routes directly within children components.


###4.

Nested routing becomes very trivial, as you can see below it is as simple as repeating the same steps as above.

```js
// ./components/inbox/index.js
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

function view(createHref, path$, children) {
  return path$.map(() => {
    return div({},[
      ul([
        li([
          a({props: {href: createHref('/why')},
          }, 'Why Cyclic Router?'),
        ]),
        li([
          a({props: {href: createHref('/built')},
          }, 'Built For Cycle.js'),
        ]),
        li([
          a({props: {href: createHref('/compose')},
          }, 'Compose a Message'),
        ]),
      ]),
      children,
    ])
  })
}

function Inbox(sources) {
  const {router} = sources
  const {path$, value$} = router.define(routes)

  const childrenDOM$ = value$.map(value => value(sources).DOM)

  return {DOM: view(router.createHref, path$, childrenDOM$)}
}

export default Inbox
```
