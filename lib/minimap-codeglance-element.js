'use babel';
import 'object-assign-shim';

import {
  getConfig,
} from './utils.js';

const nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');

const tagName = 'minimap-codeglance';

const prototype = Object.create(HTMLElement.prototype);

const ignoredDecorations = {
  type: [
    'overlay',
  ],
  class: [
    'cursor-line',
    'selection',
  ],
};

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
    // also reset display because the pane sets it to 'none'
    // on every tab change
    this.style.display = '';
  },

  hide() {
    // use opacity instead of display because the text editor
    // won't render text if it or its parents has display: none
    this.style.opacity = 0;
  },

  update(textEditor) {
    this.updateDimensions();

    // if text hasn't changed, don't update the text,
    // grammar, softWrap or decorations
    if(textEditor.getText() == this.textEditor.getText()) return;

    // clear text so that no tokenisation happens
    // upon changing the grammar
    this.textEditor.setText('');
    this.textEditor.setGrammar(
      // set the null grammar if code highlighting
      // is disabled
      getConfig('codeHighlighting') ? textEditor.getGrammar() : nullGrammar
    );
    this.updateSoftWrapped(textEditor.isSoftWrapped());
    this.textEditor.setText(textEditor.getText());
    this.syncDecorations(textEditor);
  },

  getTextEditorRoot() {
    return this.textEditorView.shadowRoot || this.textEditorView;
  },

  updateDimensions() {
    var lineHeight = this.textEditor.getLineHeightInPixels();
    this.style.height = `${getConfig('numberOfLines') * lineHeight}px`;
    this.textEditor.setHeight(this.clientHeight);
  },

  updateLineNumbers(showLineNumbers, width) {
    var gutterContainer = this.getTextEditorRoot().querySelector('.gutter-container');
    Object.assign(gutterContainer.style, {
      opacity: showLineNumbers ? '' : 0,
      width: width != null ? `${width}px` : '',
    });
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

  syncDecorations(fromTextEditor) {
    if(!getConfig('decorations')) return;

    // delete current markers
    for(let decoration of this.textEditor.getDecorations()) {
      decoration.destroy();
    }
    // copy new markers
    for(let decoration of this.getFilteredDecorations(fromTextEditor)) {
      let newMarker = this.textEditor.markBufferRange(decoration.getMarker().getBufferRange());
      this.textEditor.decorateMarker(newMarker, decoration.getProperties());
    }
  },

  getFilteredDecorations(fromTextEditor) {
    return fromTextEditor.getDecorations().filter(decoration => {
      var properties = decoration.getProperties();
      for(let property in properties) {
        if(!ignoredDecorations[property]) continue;
        if(ignoredDecorations[property].indexOf(properties[property]) > -1) {
          return false;
        }
      }
      return true;
    });
  },

  scrollToBufferPosition(bufferPosition) {
    this.textEditor.setCursorBufferPosition(bufferPosition, {
      autoscroll: true,
    });
  },
});

document.registerElement(tagName, {
  prototype,
});

export default function minimapCodeglanceElement() {
  return document.createElement(tagName);
}
