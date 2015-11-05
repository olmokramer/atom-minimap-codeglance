'use babel'
import {Disposable} from 'atom'

export default function domListener(el, type, cb, {useCapture, delegationTarget, once} = {}) {
  if(!(el instanceof EventTarget))
    throw new TypeError('Failed to create DOMEventListener: parameter 1 is not of type EventTarget')

  function wrapper(event) {
    if(delegationTarget) {
      target = event.target.closest(delegationTarget)
      if(el.contains(target)) {
        if(once) disposable.dispose()
        cb.call(target, event)
      }
    } else {
      if(once) disposable.dispose()
      cb.call(el, event)
    }
  }

  el.addEventListener(type, wrapper, useCapture)
  var disposable = new Disposable(() =>
    el.removeEventListener(type, wrapper, useCapture)
  )

  return disposable
}
