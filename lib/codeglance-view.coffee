'use strict'
class CodeglanceView extends HTMLElement
  createdCallback: ->
    @editorView = document.createElement 'atom-text-editor'
    @editor = @editorView.getModel()
    @appendChild @editorView

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
    lineHeight = @editor.getLineHeightInPixels()

  resetGrammar: ->
    grammar = switch atom.config.get 'minimap-codeglance.useSyntaxTheme'
      when true then @minimap.getTextEditor().getGrammar()
      when false then atom.grammars.grammarForScopeName 'text.plain.null-grammar'
    if grammar isnt @editor.getGrammar()
      @editor.setGrammar grammar

  resetText: ->
    @editor.setText @minimap.getTextEditor().getText()

  show: (parentTextEditor) ->
    @style.display = 'block'

  hide: ->
    @style.display = 'none'
    @style.transform = ''

  fixDisplayBufferHeight: ->
    # The height of the displayBuffer is much larger than
    # the editor's actual height when the editor's height
    # changes, which causes the programmatical scrolling to
    # fail. Resetting the height of the bufferseems to fix
    # this.
    displayBufferHeight = atom.config.get('minimap-codeglance.numberOfLines') * @getLineHeight()
    @editor.displayBuffer.setHeight displayBufferHeight

  setPosition: (@position) ->
    @setAttribute 'data-position', @position

  setMinimapPosition: (position) ->
    @setAttribute 'data-minimap-position', position

  showGutter: ->
    @removeAttribute 'data-hide-gutter'
    gutter.show() for gutter in @editor.getGutters()

  hideGutter: ->
    @setAttribute 'data-hide-gutter', ''
    gutter.hide() for gutter in @editor.getGutters()

  setMinimap: (@minimap) ->
    @attach()
    @resize()
    @resetGrammar()
    @resetText()

  showLinesAtOffset: (offset) ->
    @fixDisplayBufferHeight()
    offsetInLines = @pixelsToLines offset
    cursorLine = @getCursorLine offsetInLines
    return @hide() unless cursorLine?
    @highlightLine cursorLine
    @alignWithCursor offset

  pixelsToLines: (px) ->
    lineHeight = @minimap.charHeight + @minimap.interline
    Math.floor px / lineHeight

  getCursorLine: (offsetInLines) ->
    firstVisibleLine = @minimap.getFirstVisibleScreenRow()
    cursorLine = firstVisibleLine + offsetInLines
    return if cursorLine > @minimap.getTextEditor().getLastScreenRow()
    cursorLine = @minimap.getTextEditor().bufferPositionForScreenPosition([cursorLine, 0]).row
    @editor.screenPositionForBufferPosition([cursorLine, 0]).row

  highlightLine: (line) ->
    nLines = atom.config.get 'minimap-codeglance.numberOfLines'
    firstLine = Math.max 0, line - Math.floor nLines / 2
    @editor.setCursorScreenPosition [line, 0]
    @editor.displayBuffer.setScrollTop firstLine * @editor.getLineHeightInPixels()
    @show()

  alignWithCursor: (offset) ->
    return if @position isnt 'cursor'
    translateY = offset - @clientHeight / 2
    translateY = Math.max @getMinTranslateY(), translateY
    translateY = Math.min @getMaxTranslateY(), translateY
    requestAnimationFrame =>
      @style.transform = "translateY(#{translateY}px)"

  getMinTranslateY: ->
    -parseInt getComputedStyle(this).borderTopWidth

  getMaxTranslateY: ->
    borderBottom = parseInt getComputedStyle(this).borderBottomWidth
    @parentNode.host.clientHeight - @clientHeight + borderBottom

  destroy: ->
    @detach()
    @editor.destroy()
    [@editor, @editorView, @minimap] = []

module.exports = document.registerElement 'minimap-codeglance',
  prototype: CodeglanceView.prototype
