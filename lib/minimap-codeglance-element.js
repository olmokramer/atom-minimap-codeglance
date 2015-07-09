'use babel';
import { TextEditor } from 'atom';
import 'object-assign-shim';

{
  let textEditor = new TextEditor();
  let textEditorView = atom.views.getView(textEditor);
  let TextEditorElement = Object.getPrototypeOf(textEditorView);
  var MinimapCodeglanceElement = Object.create(TextEditorElement);
}

Object.assign(MinimapCodeglanceElement, {
  show() {
    // hide until content is visible
    this.style.opacity = this.clientHeight == 0 ? 0 : '';
    this.style.display = '';
  },

  hide() {
    this.style.display = 'none';
  },

  showLineNumbers() {
    this.removeAttribute('data-hide-gutter');
  },

  hideLineNumbers() {
    this.setAttribute('data-hide-gutter', '');
  },

  setMinimapPosition(minimapPosition) {
    this.setAttribute('data-minimap-position', minimapPosition);
  },

  setNumberOfLines(numberOfLines) {
    var lineHeight = this.getModel().getLineHeightInPixels();
    this.style.height = numberOfLines * lineHeight + 'px';
  },

  setText(text) {
    this.getModel().setText(text);
  },

  setGrammar(grammar) {
    this.getModel().setGrammar(grammar);
  },

  setSoftWrapped(softWrapped) {
    this.getModel().setSoftWrapped(softWrapped);
  },

  scrollToBufferPosition(bufferPosition) {
    var screenPosition = this.getModel().screenPositionForBufferPosition(bufferPosition);
    this.getModel().setCursorScreenPosition(screenPosition);
  },

  translateY(offsetY) {
    offsetY -= this.clientHeight / 2;
    offsetY = Math.max(this.getMinOffsetY(), offsetY);
    offsetY = Math.min(this.getMaxOffsetY(), offsetY);
    requestAnimationFrame(() => this.style.transform = `translateY(${offsetY}px)`);
  },

  getMinOffsetY() {
    return -parseInt(getComputedStyle(this).borderTopWidth);
  },

  getMaxOffsetY() {
    var borderBottom = parseInt(getComputedStyle(this).borderBottomWidth);
    return this.parentNode.clientHeight - this.clientHeight + borderBottom;
  }
});

export default document.registerElement('minimap-codeglance', {
  prototype: MinimapCodeglanceElement
});
