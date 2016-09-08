/* eslint max-nested-callbacks: 0 */
/*global describe, it */
import assert from 'assert'
import XSAdapter from '@cycle/xstream-adapter'
import xs from 'xstream'
import {makeRouterDriver, createServerHistory} from '../lib'
import switchPath from 'switch-path';

describe('Cyclic Router - XStream', () => {
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
          const history = createServerHistory()
          const router = makeRouterDriver(history, switchPath)(xs.of('/'), XSAdapter)
          assert.notStrictEqual(router.path, null)
          assert.strictEqual(typeof router.path, 'function')
          assert.notStrictEqual(router.define, null)
          assert.strictEqual(typeof router.define, 'function')
          assert.notStrictEqual(router.history$, null)
          assert.strictEqual(typeof router.history$, 'object')
          assert.strictEqual(typeof router.history$.addListener, 'function')
          assert.notStrictEqual(router.createHref, null)
          assert.strictEqual(typeof router.createHref, 'function')
        })
    })
  })

  describe('path()', () => {
    it('should return an object with `path` `define` `observable` ' +
      '`createHref` and `dispose`',
      () => {
        const history = createServerHistory()
        const router = makeRouterDriver(history, switchPath)(xs.of('/'), XSAdapter)
          .path('/')
        assert.notStrictEqual(router.path, null)
        assert.strictEqual(typeof router.path, 'function')
        assert.notStrictEqual(router.define, null)
        assert.strictEqual(typeof router.define, 'function')
        assert.notStrictEqual(router.history$, null)
        assert.strictEqual(typeof router.history$, 'object')
        assert.strictEqual(typeof router.history$.addListener, 'function')
        assert.notStrictEqual(router.createHref, null)
        assert.strictEqual(typeof router.createHref, 'function')
      })

    it('should filter the history$', () => {
      const routes = [
        '/somewhere/else',
        '/path/that/is/correct',
      ]
      const history = createServerHistory()
      const router = makeRouterDriver(history, switchPath)(xs.fromArray(routes), XSAdapter)
        .path('/path')

      router.history$.addListener({
        next: (location) => {
          assert.notStrictEqual(location.pathname, '/somewhere/else')
          assert.strictEqual(location.pathname, '/path/that/is/correct')
        },
        error: () => {},
        complete: () => {}
      })
    })

    it('multiple path()s should filter the history$', () => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const history = createServerHistory()
      const router = makeRouterDriver(history, switchPath)(xs.fromArray(routes), XSAdapter)
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.history$.addListener({
        next: ({pathname}) => {
          assert.strictEqual(pathname,
            '/some/really/really/deeply/nested/route/that/is/correct')
        },
        error: () => {},
        complete: () => {},
      })
    })

    it('should create a proper path using createHref()', () => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const history = createServerHistory()
      const router = makeRouterDriver(history, switchPath)(xs.fromArray(routes), XSAdapter)
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.history$.addListener({
        next: ({pathname}) => {
          assert.strictEqual(pathname,
            '/some/really/really/deeply/nested/route/that/is/correct')
          assert.strictEqual(
            router.createHref('/is/correct'),
            '/some/really/really/deeply/nested/route/that/is/correct')
        },
        error: () => {},
        complete: () => {},
      })
    })
  })

  describe('define()', () => {
    it('should return an object with `path$` `value$` `fullPath$` ' +
      '`createHref` and `dispose`',
      () => {
        const history = createServerHistory()
        const router = makeRouterDriver(history, switchPath)(xs.merge(xs.never(), xs.of('/')), XSAdapter)
          .define({})
        assert.strictEqual(router instanceof xs, true)
        assert.strictEqual(typeof router.addListener, 'function')
        assert.notStrictEqual(router.createHref, null)
        assert.strictEqual(typeof router.createHref, 'function')
      })

    it('should match routes against a definition object', done => {
      const defintion = {
        '/some': {
          '/route': 123,
        },
      }

      const history = createServerHistory('/some/route')
      const router = makeRouterDriver(history, switchPath)(xs.never(), XSAdapter)
      const match$ = router.define(defintion)

      match$.addListener({
        next: ({path, value, location}) => {
          assert.strictEqual(path, '/some/route')
          assert.strictEqual(value, 123)
          assert.strictEqual(location.pathname, '/some/route')
          done()
        },
        error: () => {},
        complete: () => {},
      })
    })

    it('should respect prior filtering by path()', done => {
      const defintion = {
        '/correct': {
          '/route': 123,
        },
      }

      const routes = [
        '/some/nested/correct/route',
      ]

      const history = createServerHistory('/wrong/path')
      const router = makeRouterDriver(history, switchPath)(xs.never(), XSAdapter)
      const match$ = router.path('/some').path('/nested').define(defintion)

      match$.addListener({
        next: ({path, value, location}) => {
          assert.strictEqual(path, '/correct/route')
          assert.strictEqual(value, 123)
          assert.strictEqual(location.pathname, '/some/nested/correct/route')
          done()
        },
        error: () => {},
        complete: () => {},
      })

      setTimeout(() => {
        history.push('/some/nested/correct/route')
      })
    })

    it('should match a default route if one is not found', done => {
      const definition = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const history = createServerHistory('/wrong/path')
      const router = makeRouterDriver(history, switchPath)(xs.never(), XSAdapter)
      const match$ = router.path('/some').path('/nested').define(definition)

      match$.addListener({
        next: ({path, value, location}) => {
          assert.strictEqual(path, '/incorrect/route')
          assert.strictEqual(value, 999)
          assert.strictEqual(location.pathname, '/some/nested/incorrect/route')
          done()
        },
        error: () => {},
        complete: () => {},
      })

      history.push('/wrong/route')
      history.push('/some/nested/incorrect/route')
    })

    it('should create a proper href using createHref()', done => {
      const definition = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const history = createServerHistory('/wrong/path')
      const router = makeRouterDriver(history, switchPath)(xs.never(), XSAdapter)
      const match$ = router.path('/some').path('/nested').define(definition)

      match$.addListener({
        next: ({path, value, location, createHref}) => {
          assert.strictEqual(path, '/incorrect/route')
          assert.strictEqual(value, 999)
          assert.strictEqual(location.pathname, '/some/nested/incorrect/route')
          //assert.strictEqual(location.pathname, createHref('/incorrect/route'))
          done()
        },
        error: () => {},
        complete: () => {},
      })

      assert(match$.createHref('/hello'), '/some/nested/hello')

      history.push('/wrong/route')
      history.push('/some/nested/incorrect/route')
    })

    it('should match partials', done => {
      const defintion = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const history = createServerHistory('/wrong/path')
      const router = makeRouterDriver(history, switchPath)(xs.never(), XSAdapter)
      const match$ = router
          .path('/some').path('/nested').define(defintion)

      match$.addListener({
        next: ({path, location: {pathname}, createHref}) => {
          assert.strictEqual(path, '/correct/route')
          assert.strictEqual(pathname, '/some/nested/correct/route/partial')
          done()
        },
        error: () => {},
        complete: () => {},
      })

      history.push('/some/nested/correct/route/partial')
    })
  })
})
