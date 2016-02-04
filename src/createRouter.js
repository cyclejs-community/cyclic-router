import {createAPI} from './api'

function createRouter(history$) {
  return createAPI(history$, [], history$.createHref)
}

export {createRouter}
