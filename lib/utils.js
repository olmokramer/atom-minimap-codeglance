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

export function getConfig(key, namespace = 'minimap-codeglance') {
  return atom.config.get(`${namespace}.${key}`);
}

export function observeConfig(key, namespace, cb) {
  if(typeof namespace == 'function') {
    cb = namespace;
    namespace = 'minimap-codeglance';
  }
  return atom.config.observe(`${namespace}.${key}`, cb);
}

export function getView(model) {
  return atom.views.getView(model);
}
