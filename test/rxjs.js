/* eslint max-nested-callbacks: 0 */
/*global describe, it */
import 'symbol-observable';
import assert from 'assert';
import { setAdapt, adapt } from '@cycle/run/lib/adapt';
import { Observable, from, never, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { routerify } from '../lib';
import { makeServerHistoryDriver } from '@cycle/history';
import switchPath from 'switch-path';

describe('Cyclic Router - RxJS 6', () => {
    before(() => setAdapt(stream => from(stream)));
    describe('routerify', () => {
        it('should throw if not given a main function', () => {
            assert.throws(
                () => {
                    makeRouterDriver(null);
                },
                Error,
                /First argument to routerify must be a valid cycle app/i
            );
        });

        it('should return a function returning sinks', () => {
            const app = () => ({ router: never() });
            const augmentedApp = routerify(app, switchPath);
            const sinks = augmentedApp({ history: never() });
            assert.notStrictEqual(augmentedApp, null);
            assert.strictEqual(typeof augmentedApp, 'function');
            assert.notStrictEqual(sinks, null);
            assert.strictEqual(typeof sinks, 'object');
            assert.notStrictEqual(sinks.history, null);
            assert.strictEqual(typeof sinks.history, 'object');
            assert.strictEqual(typeof sinks.history.subscribe, 'function');
        });
    });

    describe('path()', () => {
        it(
            'should return an object with `path` `define` `observable` ' +
                '`createHref` and `dispose`',
            () => {
                const app = ({ router }) => {
                    assert.notStrictEqual(router.path, null);
                    assert.strictEqual(typeof router.path, 'function');
                    assert.notStrictEqual(router.define, null);
                    assert.strictEqual(typeof router.define, 'function');
                    assert.notStrictEqual(router.history$, null);
                    assert.strictEqual(typeof router.history$, 'object');
                    assert.strictEqual(
                        typeof router.history$.subscribe,
                        'function'
                    );
                    assert.notStrictEqual(router.createHref, null);
                    assert.strictEqual(typeof router.createHref, 'function');
                    return {};
                };
                routerify(app, switchPath)({ history: never() });
            }
        );

        it('should filter the history$', () => {
            const routes = ['/somewhere/else', '/path/that/is/correct'];

            const app = sources => {
                sources.router.path('/path').history$.subscribe(location => {
                    assert.notStrictEqual(location.pathname, '/somewhere/else');
                    assert.strictEqual(
                        location.pathname,
                        '/path/that/is/correct'
                    );
                });
                return {};
            };
            routerify(app, switchPath)({
                history: adapt(makeServerHistoryDriver()(from(routes)))
            });
        });

        it('multiple path()s should filter the history$', () => {
            const routes = [
                '/the/wrong/path',
                '/some/really/really/deeply/nested/route/that/is/correct',
                '/some/really/really/deeply/nested/incorrect/route'
            ];

            const app = sources => {
                sources.router
                    .path('/some')
                    .path('/really')
                    .path('/really')
                    .path('/deeply')
                    .path('/nested')
                    .path('/route')
                    .path('/that')
                    .history$.subscribe(({ pathname }) => {
                        assert.strictEqual(
                            pathname,
                            '/some/really/really/deeply/nested/route/that/is/correct'
                        );
                    });
                return {};
            };
            routerify(app, switchPath)({
                history: adapt(makeServerHistoryDriver()(from(routes)))
            });
        });

        it('should create a proper path using createHref()', () => {
            const routes = [
                '/the/wrong/path',
                '/some/really/really/deeply/nested/route/that/is/correct',
                '/some/really/really/deeply/nested/incorrect/route'
            ];

            const app = sources => {
                sources.router
                    .path('/some')
                    .path('/really')
                    .path('/really')
                    .path('/deeply')
                    .path('/nested')
                    .path('/route')
                    .path('/that')
                    .history$.subscribe(({ pathname }) => {
                        assert.strictEqual(
                            pathname,
                            '/some/really/really/deeply/nested/route/that/is/correct'
                        );
                        assert.strictEqual(
                            router.createHref('/is/correct'),
                            '/some/really/really/deeply/nested/route/that/is/correct'
                        );
                    });
                return {};
            };
            routerify(app, switchPath)({
                history: adapt(makeServerHistoryDriver()(from(routes)))
            });
        });
    });

    describe('define()', () => {
        it(
            'should return an object with `path$` `value$` `fullPath$` ' +
                '`createHref` and `dispose`',
            () => {
                const app = sources => {
                    const router = sources.router.define({});
                    assert.strictEqual(router instanceof Observable, true);
                    assert.strictEqual(typeof router.subscribe, 'function');
                    assert.notStrictEqual(router.createHref, null);
                    assert.strictEqual(typeof router.createHref, 'function');
                    return {};
                };
                routerify(app, switchPath)({ history: never() });
            }
        );

        it('should match routes against a definition object', done => {
            const defintion = {
                '/some': {
                    '/route': 123
                }
            };

            const app = ({ router }) => {
                const match$ = router.define(defintion);
                match$.subscribe(({ path, value, location }) => {
                    assert.strictEqual(path, '/some/route');
                    assert.strictEqual(value, 123);
                    assert.strictEqual(location.pathname, '/some/route');
                    done();
                });
                return {};
            };
            routerify(app, switchPath)({
                history: adapt(makeServerHistoryDriver()(of('/some/route')))
            });
        });

        it('should respect prior filtering by path()', done => {
            const defintion = {
                '/correct': {
                    '/route': 123
                }
            };

            const routes = ['/some/nested/correct/route'];

            const app = ({ router }) => {
                const match$ = router
                    .path('/some')
                    .path('/nested')
                    .define(defintion);
                match$.subscribe(({ path, value, location }) => {
                    assert.strictEqual(path, '/correct/route');
                    assert.strictEqual(value, 123);
                    assert.strictEqual(
                        location.pathname,
                        '/some/nested/correct/route'
                    );
                    done();
                });
                return {};
            };
            routerify(app, switchPath)({
                history: adapt(
                    makeServerHistoryDriver()(
                        of('/wrong/path', '/some/nested/correct/route').pipe(
                            delay(0)
                        )
                    )
                )
            });
        });

        it('should match a default route if one is not found', done => {
            const definition = {
                '/correct': {
                    '/route': 123
                },
                '*': 999
            };

            const app = ({ router }) => {
                const match$ = router
                    .path('/some')
                    .path('/nested')
                    .define(definition);
                match$.subscribe(({ path, value, location }) => {
                    assert.strictEqual(path, '/incorrect/route');
                    assert.strictEqual(value, 999);
                    assert.strictEqual(
                        location.pathname,
                        '/some/nested/incorrect/route'
                    );
                    done();
                });
                return { router: of('/wrong/path') };
            };
            routerify(app, switchPath)({
                history: adapt(
                    makeServerHistoryDriver()(
                        of('/wrong/route', '/some/nested/incorrect/route').pipe(
                            delay(0)
                        )
                    )
                )
            });
        });

        it('should create a proper href using createHref()', done => {
            const definition = {
                '/correct': {
                    '/route': 123
                },
                '*': 999
            };

            const app = ({ router }) => {
                const match$ = router
                    .path('/some')
                    .path('/nested')
                    .define(definition);

                assert(match$.createHref('/hello'), '/some/nested/hello');
                match$.subscribe(({ path, value, location, createHref }) => {
                    assert.strictEqual(path, '/incorrect/route');
                    assert.strictEqual(value, 999);
                    assert.strictEqual(
                        location.pathname,
                        '/some/nested/incorrect/route'
                    );
                    //assert.strictEqual(location.pathname, createHref('/incorrect/route'))
                    done();
                });
                return { router: of('/wrong/path') };
            };
            routerify(app, switchPath)({
                history: adapt(
                    makeServerHistoryDriver()(
                        of('/wrong/route', '/some/nested/incorrect/route').pipe(
                            delay(0)
                        )
                    )
                )
            });
        });

        it('should match partials', done => {
            const defintion = {
                '/correct': {
                    '/route': 123
                },
                '*': 999
            };

            const app = ({ router }) => {
                const match$ = router
                    .path('/some')
                    .path('/nested')
                    .define(defintion);
                match$.subscribe(
                    ({ path, location: { pathname }, createHref }) => {
                        assert.strictEqual(path, '/correct/route');
                        assert.strictEqual(
                            pathname,
                            '/some/nested/correct/route/partial'
                        );
                        done();
                    }
                );

                return { router: of('/wrong/path') };
            };
            routerify(app, switchPath)({
                history: adapt(
                    makeServerHistoryDriver()(
                        of('/some/nested/correct/route/partial').pipe(delay(0))
                    )
                )
            });
        });
    });
});
