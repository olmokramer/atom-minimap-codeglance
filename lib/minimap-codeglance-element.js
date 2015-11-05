'use babel';
import 'object-assign-shim';

const nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');

const tagName = 'minimap-codeglance';

function makePropertyDescriptors(obj) {
  for(let key of Object.keys(obj)) obj[key] = {value: obj[key]};
  return obj;
}

const prototype = Object.create(HTMLElement.prototype, makePropertyDescriptors({
  createdCallback() {
    this.lines = atom.workspace.buildTextEditor();
    this.linesView = atom.views.getView(this.lines);
    this.appendChild(this.linesView);

    this.lineNumbers = this.lines.gutterWithName('line-number');
    this.lineNumbers.show();
  },

  destroy() {
    this.remove();
    this.removeChild(this.linesView);
    this.lines.destroy();
    [this.lines, this.linesView] = [];
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

    // clear text so that no tokenisation happens upon changing the grammar
    this.lines.setText('');
    // set the null grammar if code highlighting is disabled
    var highlights = atom.config.get('minimap-codeglance.codeHighlighting');
    this.lines.setGrammar(highlights ? textEditor.getGrammar() : nullGrammar);
    this.setSoftWrapped(textEditor.isSoftWrapped());
    this.lines.setText(textEditor.getText());
    this.setDecorations(textEditor.getDecorations());
  },

  updateDimensions() {
    var lineHeight = this.lines.getLineHeightInPixels();
    var numLines = atom.config.get('minimap-codeglance.numberOfLines');
    this.style.height = `${numLines * lineHeight}px`;
  },

  updateLineNumbers(showLineNumbers) {
    var lineNumbersView = atom.views.getView(this.lineNumbers);
    lineNumbersView.style.opacity = showLineNumbers ? '1' : '0';
  },

  setSoftWrapped(softWrapped) {
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
    for(let decoration of this.filterDecorations(decorations)) {
      let newMarker = this.lines.markBufferRange(decoration.getMarker().getBufferRange());
      this.lines.decorateMarker(newMarker, decoration.getProperties());
    }
  },

  filterDecorations(decorations) {
    return decorations.filter(decoration => {
      var properties = decoration.getProperties();
      if(properties.type == 'overlay' ||
        properties.class == 'selection' ||
        properties.class == 'cursor-line') return false;
      return true;
    });
  },

  scrollToBufferPosition(bufferPosition) {
    this.lines.setCursorBufferPosition(bufferPosition, {autoscroll: true});
  },
}));

document.registerElement(tagName, {prototype});

export default function minimapCodeglanceElement() {
  return document.createElement(tagName);
}
