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
    var autoscroll = true;
    this.model.setCursorBufferPosition(bufferPosition, { autoscroll });
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
};

function getPrototype() {
  var textEditorElement = document.createElement('atom-text-editor');
  var textEditorElementPrototype = Object.getPrototypeOf(textEditorElement);

  if(Object.getPrototypeOf(prototype) == textEditorElementPrototype) {
    return prototype;
  }

  Object.setPrototypeOf(prototype, textEditorElementPrototype);
  return prototype;
}

export default function minimapCodeglanceElement() {
  if(!elementRegistered) {
    document.registerElement(tagName, {
      prototype: getPrototype()
    });
    elementRegistered = true;
  }
  return document.createElement(tagName);
}
