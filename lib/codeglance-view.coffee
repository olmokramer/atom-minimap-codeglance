'use strict'
{Point} = require 'atom'

class CodeglanceView extends HTMLElement
  createdCallback: ->
    @appendChild editorView = document.createElement 'atom-text-editor'
    @codeglanceEditor = editorView.getModel()
    gutter.hide() for gutter in @codeglanceEditor.getGutters()

  attach: ->
    @getTextEditorView().shadowRoot.appendChild this

  detach: ->
    @parentNode?.removeChild this

  resize: ->
    minimapView = atom.views.getView @minimap
    minimapWidth = getComputedStyle(minimapView).width
    @style.width = "calc(100% - #{minimapWidth})"

    nLines = atom.config.get 'minimap-codeglance.numberOfLines'
    lineHeight = @codeglanceEditor.getLineHeightInPixels()
    @style.height = nLines * lineHeight + 'px'

  updateGrammar: ->
    @codeglanceEditor.setGrammar switch atom.config.get 'minimap-codeglance.highlightCode'
      when true then @getTextEditor().getGrammar()
      when false then atom.grammars.grammarForScopeName 'text.plain.null-grammar'

  updateText: ->
    @codeglanceEditor.setText @getTextEditor().getText()

  show: (parentTextEditor) ->
    # hide until content is visible
    @style.opacity = if @clientHeight is 0 then 0 else ''
    @style.display = ''

  hide: ->
    @style.display = 'none'

  setPosition: (@position) ->
    @setAttribute 'data-position', @position
    @style.transform = ''

  setMinimapPosition: (position) ->
    @setAttribute 'data-minimap-position', position

  showLineNumbers: ->
    @removeAttribute 'data-hide-gutter'
    @codeglanceEditor.gutterWithName('line-number').show()

  hideLineNumbers: ->
    @setAttribute 'data-hide-gutter', ''
    @codeglanceEditor.gutterWithName('line-number').hide()

  setMinimap: (minimap) ->
    return if @minimap is minimap
    @minimap = minimap
    @attach()
    @resize()
    @updateGrammar()
    @updateText()

  getTextEditor: ->
    @minimap.getTextEditor()

  getTextEditorView: ->
    atom.views.getView @getTextEditor()

  showLinesAtOffset: (offset) ->
    @resize() if @clientHeight is 0
    sourceScreenPosition = @sourceScreenPositionForMinimapOffset offset
    return @hide() if sourceScreenPosition.row > @getTextEditor().getLastScreenRow()
    screenPosition = @screenPositionForSourceScreenPosition sourceScreenPosition
    @scrollToScreenPosition screenPosition
    @alignWithCursor offset.y

  sourceScreenPositionForMinimapOffset: (offset) ->
    firstVisibleScreenRow = @minimap.getFirstVisibleScreenRow()
    lineHeight = @minimap.charHeight + @minimap.interline
    row = firstVisibleScreenRow + Math.floor offset.y / lineHeight
    columnWidth = @minimap.charWidth
    column = Math.floor offset.x / columnWidth
    new Point row, column

  screenPositionForSourceScreenPosition: (sourceScreenPosition) ->
    bufferPosition = @getTextEditor().bufferPositionForScreenPosition sourceScreenPosition
    @codeglanceEditor.screenPositionForBufferPosition bufferPosition

  scrollToScreenPosition: (screenPosition) ->
    @codeglanceEditor.setCursorScreenPosition screenPosition, autoscroll: true
    @show()

  alignWithCursor: (offset) ->
    return if @position isnt 'cursor'
    offsetY = offset - @clientHeight / 2
    offsetY = Math.max @getMinOffsetY(), offsetY
    offsetY = Math.min @getMaxOffsetY(), offsetY
    requestAnimationFrame =>
      @style.transform = "translateY(#{offsetY}px)"

  getMinOffsetY: ->
    -parseInt getComputedStyle(this).borderTopWidth

  getMaxOffsetY: ->
    borderBottom = parseInt getComputedStyle(this).borderBottomWidth
    @parentNode.host.clientHeight - @clientHeight + borderBottom

  destroy: ->
    @detach()
    @codeglanceEditor.destroy()
    [@codeglanceEditor, @minimap] = []

module.exports = document.registerElement 'minimap-codeglance',
  prototype: CodeglanceView.prototype
