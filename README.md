# cyclic-router
cyclic-router V5 is a routing library built for Cycle.js.  Unlike previous versions, cyclic-router V5 is not a driver.  It is a `main` function-wrapper (routerify) which relies on @cycle/history for driver source/sink interactions

For older versions of cyclic-router, V4 and earlier please go to the old [README](https://github.com/cyclejs-community/cyclic-router/README_V4.md)

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save cyclic-router

Routerify requires you to inject the route matcher.  We'll use `switch-path` for our examples but other matching libraries could be adapted to be used here:

    $ npm install --save switch-path
```js
// using an ES6 transpiler, like babel
import {routerify} from 'cyclic-router'

// not using an ES6 transpiler
var routerify = require('cyclic-router').routerify
```

## API

For API documentation please visit this link [here](http://cyclejs-community.github.io/cyclic-router/docs/)

## Basic Usage

```js
import xs from 'xstream';
import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import {routerify} from 'cyclic-router';
import {makeHistoryDriver} from '@cycle/history';
import switchPath from 'switch-path';

function main(sources) {
  const match$ = sources.router.define({
    '/': HomeComponent,
    '/other': OtherComponent
  });
  
  const page$ = match$.map(({path, value}) => {
    return value(Object.assign({}, sources, {
      router: sources.router.path(path) // notice use of 'router' source name, 
                                        // which proxies raw 'history' source with 
                                        // additional functionality
    }));
  });
  
  return {
    DOM: page$.map(c => c.DOM).flatten(),
    router: xs.of('/other') // Notice use of 'router' sink name, 
                            // which proxies the original 'history' sink
  };
}

const mainWithRouting = routerify(main, switchPath)

run(mainWithRouting, {
  DOM: makeDOMDriver('#app'),
  history: makeHistoryDriver() // create history driver as usual,
                               // but it gets proxied by routerify
});
```
### Routerify Options

Routerify accepts an options object like so: `routerify(main, options)`

The `options` object conforms to the interface:
```
interface RouterOptions {
    basename?: string;
    historyName?: string;
    routerName?: string;
    omitHistory?: boolean;
}
```

- `basename` - The root router path, defaults to `/`
- `historyName` - The source/sink name associated with the raw history river, defaults to `history`
- `routerName` - The source/sink name you want exposed to your app which caputures the functionality/streams associated with routerify.  Defaults to `router`
- `omitHistory` - Routerify hides the source/sink name associated with the raw history driver (given in the `historyName` option) from your app and only exposes the source/sink name associated with the router (given in the `routerName` option).  Defaults to `true`, If you would like your app to have access to both the raw `history` source/sink and the `router` source/sink (injected by routerify), set this option to `false`

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
