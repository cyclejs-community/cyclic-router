function supportsHistory() {
  const ua = navigator.userAgent

  if ((ua.indexOf(`Android 2.`) !== -1 ||
      ua.indexOf(`Android 4.0`) !== -1) &&
      ua.indexOf(`Mobile Safari`) !== -1 &&
      ua.indexOf(`Chrome`) === -1 &&
      ua.indexOf(`Windows Phone`) === -1)
  {
    {return false }
  }

  if (typeof window !== `undefined`) {
    return window.history && `pushState` in window.history
  }
}

function splitPath(path) {
  return path.split('/').filter(p => p.length > 0)
}

function filterPath(pathParts, namespace) {
  return pathParts.filter(part => namespace.indexOf(part) < 0).join('/')
}

const startsWith = (param, value) => param[0] === value

function makeCreateHref(namespace, createHref) {
  return function _createHref(path) {
    const fullPath = `${namespace.join('/')}${path}`
    if (startsWith(fullPath, '/') || startsWith('#/')) {
      return createHref(fullPath)
    }
    return createHref('/' + fullPath)
  }
}

export {supportsHistory, splitPath, filterPath, makeCreateHref}
