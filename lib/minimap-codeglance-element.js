'use babel';
import 'object-assign-shim';

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
    this.linesView = document.createElement('atom-text-editor');
    this.appendChild(this.linesView);
    this.lines = this.linesView.getModel();
  },

  destroy() {
    this.remove();
    this.removeChild(this.linesView);
    this.lines.destroy();
    this.lines = null;
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

    // if text hasn't changed, don't update
    if(textEditor.getText() == this.lines.getText()) return;

    // clear text so that no tokenisation happens
    // upon changing the grammar
    this.lines.setText('');
    this.lines.setGrammar(
      // set the null grammar if code highlighting
      // is disabled
      atom.config.get('minimap-codeglance.codeHighlighting') ? textEditor.getGrammar() : nullGrammar
    );
    this.updateSoftWrapped(textEditor.isSoftWrapped());
    this.lines.setText(textEditor.getText());
    this.setDecorations(this.getFilteredDecorations(textEditor));
  },

  updateDimensions() {
    var lineHeight = this.lines.getLineHeightInPixels();
    this.style.height = `${atom.config.get('minimap-codeglance.numberOfLines') * lineHeight}px`;
    atom.views.getView(this.lines).setHeight(this.clientHeight);
  },

  updateLineNumbers(showLineNumbers) {
    var lineNumbers = this.lines.gutterWithName('line-number');
    showLineNumbers ? lineNumbers.show() : lineNumbers.hide();
  },

  updateSoftWrapped(softWrapped) {
    var softWrapMode = atom.config.get('minimap-codeglance.softWrap');
    if(softWrapMode == 'always') {
      softWrapped = true;
    } else if(softWrapMode == 'never') {
      softWrapped = false;
    }
    this.lines.setSoftWrapped(softWrapped);
  },

  setDecorations(decorations) {
    if(!atom.config.get('minimap-codeglance.decorations')) return;

    // delete current markers
    for(let decoration of this.lines.getDecorations()) {
      decoration.destroy();
    }
    // copy new markers
    for(let decoration of decorations) {
      let newMarker = this.lines.markBufferRange(decoration.getMarker().getBufferRange());
      this.lines.decorateMarker(newMarker, decoration.getProperties());
    }
  },

  getFilteredDecorations(textEditor) {
    return textEditor.getDecorations().filter(decoration => {
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
    this.lines.setCursorBufferPosition(bufferPosition, {
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
