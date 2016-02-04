import {createLocation} from './util'

function ServerHistory() {
  this.listeners = []
}

ServerHistory.prototype.listen = function listen(listener) {
  this.listeners.push(listener)
}

ServerHistory.prototype.push = function push(location) {
  const listeners = this.listeners
  if (!listeners || listeners.length === 0) {
    throw new Error('There is no active listener')
  }
  listeners.forEach(l => l(createLocation(location)))
}

ServerHistory.prototype.createHref = function createHref(path) {
  return path
}

ServerHistory.prototype.createLocation = createLocation

function createServerHistory() {
  return new ServerHistory()
}

export {createServerHistory}
