# cyclic-router
cyclic-router is a Router Driver built for Cycle.js

**Disclaimer** Use v4 for Cycle Unified. v2.x.x is for Cycle and v3 is for Cycle Diversity.  
If you are still using @cycle/core please continue to use v1.x.x

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save cyclic-router

Versions 3 and 4 requires users to inject the route matcher.  We'll use `switch-path` for our examples but other
matching libraries could be adapted to be used here:

    $ npm install --save switch-path

Note: Version 2 and below use `switch-path` for the route matcher always and the above library install is not necesssary/done implicitly.

Then with a module bundler like [browserify](http://browserify.org/), use as you would anything else:

```js
// using an ES6 transpiler, like babel
import {makeRouterDriver} from 'cyclic-router'

// not using an ES6 transpiler
var makeRouterDriver = require('cyclic-router').makeRouterDriver
```

## API

For API documentation please visit this link [here](http://cyclejs-community.github.io/cyclic-router/docs/)

## Basic Usage

```js
import xs from 'xstream';
import Cycle from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import {makeRouterDriver} from 'cyclic-router';
import {createBrowserHistory} from 'history';
import switchPath from 'switch-path';  // Required in v3, not required in v2 or below 

function main(sources) {
  const match$ = sources.router.define({
    '/': HomeComponent,
    '/other': OtherComponent
  });
  
  const page$ = match$.map(({path, value}) => {
    return value(Object.assign({}, sources, {
      router: sources.router.path(path)
    }));
  });
  
  return {
    DOM: page$.map(c => c.DOM).flatten(),
    router: xs.of('/other'),
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  router: makeRouterDriver(createBrowserHistory(), switchPath)  // v3
  // router: makeRouterDriver(createHistory()) // <= v2
});
```

### Route Parameters

This behavior changes based on the injected route matcher.  In the case of `switch-path`, you can pass route parameters to your component by adding them to the component sources.

```js
const routes = {
  '/:id': id => sources => YourComponent({props$: Observable.of({id}), ...sources})
}
```

### Dynamically change route

You can dynamically change route from code by emitting inputs handled by [the history driver](http://cycle.js.org/history/docs/#historyDriver).

```js
function main(sources) {
  // ...
  const homePageClick$ = sources.DOM.select(".home").events("click");
  const previousPageClick$ = sources.DOM.select(".previous").events("click");
  const nextPageClick$ = sources.DOM.select(".next").events("click");
  const oldPageClick$ = sources.DOM.select(".old").events("click");
  const aboutPageClick$ = sources.DOM.select(".about").events("click");
  
  return {
    // ...
    router: xs.merge(
        // Go to page "/"
        homePageClick$.mapTo("/"),
        
        // Go back to previous page
        previousPageClick$.mapTo({ type: "goBack" }),
        
        // Go forward to next page
        nextPageClick$.mapTo({ type: "goForward" }),
        
        // Go back from 5 pages
        oldPageClick$.mapTo({ type: "go", value: -5 }),
        
        // Go to page "/about" with some state set to router's location
        aboutPageClick$.mapTo({ pathname: "/about", state: { some: "state" } })
    ),
  };
}
```
