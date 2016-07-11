# cyclic-router
cyclic-router is a Router Driver built for Cycle.js

**Disclaimer** v2.x.x is for Cycle Diversity!
If you are still using @cycle/core please continue to use v1.x.x

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

For API documentation pleave visit this link [here](http://cyclejs-community.github.io/cyclic-router/docs/)

## Basic Usage

```js
import xs from 'xstream';
import Cycle from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import {makeRouterDriver} from 'cyclic-router';
import {createHistory} from 'history';

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
  router: makeRouterDriver(createHistory())
});
```

### Route Parameters

You can pass route parameters to your component by adding them to the component sources.

```js
const routes = {
  '/:id': id => sources => YourComponent({props$: Observable.of({id}), ...sources})
}
```
