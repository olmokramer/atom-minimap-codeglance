'use babel';
import {
  CompositeDisposable,
  Point,
} from 'atom';

import minimapCodeglanceElement from './minimap-codeglance-element.js';

import {
  addEventListener,
  addEventListenerOnce,
} from './utils.js';

var prototype = {
  initialize() {
    this.element = minimapCodeglanceElement();
    this.disposables = new CompositeDisposable();
  },

  destroy() {
    this.element.destroy();
    this.disposables.dispose();
    [ this.element, this.disposables, this.minimap ] = [];
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
    var minimapView = atom.views.getView(minimap);

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
      addEventListener(atom.views.getView(minimap.getTextEditor()), 'mousedown', () =>
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
    }

    this.element.update(this.getTextEditor());
  },

  getTextEditor() {
    return this.minimap.getTextEditor();
  },

  getTextEditorRoot() {
    var textEditorView = atom.views.getView(this.getTextEditor());
    return textEditorView.shadowRoot || textEditorView;
  },

  attachElement() {
    var textEditorRoot = this.getTextEditorRoot();
    textEditorRoot.querySelector('.editor-contents--private').appendChild(this.element);
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
    this.element.translateY(offsetY);
  },

  screenPositionForMinimapOffset(offsetX, offsetY) {
    var firstVisibleScreenRow = this.minimap.getFirstVisibleScreenRow();
    var lineHeight = this.minimap.charHeight + this.minimap.interline;
    var row = firstVisibleScreenRow + Math.floor(offsetY / lineHeight);
    var columnWidth = this.minimap.charWidth;
    var column = Math.floor(offsetX / columnWidth);
    return new Point(row, column);
  },
};

export default function minimapCodeglance() {
  return Object.create(prototype);
}
