'use babel';
import { Disposable, CompositeDisposable } from 'atom';
import MinimapCodeglanceElement from './minimap-codeglance-element.js';

// private

// the minimap service object
var minimapService;

// minimap plugin activation state
var active = false;

// subscriptions
var disposables;

// the codeglance element
var codeglanceView;

// create the codeglance view and return a
// disposable that destroys it on disposal
function createView() {
  codeglanceView = new MinimapCodeglanceElement();

  return new Disposable(function onDispose() {
    codeglanceView.destroy();
    codeglanceView = null;
  });
}

// activate codeglance for the new minimap
function onDidCreateMinimap(minimap) {
  var minimapView = atom.views.getView(minimap);
  var isDragging = false;

  var minimapDisposable = new CompositeDisposable(
    addEventListener(minimapView, 'mouseenter', function onMouseEnter() {
      codeglanceView.setMinimap(minimap);
    }),
    addEventListener(minimapView, 'mousemove', function onMouseMove({offsetX: x, offsetY: y}) {
      if(!isDragging) codeglanceView.showLinesAtOffset({x, y});
    }),
    addEventListener(minimapView, 'mouseleave', function onMouseLeave() {
      codeglanceView.hide();
    }),
    addEventListener(minimapView, 'mousedown', function onMouseDown() {
      isDragging = true;
      codeglanceView.hide();

      var mouseUpDisposable = addEventListener(document.body, 'mouseup', function onMouseUp() {
        isDragging = false;
        mouseUpDisposable.dispose();
        mouseUpDisposable = null;
      });
    }),
    minimap.onDidDestroy(function onDestroyMinimap() {
      disposables.remove(minimapDisposable);
      minimapDisposable.dispose();
      minimapdisposable = null;
    })
  );

  disposables.add(minimapDisposable);
}

// return a disposable that removes the
// event handler on disposal
function addEventListener(el, event, cb) {
  el.addEventListener(event, cb);
  return new Disposable(function onDispose() {
    el.removeEventListener(event, cb);
  });
}

// public

var config = {
  numberOfLines: {
    type: 'integer',
    default: 5,
    minimum: 1,
    order: 1
  },
  showLineNumbers: {
    type: 'boolean',
    default: true,
    order: 2
  },
  codeHighlighting: {
    type: 'boolean',
    default: true,
    order: 3
  }
};
export { config };

export function activate() {}

export function deactivate() {
  deactivatePlugin();
  minimap.unregisterPlugin('codeglance');
  minimap = null;
}

export function consumeMinimapServiceV1(service) {
  minimapService = service;
  minimapService.registerPlugin('codeglance', MinimapCodeglance);
}

export function isActive() {
  return active;
}

export function activatePlugin() {
  if(active) return;
  active = true;

  disposables = new CompositeDisposable();
  disposables.add(
    createView(),
    minimapService.observeMinimaps(onDidCreateMinimap)
  );
}

export function deactivatePlugin() {
  if(!active) return;
  active = false;

  disposables.dispose();
  disposables = null;
}

var MinimapCodeglance;
export default MinimapCodeglance = { config, activate, deactivate, consumeMinimapServiceV1, isActive, activatePlugin, deactivatePlugin }
