import {makePathFilter} from './pathFilter'
import {makeDefinitionResolver} from './definitionResolver'
import {makeCreateHref} from './util'

function createAPI(history$, namespace, createHref) {
  const replayedHistory$ = history$.replay(1)
  const disposable = replayedHistory$.connect()
  return {
    path: makePathFilter(replayedHistory$, namespace, createHref),
    define: makeDefinitionResolver(replayedHistory$, namespace, createHref),
    observable: replayedHistory$,
    createHref: makeCreateHref(namespace, createHref),
    dispose: () => disposable.dispose(),
  }
}

export {createAPI}
