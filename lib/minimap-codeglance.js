'use babel';
import { CompositeDisposable, Point } from 'atom';
import minimapCodeglanceElement from './minimap-codeglance-element.js';
import { addEventListener, addEventListenerOnce } from './utils.js';

var prototype = {
  initialize() {
    this.element = minimapCodeglanceElement();
    this.disposables = new CompositeDisposable(
      atom.config.observe('minimap-codeglance.numberOfLines', numberOfLines =>
        this.numberOfLines = numberOfLines
      ),
      atom.config.observe('minimap-codeglance.showLineNumbers', showLineNumbers =>
        showLineNumbers ? this.element.showLineNumbers() : this.element.hideLineNumbers()
      ),
      atom.config.observe('minimap-codeglance.codeHighlighting', codeHighlighting =>
        this.codeHighlighting = codeHighlighting
      ),
      atom.config.observe('minimap-codeglance.softWrap', softWrapMode =>
        this.softWrapMode = softWrapMode
      )
    );
  },

  destroy() {
    this.element.destroy();
    this.disposables.dispose();
    [this.element, this.disposables, this.minimap] = [];
  },

  addMinimap(minimap) {
    var minimapView = atom.views.getView(minimap);

    var minimapDisposable = new CompositeDisposable(
      addEventListener(minimapView, 'mouseenter', () =>
        this.setCurrentMinimap(minimap)
      ),
      addEventListener(minimapView, 'mousemove', event =>
        this.scrollToMousePosition(event)
      ),
      addEventListener(minimapView, 'mouseleave', () =>
        this.element.hide()
      ),
      addEventListener(document.body, 'mousedown', () =>
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
    this.minimap = minimap;
    this.attachElement();
    this.updateNumberOfLines();

    this.element.setText('');
    this.updateGrammar();
    this.updateSoftWrapped();
    this.updateText();
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

  detachElement() {
    var parentNode = this.element.parentNode;
    if(parentNode) parentNode.remove(this.element);
  },

  updateNumberOfLines() {
    this.element.setNumberOfLines(this.numberOfLines);
  },

  updateGrammar() {
    this.element.setGrammar(this.codeHighlighting ?
        this.getTextEditor().getGrammar() :
        atom.grammars.grammarForScopeName('text.plain.null-grammar'));
  },

  updateSoftWrapped() {
    this.element.setSoftWrapped(this.getSoftWrapped());
  },

  getSoftWrapped() {
    switch(this.softWrapMode.split(' ')[0]) {
      default:
      case 'editor':
        return this.getTextEditor().isSoftWrapped();
      case 'always':
        return true;
      case 'never':
        return false;
    }
  },

  updateText() {
    this.element.setText(this.getTextEditor().getText());
  },

  scrollToMousePosition({offsetX, offsetY}) {
    if(this.disabled || !this.minimap) return;
    var screenPosition = this.screenPositionForOffset({offsetX, offsetY});

    if(screenPosition.row > this.getTextEditor().getLastScreenRow()) {
      return void this.element.hide();
    }

    this.element.show();
    this.element.scrollToBufferPosition(
      this.getTextEditor().bufferPositionForScreenPosition(screenPosition)
    );
    this.element.translateY(offsetY);
  },

  screenPositionForOffset({offsetX, offsetY}) {
    var firstVisibleScreenRow = this.minimap.getFirstVisibleScreenRow();
    var lineHeight = this.minimap.charHeight + this.minimap.interline;
    var row = firstVisibleScreenRow + Math.floor(offsetY / lineHeight);
    var columnWidth = this.minimap.charWidth;
    var column = Math.floor(offsetX / columnWidth);
    return new Point(row, column);
  },

  disableDuringMouseDown() {
    if(this.disabled) return;
    this.disabled = true;

    this.element.hide();
    addEventListenerOnce(document.body, 'mouseup', () =>
      this.disabled = false
    );
  },
};

export default function minimapCodeglance() {
  return Object.create(prototype);
}
