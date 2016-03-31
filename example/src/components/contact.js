import {Observable} from 'rx'
import {div, h2, ul, li} from 'cycle-snabbdom'

function Contact(sources) {
  const getContacts$ = Observable.just({})
          .map(() => ({
            url: '/contacts.json',
            method: 'GET',
          }))
  const contacts$ = sources.HTTP
          .mergeAll()
          .map(x => x.body)
          .startWith([])
  return {DOM: contacts$.map(xs => div([
    h2({style: {padding: '1em'}}, 'Contact Stuffs'),
    ul({},
       xs.map(x => li({}, `${x.name}: ${x.email}`))
      ),
  ])),
          HTTP: getContacts$}
}

export default Contact
