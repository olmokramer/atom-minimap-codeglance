'use babel';
import { CompositeDisposable, Point } from 'atom';
import 'object-assign-shim';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.createEditor();
    this.observeConfig();
  },

  createEditor() {
    var codeglanceEditorView = document.createElement('atom-text-editor');
    this.appendChild(codeglanceEditorView);
    this.codeglanceEditor = codeglanceEditorView.getModel();
    for(let gutter of this.codeglanceEditor.getGutters()) {
      if(gutter.name != 'line-number') gutter.destroy();
    }
  },

  observeConfig() {
    this.disposables = new CompositeDisposable(
      atom.config.observe('minimap-codeglance.showLineNumbers', showLineNumbers => this.setShowLineNumbers(showLineNumbers)),
      atom.config.observe('minimap.displayMinimapOnLeft', displayOnLeft => this.setMinimapPosition(displayOnLeft))
    );
  },

  attach() {
    var textEditorView = atom.views.getView(this.getTextEditor());
    textEditorView.shadowRoot.appendChild(this);
  },

  detach() {
    if(this.parentNode) this.parentNode.removeChild(this);
  },

  resize() {
    var minimapView = atom.views.getView(this.minimap);
    var minimapWidth = getComputedStyle(minimapView).width;
    this.style.width = `calc(100% - ${minimapWidth})`;

    var nLines = atom.config.get('minimap-codeglance.numberOfLines');
    var lineHeight = this.codeglanceEditor.getLineHeightInPixels();
    this.style.height = nLines * lineHeight + 'px';
  },

  updateGrammar() {
    var codeHighlighting = atom.config.get('minimap-codeglance.codeHighlighting');
    var grammar = codeHighlighting ? this.getTextEditor().getGrammar() : atom.grammars.grammarForScopeName('text.plain.null-grammar');
    this.codeglanceEditor.setGrammar(grammar);
  },

  updateText() {
    this.codeglanceEditor.setText(this.getTextEditor().getText());
  },

  show() {
    // hide until content is visible
    this.style.opacity = this.clientHeight == 0 ? 0 : '';
    this.style.display = '';
  },

  hide() {
    this.style.display = 'none';
  },

  setShowLineNumbers(showLineNumbers) {
    showLineNumbers ? this.showLineNumbers() : this.hideLineNumbers();
  },

  showLineNumbers() {
    this.removeAttribute('data-hide-gutter');
  },

  hideLineNumbers() {
    this.setAttribute('data-hide-gutter', '');
  },

  setMinimapPosition(displayOnLeft) {
    this.setAttribute('data-minimap-position', displayOnLeft ? 'left' : 'right');
  },

  setMinimap(minimap) {
    if(this.minimap == minimap) return;
    this.minimap = minimap;
    this.attach();
    this.resize();
    this.updateGrammar();
    this.updateText();
  },

  getTextEditor() {
    return this.minimap.getTextEditor();
  },

  showLinesAtOffset(offset) {
    if(this.clientHeight == 0) this.resize();
    var sourceScreenPosition = this.sourceScreenPositionForMinimapOffset(offset);

    if(sourceScreenPosition.row > this.getTextEditor().getLastScreenRow()) {
      return void this.hide();
    }

    var screenPosition = this.screenPositionForSourceScreenPosition(sourceScreenPosition);
    this.scrollToScreenPosition(screenPosition);
    this.show();
    this.translateY(offset.y);
  },

  sourceScreenPositionForMinimapOffset(offset) {
    var firstVisibleScreenRow = this.minimap.getFirstVisibleScreenRow();
    var lineHeight = this.minimap.charHeight + this.minimap.interline;
    var row = firstVisibleScreenRow + Math.floor(offset.y / lineHeight);
    var columnWidth = this.minimap.charWidth;
    var column = Math.floor(offset.x / columnWidth);
    return new Point(row, column);
  },

  screenPositionForSourceScreenPosition(sourceScreenPosition) {
    bufferPosition = this.getTextEditor().bufferPositionForScreenPosition(sourceScreenPosition);
    return this.codeglanceEditor.screenPositionForBufferPosition(bufferPosition);
  },

  scrollToScreenPosition(screenPosition) {
    var autoscroll = true;
    this.codeglanceEditor.setCursorScreenPosition(screenPosition, { autoscroll });
  },

  translateY(y) {
    var offsetY = y - this.clientHeight / 2;
    offsetY = Math.max(this.getMinOffsetY(), offsetY);
    offsetY = Math.min(this.getMaxOffsetY(), offsetY);
    requestAnimationFrame(() => this.style.transform = `translateY(${offsetY}px)`);
  },

  getMinOffsetY() {
    return -parseInt(getComputedStyle(this).borderTopWidth);
  },

  getMaxOffsetY() {
    var borderBottom = parseInt(getComputedStyle(this).borderBottomWidth);
    return this.parentNode.host.clientHeight - this.clientHeight + borderBottom;
  },

  destroy() {
    this.detach();
    this.codeglanceEditor.destroy();
    this.disposables.dispose();
    [this.codeglanceEditor, this.minimap, this.disposables] = [];
  }
});

var CodeglanceElement = document.registerElement('minimap-codeglance', { prototype });

export default CodeglanceElement;
