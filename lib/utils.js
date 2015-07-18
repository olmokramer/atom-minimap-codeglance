'use babel';
import { Disposable } from 'atom';

export function addEventListener(element, eventType, callback) {
  element.addEventListener(eventType, callback);
  return new Disposable(function onDispose() {
    element.removeEventListener(eventType, callback);
  });
}

export function addEventListenerOnce(element, eventType, callback) {
  var disposable = addEventListener(element, eventType, event => {
    callback(event);
    disposable.dispose();
  });
}
