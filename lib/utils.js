'use babel';
import { Disposable } from 'atom';

export function addEventListener(element, eventType, callback) {
  element.addEventListener(eventType, callback);
  return new Disposable(function onDispose() {
    element.removeEventListener(eventType, callback);
  });
}
