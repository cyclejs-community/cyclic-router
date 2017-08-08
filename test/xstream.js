/* eslint max-nested-callbacks: 0 */
/*global describe, it */
import assert from 'assert';
import { setAdapt } from '@cycle/run/lib/adapt';
import xs from 'xstream';
import delay from 'xstream/extra/delay';
import { routerify } from '../lib';
import { makeServerHistoryDriver } from '@cycle/history';
import switchPath from 'switch-path';

describe('Cyclic Router - XStream', () => {
    before(() => setAdapt(stream => stream));
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
            const app = () => ({ router: xs.never() });
            const augmentedApp = routerify(app, switchPath);
            const sinks = augmentedApp({ history: xs.never() });
            assert.notStrictEqual(augmentedApp, null);
            assert.strictEqual(typeof augmentedApp, 'function');
            assert.notStrictEqual(sinks, null);
            assert.strictEqual(typeof sinks, 'object');
            assert.notStrictEqual(sinks.history, null);
            assert.strictEqual(typeof sinks.history, 'object');
            assert.strictEqual(typeof sinks.history.addListener, 'function');
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
                        typeof router.history$.addListener,
                        'function'
                    );
                    assert.notStrictEqual(router.createHref, null);
                    assert.strictEqual(typeof router.createHref, 'function');
                    return {};
                };
                routerify(app, switchPath)({ history: xs.never() });
            }
        );

        it('should filter the history$', () => {
            const routes = ['/somewhere/else', '/path/that/is/correct'];

            const app = sources => {
                sources.router.path('/path').history$.addListener({
                    next: location => {
                        assert.notStrictEqual(
                            location.pathname,
                            '/somewhere/else'
                        );
                        assert.strictEqual(
                            location.pathname,
                            '/path/that/is/correct'
                        );
                    },
                    error: () => {},
                    complete: () => {}
                });
                return {};
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(xs.fromArray(routes))
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
                    .history$.addListener({
                        next: ({ pathname }) => {
                            assert.strictEqual(
                                pathname,
                                '/some/really/really/deeply/nested/route/that/is/correct'
                            );
                        },
                        error: () => {},
                        complete: () => {}
                    });
                return {};
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(xs.fromArray(routes))
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
                    .history$.addListener({
                        next: ({ pathname }) => {
                            assert.strictEqual(
                                pathname,
                                '/some/really/really/deeply/nested/route/that/is/correct'
                            );
                            assert.strictEqual(
                                router.createHref('/is/correct'),
                                '/some/really/really/deeply/nested/route/that/is/correct'
                            );
                        },
                        error: () => {},
                        complete: () => {}
                    });
                return {};
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(xs.fromArray(routes))
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
                    assert.strictEqual(router instanceof xs, true);
                    assert.strictEqual(typeof router.addListener, 'function');
                    assert.notStrictEqual(router.createHref, null);
                    assert.strictEqual(typeof router.createHref, 'function');
                    return {};
                };
                routerify(app, switchPath)({ history: xs.never() });
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
                match$.addListener({
                    next: ({ path, value, location }) => {
                        assert.strictEqual(path, '/some/route');
                        assert.strictEqual(value, 123);
                        assert.strictEqual(location.pathname, '/some/route');
                        done();
                    },
                    error: () => {},
                    complete: () => {}
                });
                return {};
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(xs.of('/some/route'))
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
                match$.addListener({
                    next: ({ path, value, location }) => {
                        assert.strictEqual(path, '/correct/route');
                        assert.strictEqual(value, 123);
                        assert.strictEqual(
                            location.pathname,
                            '/some/nested/correct/route'
                        );
                        done();
                    },
                    error: () => {},
                    complete: () => {}
                });
                return {};
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(
                    xs
                        .of('/wrong/path', '/some/nested/correct/route')
                        .compose(delay(0))
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
                match$.addListener({
                    next: ({ path, value, location }) => {
                        assert.strictEqual(path, '/incorrect/route');
                        assert.strictEqual(value, 999);
                        assert.strictEqual(
                            location.pathname,
                            '/some/nested/incorrect/route'
                        );
                        done();
                    },
                    error: () => {},
                    complete: () => {}
                });
                return { router: xs.of('/wrong/path') };
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(
                    xs
                        .of('/wrong/route', '/some/nested/incorrect/route')
                        .compose(delay(0))
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
                match$.addListener({
                    next: ({ path, value, location, createHref }) => {
                        assert.strictEqual(path, '/incorrect/route');
                        assert.strictEqual(value, 999);
                        assert.strictEqual(
                            location.pathname,
                            '/some/nested/incorrect/route'
                        );
                        //assert.strictEqual(location.pathname, createHref('/incorrect/route'))
                        done();
                    },
                    error: () => {},
                    complete: () => {}
                });
                return { router: xs.of('/wrong/path') };
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(
                    xs
                        .of('/wrong/route', '/some/nested/incorrect/route')
                        .compose(delay(0))
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
                match$.addListener({
                    next: ({ path, location: { pathname }, createHref }) => {
                        assert.strictEqual(path, '/correct/route');
                        assert.strictEqual(
                            pathname,
                            '/some/nested/correct/route/partial'
                        );
                        done();
                    },
                    error: () => {},
                    complete: () => {}
                });

                return { router: xs.of('/wrong/path') };
            };
            routerify(app, switchPath)({
                history: makeServerHistoryDriver()(
                    xs
                        .of('/some/nested/correct/route/partial')
                        .compose(delay(0))
                )
            });
        });
    });
});
