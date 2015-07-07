'use strict'
class CodeglanceView extends HTMLElement
  createdCallback: ->
    @editorView = document.createElement 'atom-text-editor'
    @editor = @editorView.getModel()
    @appendChild @editorView
    gutter.hide() for gutter in @editor.getGutters()

  attach: ->
    textEditorView = atom.views.getView @minimap.getTextEditor()
    textEditorView.shadowRoot.appendChild this

  detach: ->
    @parentNode?.removeChild this

  resize: ->
    minimapView = atom.views.getView @minimap
    @style.width = "calc(100% - #{getComputedStyle(minimapView).width})"

    nLines = atom.config.get 'minimap-codeglance.numberOfLines'
    lineHeight = @editor.getLineHeightInPixels()
    @style.height = nLines * lineHeight + 'px'

  resetGrammar: ->
    @editor.setGrammar switch atom.config.get 'minimap-codeglance.highlightCode'
      when true then @minimap.getTextEditor().getGrammar()
      when false then atom.grammars.grammarForScopeName 'text.plain.null-grammar'

  resetText: ->
    @editor.setText @minimap.getTextEditor().getText()

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
    @editor.gutterWithName('line-number').show()

  hideLineNumbers: ->
    @setAttribute 'data-hide-gutter', ''
    @editor.gutterWithName('line-number').hide()

  setMinimap: (@minimap) ->
    @attach()
    @resize()
    @resetGrammar()
    @resetText()

  showLinesAtOffset: (offsetInPixels) ->
    @resize() if @clientHeight is 0
    minimapPosition = @offsetToMinimapPosition offsetInPixels
    sourceScreenPosition = @sourceScreenRowForMinimapPosition minimapPosition
    ownScreenPosition = @ownScreenPositionForSourceScreenPosition sourceScreenPosition
    @scrollToScreenPosition ownScreenPosition
    @alignWithCursor offsetInPixels.y

  offsetToMinimapPosition: (offsetInPixels) ->
    columnWidth = @minimap.charWidth
    lineHeight = @minimap.charHeight + @minimap.interline
    column: Math.floor offsetInPixels.x / columnWidth
    row: Math.floor offsetInPixels.y / lineHeight

  sourceScreenRowForMinimapPosition: (minimapPosition) ->
    firstVisibleScreenRow = @minimap.getFirstVisibleScreenRow()
    column: minimapPosition.column
    row: minimapPosition.row + firstVisibleScreenRow

  ownScreenPositionForSourceScreenPosition: (sourceScreenPosition) ->
    return null if sourceScreenPosition.row > @minimap.getTextEditor().getLastScreenRow()
    bufferPosition = @minimap.getTextEditor().bufferPositionForScreenPosition sourceScreenPosition
    @editor.screenPositionForBufferPosition bufferPosition

  scrollToScreenPosition: (screenPosition) ->
    return @hide() unless screenPosition?.row
    @editor.setCursorScreenPosition screenPosition
    @show()

  alignWithCursor: (cursorOffsetInPixels) ->
    return if @position isnt 'cursor'
    offsetInPixels = cursorOffsetInPixels - @clientHeight / 2
    offsetInPixels = Math.max @getMinOffsetY(), offsetInPixels
    offsetInPixels = Math.min @getMaxOffsetY(), offsetInPixels
    requestAnimationFrame =>
      @style.transform = "translateY(#{offsetInPixels}px)"

  getMinOffsetY: ->
    -parseInt getComputedStyle(this).borderTopWidth

  getMaxOffsetY: ->
    borderBottom = parseInt getComputedStyle(this).borderBottomWidth
    @parentNode.host.clientHeight - @clientHeight + borderBottom

  destroy: ->
    @detach()
    @editor.destroy()
    [@editor, @editorView, @minimap] = []

module.exports = document.registerElement 'minimap-codeglance',
  prototype: CodeglanceView.prototype
