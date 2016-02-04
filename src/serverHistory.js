import {createLocation} from './util'

function ServerHistory() {}

ServerHistory.prototype.listen = function listen(listener) {
  this.listener = listener
}

ServerHistory.prototype.push = function push(location) {
  const listener = this.listener
  if (!listener) {
    throw new Error('There is no active listener')
  }
  listener(createLocation(location))
}

ServerHistory.prototype.createHref = function createHref(path) {
  return path
}

ServerHistory.prototype.createLocation = createLocation

function createServerHistory() {
  return new ServerHistory()
}

export {createServerHistory}
