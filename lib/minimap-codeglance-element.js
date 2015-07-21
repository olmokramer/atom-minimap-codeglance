'use babel';
import 'object-assign-shim';

const tagName = 'minimap-codeglance';

var elementRegistered = false;

var prototype = {
  destroy() {
    this.model.destroy();
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
    var lineHeight = this.model.getLineHeightInPixels();
    this.style.height = numberOfLines * lineHeight + 'px';
  },

  setText(text) {
    this.model.setText(text);
  },

  setGrammar(grammar) {
    this.model.setGrammar(grammar);
  },

  setSoftWrapped(softWrapped) {
    this.model.setSoftWrapped(softWrapped);
  },

  scrollToBufferPosition(bufferPosition) {
    this.model.setCursorBufferPosition(bufferPosition, {
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
  var textEditorElement = document.createElement('atom-text-editor');
  var textEditorElementPrototype = Object.getPrototypeOf(textEditorElement);

  Object.setPrototypeOf(prototype, textEditorElementPrototype);

  document.registerElement(tagName, { prototype });
}

export default function minimapCodeglanceElement() {
  if(!elementRegistered) {
    registerElement();
    elementRegistered = true;
  }
  return document.createElement(tagName);
}
