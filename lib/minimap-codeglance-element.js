'use babel'
import 'object-assign-shim'
import config from './config.js'

const nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar')

const tagName = 'minimap-codeglance'

function makePropertyDescriptors(obj) {
  for(let key of Object.keys(obj)) obj[key] = {value: obj[key]}
  return obj
}

function buildTextEditor() {
  return typeof atom.workspace.buildTextEditor == 'function' ?
    atom.workspace.buildTextEditor() :
    document.createElement('atom-text-editor').getModel()
}

const prototype = Object.create(HTMLElement.prototype, makePropertyDescriptors({
  createdCallback() {
    this.lines = buildTextEditor()
    this.lines.autoHeight = false
    this.linesView = atom.views.getView(this.lines)
    this.appendChild(this.linesView)

    this.lineNumbers = this.lines.gutterWithName('line-number')
    this.lineNumbers.show()
  },

  destroy() {
    this.remove()
    this.removeChild(this.linesView)
    this.lines.destroy()
    this.lines = null
    this.linesView = null
  },

  show() {
    this.style.opacity = ''
    // also reset display because the pane sets it to 'none'
    // on every tab change
    this.style.display = ''
  },

  hide() {
    // use opacity instead of display because the text editor
    // won't render text if it or its parents has display: none
    this.style.opacity = 0
  },

  update(textEditor) {
    this.updateDimensions()

    // if text hasn't changed, don't update
    if(textEditor.getText() == this.lines.getText()) return

    // prevent tokenisation upon changing the grammar
    this.lines.setText('')
    // set the null grammar if code highlighting is disabled
    this.lines.setGrammar(config.codeHighlighting ? textEditor.getGrammar() : nullGrammar)
    this.setSoftWrapped(textEditor.isSoftWrapped())
    this.lines.setText(textEditor.getText())
    this.setDecorations(textEditor.getDecorations())
  },

  updateDimensions() {
    var lineHeight = this.lines.getLineHeightInPixels() ||
      atom.workspace.getActiveTextEditor().getLineHeightInPixels()
    this.style.height = `${config.numberOfLines * lineHeight}px`
  },

  showLineNumbers(showLineNumbers) {
    var lineNumbersView = atom.views.getView(this.lineNumbers)
    if(!lineNumbersView) return
    lineNumbersView.style.opacity = showLineNumbers ? '1' : '0'
  },

  setSoftWrapped(softWrapped) {
    switch(config.softWrap) {
      case 'always':
        softWrapped = true
        break
      case 'never':
        softWrapped = false
        break
      default:
        break
    }
    this.lines.setSoftWrapped(softWrapped)
  },

  setDecorations(decorations) {
    if(!config.decorations) return

    // delete current markers
    for(let decoration of this.lines.getDecorations()) {
      decoration.destroy()
    }
    // copy new markers
    for(let decoration of this.filterDecorations(decorations)) {
      let newMarker = this.lines.markBufferRange(decoration.getMarker().getBufferRange())
      this.lines.decorateMarker(newMarker, decoration.getProperties())
    }
  },

  filterDecorations(decorations) {
    return decorations.filter(decoration => {
      var properties = decoration.getProperties()
      if(properties.type == 'overlay' ||
        properties.class == 'selection' ||
        properties.class == 'cursor-line') return false
      return true
    })
  },

  scrollToBufferPosition(bufferPosition) {
    this.lines.setCursorBufferPosition(bufferPosition, {autoscroll: true})
  },
}))

document.registerElement(tagName, {prototype})

export default function minimapCodeglanceElement() {
  return document.createElement(tagName)
}
