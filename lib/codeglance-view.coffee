'use strict'
class CodeglanceView
  constructor: ->
    @item = document.createElement 'div'
    @item.classList.add 'minimap-codeglance'
    @item.appendChild editorView = document.createElement 'atom-text-editor'
    @editor = editorView.getModel()
    gutter.hide() for gutter in @editor.getGutters()

  setGrammar: (grammar) ->
    @editor.setGrammar grammar

  setText: (text) ->
    @editor.setText text

  visible: false

  destroy: ->
    [@item, @editor] = []

module.exports = CodeglanceView
