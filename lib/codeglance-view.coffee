'use strict'
class CodeglanceView
  constructor: ->
    @item = document.createElement 'div'
    @item.classList.add 'minimap-codeglance'
    @item.appendChild editorView = document.createElement 'atom-text-editor'
    @editor = editorView.getModel()

  visible: false

  priority: 1000

  showGutters: ->
    gutter.show() for gutter in @editor.getGutters()

  hideGutters: ->
    gutter.hide() for gutter in @editor.getGutters()

  setGrammar: (grammar) ->
    unless atom.config.get 'minimap-codeglance.useSyntaxTheme'
      grammar = atom.grammars.grammarForScopeName 'text.plain.null-grammar'
    if grammar isnt @editor.getGrammar()
      @editor.setGrammar grammar

  setText: (text) ->
    @editor.setText text

  showLinesAtOffset: (offset, minimap) ->
    # offset in lines
    lineHeight = minimap.charHeight + minimap.interline
    lineOffset = Math.floor offset / lineHeight

    # line under the mouse cursor
    firstVisibleLine = minimap.getFirstVisibleScreenRow()
    cursorLine = firstVisibleLine + lineOffset
    return false if cursorLine > @editor.getLastScreenRow()

    @editor.scrollToScreenPosition [cursorLine, 0], center: true
    return true

  resetEditorHeight: ->
    nLines = atom.config.get 'minimap-codeglance.numberOfLines'
    @item.style.height = nLines * @editor.getLineHeightInPixels() + 'px'

  destroy: ->
    @editor.destroy()
    [@item, @editor] = []

module.exports = CodeglanceView
