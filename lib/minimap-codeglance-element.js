'use babel';
import 'object-assign-shim';

const tagName = 'minimap-codeglance';

var elementRegistered = false;

var prototype = {
  destroy() {
    this.getModel().destroy();
  },

  show() {
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
    this.getModel().setCursorBufferPosition(bufferPosition, {
      autoscroll: true,
    });
  },

  translateY(offsetY) {
    offsetY -= this.clientHeight / 2;
    offsetY = Math.max(0, offsetY);
    offsetY = Math.min(this.parentNode.clientHeight - this.clientHeight, offsetY);
    requestAnimationFrame(() => this.style.transform = `translateY(${offsetY}px)`);
  },
};

function registerElement() {
  // extend the atom-text-editor element
  var textEditorElement = document.createElement('atom-text-editor');
  var textEditorElementPrototype = Object.getPrototypeOf(textEditorElement);
  Object.setPrototypeOf(prototype, textEditorElementPrototype);

  document.registerElement(tagName, { prototype });
}

export default function minimapCodeglanceElement() {
  // make sure element is registered
  if(!elementRegistered) {
    registerElement();
    elementRegistered = true;
  }
  return document.createElement(tagName);
}
