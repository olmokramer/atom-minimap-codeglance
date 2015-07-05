'use strict'
class CodeglanceView
  constructor: ->
    @item = document.createElement 'div'
    @item.classList.add 'minimap-codeglance'
    @item.appendChild editorView = document.createElement 'atom-text-editor'
    @editor = editorView.getModel()
    gutter.hide() for gutter in @editor.getGutters()

  visible: false

  priority: 1000

  setGrammar: (grammar) ->
    @editor.setGrammar grammar

  setText: (text) ->
    @editor.setText text

  destroy: ->
    @editor.destroy()
    [@item, @editor] = []

module.exports = CodeglanceView
