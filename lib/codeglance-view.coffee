'use strict'
class CodeglanceView
  constructor: ->
    @item = document.createElement 'div'
    @item.classList.add 'minimap-codeglance'
    @editorView = document.createElement 'atom-text-editor'
    @editor = @editorView.getModel()
    @editor.setSoftWrapped false
    @item.appendChild @editorView

  visible: false

  priority: 1000

  showGutter: ->
    gutter.show() for gutter in @editor.getGutters()
    @editorView.classList.remove 'hide-gutter'

  hideGutter: ->
    gutter.hide() for gutter in @editor.getGutters()
    @editorView.classList.add 'hide-gutter'

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

    nLines = atom.config.get 'minimap-codeglance.numberOfLines'
    firstLine = Math.max 0, cursorLine + 1 - Math.ceil nLines / 2
    @editor.setCursorScreenPosition [cursorLine, 0]
    @editor.displayBuffer.setScrollTop firstLine * @editor.getLineHeightInPixels()
    return true

  resetEditorHeight: ->
    nLines = atom.config.get 'minimap-codeglance.numberOfLines'
    lineHeight = @editor.getLineHeightInPixels() or atom.workspace.getActiveTextEditor().getLineHeightInPixels()
    height = nLines * lineHeight
    @item.style.height = height + 'px'
    @editor.displayBuffer.setHeight height

  destroy: ->
    @editor.destroy()
    [@item, @editor, @editorView] = []

module.exports = CodeglanceView
