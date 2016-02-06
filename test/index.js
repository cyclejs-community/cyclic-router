/* eslint max-nested-callbacks: 0 */
/*global describe, it */
import assert from 'assert'
import {Observable} from 'rx'
import {makeHistoryDriver, createServerHistory} from 'cyclic-history'
import {makeRouterDriver, createRouter} from '../src'

describe('Cyclic Router', () => {
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
          const historyDriver = makeHistoryDriver(createServerHistory())
          const router = makeRouterDriver(historyDriver)(Observable.just('/'))
          assert.notStrictEqual(router.path, null)
          assert.strictEqual(typeof router.path, 'function')
          assert.notStrictEqual(router.define, null)
          assert.strictEqual(typeof router.define, 'function')
          assert.notStrictEqual(router.observable, null)
          assert.strictEqual(typeof router.observable, 'object')
          assert.strictEqual(typeof router.observable.subscribe, 'function')
          assert.notStrictEqual(router.createHref, null)
          assert.strictEqual(typeof router.createHref, 'function')
          assert.notStrictEqual(router.dispose, null)
          assert.strictEqual(typeof router.dispose, 'function')
        })
    })
  })

  describe('path()', () => {
    it('should return an object with `path` `define` `observable` ' +
      '`createHref` and `dispose`',
      () => {
        const historyDriver = makeHistoryDriver(createServerHistory())
        const router = makeRouterDriver(historyDriver)(Observable.just('/'))
          .path('/')
        assert.notStrictEqual(router.path, null)
        assert.strictEqual(typeof router.path, 'function')
        assert.notStrictEqual(router.define, null)
        assert.strictEqual(typeof router.define, 'function')
        assert.notStrictEqual(router.observable, null)
        assert.strictEqual(typeof router.observable, 'object')
        assert.strictEqual(typeof router.observable.subscribe, 'function')
        assert.notStrictEqual(router.createHref, null)
        assert.strictEqual(typeof router.createHref, 'function')
        assert.notStrictEqual(router.dispose, null)
        assert.strictEqual(typeof router.dispose, 'function')
      })

    it('should filter the history$', () => {
      const routes = [
        '/somewhere/else',
        '/path/that/is/correct',
      ]
      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
        .path('/path')

      router.observable.subscribe((location) => {
        assert.notStrictEqual(location.pathname, '/somewhere/else')
        assert.strictEqual(location.pathname, '/path/that/is/correct')
      })
    })

    it('multiple path()s should filter the history$', () => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.observable.subscribe(({pathname}) => {
        assert.strictEqual(pathname,
          '/some/really/really/deeply/nested/route/that/is/correct')
      })
    })

    it('should create a proper path using createHref()', () => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.observable.subscribe(({pathname}) => {
        assert.strictEqual(pathname,
          '/some/really/really/deeply/nested/route/that/is/correct')
        assert.strictEqual(
          router.createHref('/is/correct'),
          '/some/really/really/deeply/nested/route/that/is/correct')
      })
    })

    it('should not work after being disposed', done => {
      const routes = [
        '/the/wrong/path',
        '/some/really/really/deeply/nested/route/that/is/correct',
        '/some/really/really/deeply/nested/incorrect/route',
      ]

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
        .path('/some').path('/really').path('/really').path('/deeply')
        .path('/nested').path('/route').path('/that')

      router.dispose()
      router.observable.subscribe(done.fail)
      setTimeout(done, 10)
    })
  })

  describe('define()', () => {
    it('should return an object with `path$` `value$` `fullPath$` ' +
      '`createHref` and `dispose`',
      () => {
        const historyDriver = makeHistoryDriver(createServerHistory())
        const router = makeRouterDriver(historyDriver)(Observable.just('/'))
          .define({})
        assert.notStrictEqual(router.path$, null)
        assert.strictEqual(typeof router.path$, 'object')
        assert.strictEqual(typeof router.path$.subscribe, 'function')
        assert.notStrictEqual(router.value$, null)
        assert.strictEqual(typeof router.value$, 'object')
        assert.strictEqual(typeof router.value$.subscribe, 'function')
        assert.notStrictEqual(router.fullPath$, null)
        assert.strictEqual(typeof router.fullPath$, 'object')
        assert.strictEqual(typeof router.fullPath$.subscribe, 'function')
        assert.notStrictEqual(router.createHref, null)
        assert.strictEqual(typeof router.createHref, 'function')
        assert.notStrictEqual(router.dispose, null)
        assert.strictEqual(typeof router.dispose, 'function')
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

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
      const {path$, value$, fullPath$} =
        router.define(defintion)

      path$.subscribe((path) => {
        assert.strictEqual(path, '/some/route')
      })

      value$.subscribe((value) => {
        assert.strictEqual(value, 123)
      })

      fullPath$.subscribe(fullPath => {
        assert.strictEqual(fullPath, '/some/route')
        setTimeout(done, 10)
      })
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

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
      const {path$, value$, fullPath$} = router
          .path('/some').path('/nested').define(defintion)

      path$.subscribe((path) => {
        assert.strictEqual(path, '/correct/route')
      })

      value$.subscribe((value) => {
        assert.strictEqual(value, 123)
      })

      fullPath$.subscribe(fullPath => {
        assert.strictEqual(fullPath, '/some/nested/correct/route')
        setTimeout(done, 10)
      })
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

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
      const {path$, value$, fullPath$} = router
          .path('/some').path('/nested').define(definition)

      path$.subscribe((path) => {
        assert.strictEqual(path, '/incorrect/route')
      })

      value$.subscribe((value) => {
        assert.strictEqual(value, 999)
      })

      fullPath$.subscribe(fullPath => {
        assert.strictEqual(fullPath, '/some/nested/incorrect/route')
        setTimeout(done, 10)
      })
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

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
      const {fullPath$, createHref} = router
          .path('/some').path('/nested').define(defintion)

      fullPath$.subscribe(pathname => {
        assert.strictEqual(pathname, '/some/nested/correct/route')
        assert.strictEqual(createHref('/correct/route'), pathname)
        setTimeout(done, 5)
      })
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

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
      const {path$, fullPath$} = router
          .path('/some').path('/nested').define(defintion)

      path$.subscribe(pathname => {
        assert.strictEqual(pathname, '/correct/route')
      })

      fullPath$.subscribe(pathname => {
        assert.strictEqual(pathname, '/some/nested/correct/route/partial')
        setTimeout(done, 5)
      })
    })

    it('should not work after being disposed', done => {
      const defintion = {
        '/correct': {
          '/route': 123,
        },
        '*': 999,
      }

      const routes = [
        '/wrong/path',
        '/some/nested/correct/route',
        '/wrong/route',
      ]

      const historyDriver = makeHistoryDriver(createServerHistory())
      const router = makeRouterDriver(historyDriver)(Observable.from(routes))
      const {fullPath$, dispose} = router
          .path('/some').path('/nested').define(defintion)

      dispose()
      fullPath$.subscribe(done.fail)
      setTimeout(done, 10)
    })
  })

  describe('createRouter', () => {
    describe('path()', () => {
      it('should return an object with `path` `define` `observable` ' +
        '`createHref` and `dispose`',
        () => {
          const history$ =
            makeHistoryDriver(createServerHistory())(Observable.just('/'))
          const router = createRouter(history$).path('/')
          assert.notStrictEqual(router.path, null)
          assert.strictEqual(typeof router.path, 'function')
          assert.notStrictEqual(router.define, null)
          assert.strictEqual(typeof router.define, 'function')
          assert.notStrictEqual(router.observable, null)
          assert.strictEqual(typeof router.observable, 'object')
          assert.strictEqual(typeof router.observable.subscribe, 'function')
          assert.notStrictEqual(router.createHref, null)
          assert.strictEqual(typeof router.createHref, 'function')
          assert.notStrictEqual(router.dispose, null)
          assert.strictEqual(typeof router.dispose, 'function')
        })

      it('should filter the history$', () => {
        const routes = [
          '/somewhere/else',
          '/path/that/is/correct',
        ]
        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
          .path('/path')

        router.observable.subscribe((location) => {
          assert.notStrictEqual(location.pathname, '/somewhere/else')
          assert.strictEqual(location.pathname, '/path/that/is/correct')
        })
      })

      it('multiple path()s should filter the history$', () => {
        const routes = [
          '/the/wrong/path',
          '/some/really/really/deeply/nested/route/that/is/correct',
          '/some/really/really/deeply/nested/incorrect/route',
        ]

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
          .path('/some').path('/really').path('/really').path('/deeply')
          .path('/nested').path('/route').path('/that')

        router.observable.subscribe(({pathname}) => {
          assert.strictEqual(pathname,
            '/some/really/really/deeply/nested/route/that/is/correct')
        })
      })

      it('should create a proper path using createHref()', () => {
        const routes = [
          '/the/wrong/path',
          '/some/really/really/deeply/nested/route/that/is/correct',
          '/some/really/really/deeply/nested/incorrect/route',
        ]

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
          .path('/some').path('/really').path('/really').path('/deeply')
          .path('/nested').path('/route').path('/that')

        router.observable.subscribe(({pathname}) => {
          assert.strictEqual(pathname,
            '/some/really/really/deeply/nested/route/that/is/correct')
          assert.strictEqual(
            router.createHref('/is/correct'),
            '/some/really/really/deeply/nested/route/that/is/correct')
        })
      })

      it('should not work after being disposed', done => {
        const routes = [
          '/the/wrong/path',
          '/some/really/really/deeply/nested/route/that/is/correct',
          '/some/really/really/deeply/nested/incorrect/route',
        ]

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
          .path('/some').path('/really').path('/really').path('/deeply')
          .path('/nested').path('/route').path('/that')

        router.dispose()
        router.observable.subscribe(done.fail)
        setTimeout(done, 10)
      })
    })

    describe('define()', () => {
      it('should return an object with `path$` `value$` `fullPath$` ' +
        '`createHref` and `dispose`',
        () => {
          const history$ =
            makeHistoryDriver(createServerHistory())(Observable.from(['/']))
          const router = createRouter(history$)
            .define({})
          assert.notStrictEqual(router.path$, null)
          assert.strictEqual(typeof router.path$, 'object')
          assert.strictEqual(typeof router.path$.subscribe, 'function')
          assert.notStrictEqual(router.value$, null)
          assert.strictEqual(typeof router.value$, 'object')
          assert.strictEqual(typeof router.value$.subscribe, 'function')
          assert.notStrictEqual(router.fullPath$, null)
          assert.strictEqual(typeof router.fullPath$, 'object')
          assert.strictEqual(typeof router.fullPath$.subscribe, 'function')
          assert.notStrictEqual(router.createHref, null)
          assert.strictEqual(typeof router.createHref, 'function')
          assert.notStrictEqual(router.dispose, null)
          assert.strictEqual(typeof router.dispose, 'function')
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

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
        const {path$, value$, fullPath$} =
          router.define(defintion)

        path$.subscribe((path) => {
          assert.strictEqual(path, '/some/route')
        })

        value$.subscribe((value) => {
          assert.strictEqual(value, 123)
        })

        fullPath$.subscribe(fullPath => {
          assert.strictEqual(fullPath, '/some/route')
          setTimeout(done, 10)
        })
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

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
        const {path$, value$, fullPath$} = router
            .path('/some').path('/nested').define(defintion)

        path$.subscribe((path) => {
          assert.strictEqual(path, '/correct/route')
        })

        value$.subscribe((value) => {
          assert.strictEqual(value, 123)
        })

        fullPath$.subscribe(fullPath => {
          assert.strictEqual(fullPath, '/some/nested/correct/route')
          setTimeout(done, 10)
        })
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

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
        const {path$, value$, fullPath$} = router
            .path('/some').path('/nested').define(definition)

        path$.subscribe((path) => {
          assert.strictEqual(path, '/incorrect/route')
        })

        value$.subscribe((value) => {
          assert.strictEqual(value, 999)
        })

        fullPath$.subscribe(fullPath => {
          assert.strictEqual(fullPath, '/some/nested/incorrect/route')
          setTimeout(done, 10)
        })
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

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
        const {fullPath$, createHref} = router
            .path('/some').path('/nested').define(defintion)

        fullPath$.subscribe(pathname => {
          assert.strictEqual(pathname, '/some/nested/correct/route')
          assert.strictEqual(createHref('/correct/route'), pathname)
          setTimeout(done, 5)
        })
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

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
        const {path$, fullPath$} = router
            .path('/some').path('/nested').define(defintion)

        path$.subscribe(pathname => {
          assert.strictEqual(pathname, '/correct/route')
        })

        fullPath$.subscribe(pathname => {
          assert.strictEqual(pathname, '/some/nested/correct/route/partial')
          setTimeout(done, 5)
        })
      })

      it('should not work after being disposed', done => {
        const defintion = {
          '/correct': {
            '/route': 123,
          },
          '*': 999,
        }

        const routes = [
          '/wrong/path',
          '/some/nested/correct/route',
          '/wrong/route',
        ]

        const history$ =
          makeHistoryDriver(createServerHistory())(Observable.from(routes))
        const router = createRouter(history$)
        const {fullPath$, dispose} = router
            .path('/some').path('/nested').define(defintion)

        dispose()
        fullPath$.subscribe(done.fail)
        setTimeout(done, 10)
      })
    })
  })
})
