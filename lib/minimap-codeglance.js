'use babel';
import 'object-assign-shim';

import {
  CompositeDisposable,
  Point,
} from 'atom';

import minimapCodeglanceElement from './minimap-codeglance-element.js';

import {
  addEventListener,
  addEventListenerOnce,
  observeConfig,
  getView,
} from './utils.js';

var prototype = {
  initialize() {
    this.element = minimapCodeglanceElement();
    this.disposables = new CompositeDisposable(
      observeConfig('showLineNumbers', showLineNumbers =>
        this.element.updateLineNumbers(showLineNumbers)
      ),
      observeConfig('displayMinimapOnLeft', 'minimap', showOnLeft =>
        this.updatePosition(showOnLeft)
      ),
    );
  },

  destroy() {
    this.element.destroy();
    this.disposables.dispose();
    [ this.element, this.disposables, this.minimap ] = [];
  },

  updatePosition(showOnLeft) {
    if(!this.minimap) return;

    var minimapWidth = `${getView(this.minimap).clientWidth}px`;
    Object.assign(this.element.style, {
      left: showOnLeft ? minimapWidth : 0,
      right: showOnLeft ? 0 : minimapWidth,
    });
  },

  disableDuringMouseDown() {
    if(this.disabled) return;
    this.disabled = true;
    this.element.hide();
    addEventListenerOnce(document.body, 'mouseup', () => {
      this.disabled = false;
    });
  },

  addMinimap(minimap) {
    var minimapView = getView(minimap);
    var textEditorView = getView(minimap.getTextEditor());

    var minimapDisposable = new CompositeDisposable(
      addEventListener(minimapView, 'mouseenter', () =>
        this.setCurrentMinimap(minimap)
      ),
      addEventListener(minimapView, 'mousemove', event =>
        this.scrollToMinimapOffset(event)
      ),
      addEventListener(minimapView, 'mouseleave', () =>
        this.element.hide()
      ),
      addEventListener(textEditorView, 'mousedown', () =>
        this.disableDuringMouseDown()
      ),
      minimap.onDidDestroy(() => {
        this.disposables.remove(minimapDisposable);
        minimapDisposable.dispose();
        minimapDisposable = null;
      }),
    );

    this.disposables.add(minimapDisposable);
  },

  setCurrentMinimap(minimap) {
    if(this.minimap != minimap) {
      this.minimap = minimap;
      this.attachElement();
      this.updatePosition();
    }

    this.element.update(this.getTextEditor());
  },

  getTextEditor() {
    return this.minimap.getTextEditor();
  },

  getTextEditorView() {
    return getView(this.getTextEditor());
  },

  attachElement() {
    this.getTextEditorView().parentNode.appendChild(this.element);
  },

  scrollToMinimapOffset({offsetX, offsetY}) {
    if(this.disabled || !this.minimap) return;
    var screenPosition = this.screenPositionForMinimapOffset(offsetX, offsetY);

    if(screenPosition.row > this.getTextEditor().getLastScreenRow()) {
      return void this.element.hide();
    }

    this.element.show();
    this.element.scrollToBufferPosition(
      this.getTextEditor().bufferPositionForScreenPosition(screenPosition)
    );
    this.translateY(offsetY);
  },

  screenPositionForMinimapOffset(offsetX, offsetY) {
    var firstVisibleScreenRow = this.minimap.getFirstVisibleScreenRow();
    var lineHeight = this.minimap.charHeight + this.minimap.interline;
    var row = firstVisibleScreenRow + Math.floor(offsetY / lineHeight);
    var columnWidth = this.minimap.charWidth;
    var column = Math.floor(offsetX / columnWidth);
    return new Point(row, column);
  },

  translateY(offsetY) {
    var codeglanceHeight = this.element.clientHeight;
    var textEditorHeight = this.getTextEditorView().clientHeight;

    offsetY -= codeglanceHeight / 2;
    offsetY = Math.round(offsetY);
    offsetY = Math.max(0, offsetY);
    offsetY = Math.min(textEditorHeight - codeglanceHeight, offsetY);
    requestAnimationFrame(() => this.element.style.transform = `translateY(${offsetY}px)`);
  },
};

export default function minimapCodeglance() {
  return Object.create(prototype);
}
