'use babel';
import 'object-assign-shim';

import {
  getConfig,
} from './utils.js';

const nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');

const tagName = 'minimap-codeglance';

const prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.textEditorView = document.createElement('atom-text-editor');
    this.appendChild(this.textEditorView);
    this.textEditor = this.textEditorView.getModel();
  },

  destroy() {
    this.remove();
    this.removeChild(this.textEditorView);
    this.textEditor.destroy();
    this.textEditor = null;
  },

  show() {
    this.style.opacity = '';
  },

  hide() {
    // use opacity instead of display because
    // the text editor won't render text if
    // it or its parents has display: none
    this.style.opacity = 0;
  },

  update(textEditor) {
    this.updateNumberOfLines();
    this.updateLineNumbers();
    this.updateSoftWrapped(textEditor.isSoftWrapped());

    if(textEditor.getText() == this.textEditor.getText()) return;

    this.textEditor.setText('');
    this.textEditor.setGrammar(
      getConfig('codeHighlighting') ? textEditor.getGrammar() : nullGrammar
    );
    this.textEditor.setText(textEditor.getText());
  },

  getTextEditorRoot() {
    return this.textEditorView.shadowRoot || this.textEditorView;
  },

  updateNumberOfLines() {
    var lineHeight = this.textEditor.getLineHeightInPixels();
    this.style.height = `${getConfig('numberOfLines') * lineHeight}px`;
    this.textEditor.setHeight(this.clientHeight);
  },

  updateSoftWrapped(softWrapped) {
    var softWrapMode = getConfig('softWrap').split(' ')[0];
    if(softWrapMode == 'always') {
      softWrapped = true;
    } else if(softWrapMode == 'never') {
      softWrapped = false;
    }
    this.textEditor.setSoftWrapped(softWrapped);
  },

  updateLineNumbers() {
    var gutterContainer = this.getTextEditorRoot().querySelector('.gutter-container');

    if(getConfig('showLineNumbers')) {
      gutterContainer.style.opacity = '';
    } else {
      gutterContainer.style.opacity = 0;
    }
  },

  scrollToBufferPosition(bufferPosition) {
    this.textEditor.setCursorBufferPosition(bufferPosition, {
      autoscroll: true,
    });
  },

  translateY(offsetY) {
    if(!this.parentNode) return;

    offsetY -= this.clientHeight / 2;
    offsetY = Math.round(offsetY);
    offsetY = Math.max(0, offsetY);
    offsetY = Math.min(this.parentNode.clientHeight - this.clientHeight, offsetY);
    requestAnimationFrame(() => this.style.transform = `translateY(${offsetY}px)`);
  },
});

document.registerElement(tagName, {
  prototype,
});

export default function minimapCodeglanceElement() {
  return document.createElement(tagName);
}
