/* eslint max-nested-callbacks: 0 */
/*global describe, it */
import assert from 'assert'
import RxAdapter from '@cycle/rxjs-adapter'
import {Observable} from 'rxjs'
import {makeRouterDriver, createServerHistory} from '../lib'
import switchPath from 'switch-path';

describe('Cyclic Router - Rx 5', () => {
  describe('makeRouterDriver', () => {
    it('should throw if not given a history instance', () => {
      assert.throws(() => {
        makeRouterDriver(null)
      }, Error,
      /First argument to makeRouterDriver must be a valid history driver/i)
    })

    describe('routerDriver', () => {
      it('should return an object with `path` `define` `observable` ' +
        '`createHref` and `dispose`',
        () => {
          const history = createServerHistory('/')
          const router = makeRouterDriver(history, switchPath)(Observable.of('/'), RxAdapter)
          assert.notStrictEqual(router.path, null)
          assert.strictEqual(typeof router.path, 'function')
          assert.notStrictEqual(router.define, null)
          assert.strictEqual(typeof router.define, 'function')
          assert.notStrictEqual(router.history$, null)
          assert.strictEqual(typeof router.history$, 'object')
          assert.strictEqual(typeof router.history$.subscribe, 'function')
          assert.notStrictEqual(router.createHref, null)
          assert.strictEqual(typeof router.createHref, 'function')
        })
    })
  })

  describe('path()', () => {
    it('should return an object with `path` `define` `observable` ' +
      '`createHref` and `dispose`',
      () => {
        const history = createServerHistory('/')
        const router = makeRouterDriver(history, switchPath)(Observable.of('/'), RxAdapter)
          .path('/')
        assert.notStrictEqual(router.path, null)
        assert.strictEqual(typeof router.path, 'function')
        assert.notStrictEqual(router.define, null)
        assert.strictEqual(typeof router.define, 'function')
        assert.notStrictEqual(router.history$, null)
        assert.strictEqual(typeof router.history$, 'object')
        assert.strictEqual(typeof router.history$.subscribe, 'function')
        assert.notStrictEqual(router.createHref, null)
        assert.strictEqual(typeof router.createHref, 'function')
      })

    it('should filter the history$', () => {
      const routes = [
        '/somewhere/else',
        '/path/that/is/correct',
      ]
      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
        .path('/path')

      router.history$.subscribe((location) => {
        assert.notStrictEqual(location.pathname, '/somewhere/else')
        assert.strictEqual(location.pathname, '/path/that/is/correct')
      })

      routes.forEach(r => history.push(r))
    })

    it('multiple path()s should filter the history$', () => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.history$.subscribe(({pathname}) => {
        assert.strictEqual(pathname,
          '/some/really/really/deeply/nested/route/that/is/correct')
      })

      routes.forEach(r => history.push(r))
    })

    it('should create a proper path using createHref()', () => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.history$.subscribe(({pathname}) => {
        assert.strictEqual(pathname,
          '/some/really/really/deeply/nested/route/that/is/correct')
        assert.strictEqual(
          router.createHref('/is/correct'),
          '/some/really/really/deeply/nested/route/that/is/correct')
      })
      routes.forEach(r => history.push(r))

    })
  })

  describe('define()', () => {
    it('should return an object with `path$` `value$` `fullPath$` ' +
      '`createHref` and `dispose`',
      () => {
        const history = createServerHistory('/')
        const router = makeRouterDriver(history, switchPath)(Observable.of('/'), RxAdapter)
          .define({})
        assert.strictEqual(router instanceof Observable, true)
        assert.strictEqual(typeof router.subscribe, 'function')
        assert.notStrictEqual(router.createHref, null)
        assert.strictEqual(typeof router.createHref, 'function')
      })

    it('should match routes against a definition object', done => {
      const defintion = {
        '/some': {
          '/route': 123,
        },
      }

      const routes = [
        '/some/route',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
      const match$ = router.define(defintion)

      match$.skip(1).subscribe(({path, value, location}) => {
        assert.strictEqual(path, '/some/route')
        assert.strictEqual(value, 123)
        assert.strictEqual(location.pathname, '/some/route')
        done()
      })
      routes.forEach(r => history.push(r))
    })

    it('should respect prior filtering by path()', done => {
      const defintion = {
        '/correct': {
          '/route': 123,
        },
      }

      const routes = [
        '/wrong/path',
        '/some/nested/correct/route',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
      const match$ = router.path('/some').path('/nested').define(defintion)

      match$.subscribe(({path, value, location}) => {
        assert.strictEqual(path, '/correct/route')
        assert.strictEqual(value, 123)
        assert.strictEqual(location.pathname, '/some/nested/correct/route')
        done()
      })
      routes.forEach(r => history.push(r))

    })

    it('should match a default route if one is not found', done => {
      const definition = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const routes = [
        '/wrong/path',
        '/wrong/route',
        '/some/nested/incorrect/route',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
      const match$ = router.path('/some').path('/nested').define(definition)

      match$.subscribe(({path, value, location}) => {
        assert.strictEqual(path, '/incorrect/route')
        assert.strictEqual(value, 999)
        assert.strictEqual(location.pathname, '/some/nested/incorrect/route')
        done()
      })
      routes.forEach(r => history.push(r))

    })

    it('should create a proper href using createHref()', done => {
      const defintion = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const routes = [
        '/wrong/path',
        '/some/nested/correct/route',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
      const match$ = router
          .path('/some').path('/nested').define(defintion)

      match$.subscribe(({location: {pathname}, createHref}) => {
        assert.strictEqual(pathname, '/some/nested/correct/route')
        assert.strictEqual(createHref('/correct/route'), pathname)
        done()
      })
      routes.forEach(r => history.push(r))

    })

    it('should match partials', done => {
      const defintion = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const routes = [
        '/wrong/path',
        '/some/nested/correct/route/partial',
      ]

      const history = createServerHistory('/')
      const router = makeRouterDriver(history, switchPath)(Observable.never(), RxAdapter)
      const match$ = router
          .path('/some').path('/nested').define(defintion)

      match$.subscribe(({path, location: {pathname}}) => {
        assert.strictEqual(path, '/correct/route')
        assert.strictEqual(pathname, '/some/nested/correct/route/partial')
        done()
      })
      routes.forEach(r => history.push(r))
    })
  })
})
