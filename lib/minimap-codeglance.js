'use babel';
import 'object-assign-shim';
import {CompositeDisposable, Point} from 'atom';
import minimapCodeglanceElement from './minimap-codeglance-element.js';
import domListener from './dom-listener.js';

var prototype = {
  initialize() {
    this.element = minimapCodeglanceElement();
    this.disposables = new CompositeDisposable(
      atom.config.observe('minimap-codeglance.showLineNumbers', showLineNumbers =>
        this.element.updateLineNumbers(showLineNumbers)
      ),
      atom.config.observe('minimap.displayMinimapOnLeft', showOnLeft =>
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

    var minimapWidth = `${atom.views.getView(this.minimap).clientWidth}px`;
    Object.assign(this.element.style, {
      left: showOnLeft ? minimapWidth : 0,
      right: showOnLeft ? 0 : minimapWidth,
    });

    this.fixTypeWriterEditor();
  },

  // support for typewriter (https://atom.io/packages/typewriter)
  fixTypeWriterEditor() {
    var textEditorView = this.getTextEditorView();
    var isTypeWriter = textEditorView.getAttribute('data-typewriter');

    if(isTypeWriter) {
      this.element.style.margin = getComputedStyle(textEditorView).margin;

      var hideLineNumbers = atom.config.get('minimap-codeglance.hideLineNumbersInTypeWriter');
      if(hideLineNumbers) this.element.updateLineNumbers(false, 0);
    } else {
      this.element.style.margin = '';
      this.element.updateLineNumbers(atom.config.get('minimap-codeglance.showLineNumbers'));
    }
  },

  disableDuringMouseDown() {
    if(this.disabled) return;
    this.disabled = true;
    this.element.hide();
    domListener(document.body, 'mouseup', () =>
      this.disabled = false
    , {once: true});
  },

  addMinimap(minimap) {
    var minimapView = atom.views.getView(minimap);
    var textEditorView = atom.views.getView(minimap.getTextEditor());

    var minimapDisposable = new CompositeDisposable(
      domListener(minimapView, 'mouseenter', () =>
        this.setCurrentMinimap(minimap)
      ),
      domListener(minimapView, 'mousemove', event => {
        if(this.minimap != minimap) this.setCurrentMinimap(minimap);
        this.scrollToMinimapOffset(event);
      }),
      domListener(minimapView, 'mouseleave', () =>
        this.element.hide()
      ),
      domListener(textEditorView, 'mousedown', () =>
        this.disableDuringMouseDown()
      ),
      minimap.onDidDestroy(() => {
        this.disposables.remove(minimapDisposable);
        minimapDisposable.dispose();
        minimapDisposable = null;

        if(this.getTextEditor() == minimap.getTextEditor()) {
          this.element.hide();
        }
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
    if(!this.minimap) return;
    return this.minimap.getTextEditor();
  },

  getTextEditorView() {
    return atom.views.getView(this.getTextEditor());
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
    var lineHeight = this.minimap.getCharHeight() + this.minimap.getInterline();
    var row = firstVisibleScreenRow + Math.floor(offsetY / lineHeight);
    var columnWidth = this.minimap.getCharWidth();
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
