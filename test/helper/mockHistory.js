import {createLocation} from 'history'

function createMockHistory(paths = [], timeout = 1) {
  return {
    createHref: path => path,
    listen: listener => {
      setTimeout(() => {
        paths.forEach(p => listener(createLocation(p)))
      }, timeout)
    },
  }
}

export {createMockHistory}
