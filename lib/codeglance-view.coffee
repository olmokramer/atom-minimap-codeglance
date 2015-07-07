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
    @style.height = nLines * @getLineHeight() + 'px'

  getLineHeight: ->
    @editor.getLineHeightInPixels()

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
    offsetInRows = @pixelsToRows offsetInPixels
    sourceScreenRow = @sourceScreenRowForOffset offsetInRows
    ownScreenRow = @ownScreenRowForSourceScreenRow sourceScreenRow
    @scrollToScreenRow ownScreenRow
    @alignWithCursor offsetInPixels

  pixelsToRows: (px) ->
    lineHeight = @minimap.charHeight + @minimap.interline
    Math.floor px / lineHeight

  sourceScreenRowForOffset: (offsetInRows) ->
    firstVisibleScreenRow = @minimap.getFirstVisibleScreenRow()
    sourceScreenRow = firstVisibleScreenRow + offsetInRows

  ownScreenRowForSourceScreenRow: (sourceScreenRow) ->
    return -1 if sourceScreenRow > @minimap.getTextEditor().getLastScreenRow()
    bufferRow = @minimap.getTextEditor().bufferPositionForScreenPosition([sourceScreenRow, 0]).row
    @editor.screenPositionForBufferPosition([bufferRow, 0]).row

  scrollToScreenRow: (screenRow) ->
    return @hide() if screenRow is -1
    @editor.setCursorScreenPosition [screenRow, 0]
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
