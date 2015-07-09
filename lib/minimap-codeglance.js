'use babel';
import { CompositeDisposable, Point } from 'atom';
import { addEventListener, addEventListenerOnce } from './utils.js';

var MinimapCodeglanceElement;

var MinimapCodeglance = {
  initialize() {
    if(!MinimapCodeglanceElement) MinimapCodeglanceElement = require('./minimap-codeglance-element.js');
    this.element = new MinimapCodeglanceElement();
    this.disposables = new CompositeDisposable();
    this.observeConfig();
    return this;
  },

  destroy() {
    this.element.destroy();
    this.disposables.dispose();
    [this.element, this.disposables, this.minimap] = [];
  },

  observeConfig() {
    this.disposables.add(
      atom.config.observe('minimap-codeglance.numberOfLines', numberOfLines => this.numberOfLines = numberOfLines),
      atom.config.observe('minimap-codeglance.showLineNumbers', showLineNumbers => this.setShowLineNumbers(showLineNumbers))
    );
  },

  setShowLineNumbers(showLineNumbers) {
    this.element[showLineNumbers ? 'showLineNumbers' : 'hideLineNumbers']();
  },

  addMinimap(minimap) {
    var minimapView = atom.views.getView(minimap);

    var minimapDisposable = new CompositeDisposable(
      addEventListener(minimapView, 'mouseenter', () => this.setCurrentMinimap(minimap)),
      addEventListener(minimapView, 'mousemove', (event) => this.scrollToMousePosition(event)),
      addEventListener(minimapView, 'mouseleave', () => this.element.hide()),
      addEventListener(minimapView, 'mousedown', () => this.onStartDragMinimap()),
      minimap.onDidDestroy(() => {
        this.disposables.remove(minimapDisposable);
        minimapDisposable.dispose();
        minimapDisposable = null;
      })
    );

    this.disposables.add(minimapDisposable);
  },

  setCurrentMinimap(minimap) {
    this.minimap = minimap;
    this.attachElement();
    this.updateDimensions();

    this.element.setText('');
    this.updateGrammar();
    this.updateSoftWrapped();
    this.updateText();
  },

  getTextEditor() {
    return this.minimap.getTextEditor();
  },

  attachElement() {
    var textEditorView = atom.views.getView(this.getTextEditor());
    textEditorView.rootElement.querySelector('.editor-contents--private').appendChild(this.element);
  },

  detachElement() {
    if(this.element.parentNode) this.element.parentNode.remove(this.element);
  },

  updateDimensions() {
    this.element.setNumberOfLines(this.numberOfLines);
  },

  updateGrammar() {
    if(atom.config.get('minimap-codeglance.codeHighlighting')) {
      var grammar = this.getTextEditor().getGrammar();
    } else {
      var grammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');
    }
    this.element.setGrammar(grammar);
  },

  updateSoftWrapped() {
    var softWrapped = this.getTextEditor().isSoftWrapped();
    this.element.setSoftWrapped(softWrapped);
  },

  updateText() {
    var text = this.getTextEditor().getText();
    this.element.setText(text);
  },

  scrollToMousePosition({offsetX, offsetY}) {
    if(this.disabled) return;
    var screenPosition = this.screenPositionForOffset({offsetX, offsetY});

    if(screenPosition.row > this.getTextEditor().getLastScreenRow()) return void this.element.hide();

    var bufferPosition = this.getTextEditor().bufferPositionForScreenPosition(screenPosition);
    this.element.scrollToBufferPosition(bufferPosition);
    this.element.show();
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

  onStartDragMinimap() {
    this.disabled = true;
    this.element.hide();
    addEventListenerOnce(document.body, 'mouseup', () => this.disabled = false);
  }
};

export default MinimapCodeglance;
