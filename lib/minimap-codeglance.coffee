'use strict'
{Disposable, CompositeDisposable} = require 'event-kit'
CodeglanceView = require './codeglance-view'

module.exports =
  config:
    numberOfLines:
      type: 'integer'
      default: 6
      minimum: 1
    panelLocation:
      type: 'string'
      default: 'bottom'
      enum: [ 'bottom', 'modal' ]
    useSyntaxTheme:
      type: 'boolean'
      default: true

  activate: ->

  deactivate: ->
    @deactivatePlugin()
    @minimap.unregisterPlugin 'codeglance'
    @minimap = null

  consumeMinimapServiceV1: (@minimap) ->
    @minimap.registerPlugin 'codeglance', this

  active: false

  isActive: -> @active

  activatePlugin: ->
    return if @active
    @active = true

    @disposables = new CompositeDisposable()
    @disposables.add atom.config.observe 'minimap-codeglance.panelLocation', => @createViews()
    @disposables.add @minimap.observeMinimaps (minimap) => @setupEvents minimap

  setupEvents: (minimap) ->
    minimapElement = atom.views.getView minimap

    minimapElement.addEventListener 'mouseenter', mouseenter = =>
      @codeglanceView.setGrammar if atom.config.get 'minimap-codeglance.useSyntaxTheme'
        minimap.getTextEditor().getGrammar()
      else
        atom.grammars.grammarForScopeName 'text.plain.null-grammar'

    minimapElement.addEventListener 'mousemove', mousemove = (event) =>
      # get the offset in lines
      offsetY = event.offsetY
      lineHeight = minimap.charHeight + minimap.interline
      lineOffset = Math.floor offsetY / lineHeight

      # get line at mouse cursor
      firstVisibleLine = minimap.getFirstVisibleScreenRow()
      cursorLine = firstVisibleLine + lineOffset

      # select nLines / 2 lines before and after the cursorLine
      nLines = atom.config.get 'minimap-codeglance.numberOfLines'
      lines = []
      for line in [cursorLine - Math.floor(nLines / 2)...cursorLine + Math.ceil(nLines / 2)]
        lines.push minimap.getTextEditor().lineTextForScreenRow(line) ? ''
      text = lines.join '\n'

      if text.match /^\s*$/
        @panel.hide()
      else
        @codeglanceView.setText text
        @panel.show()

    minimapElement.addEventListener 'mouseleave', mouseleave = =>
      @panel.hide()

    @disposables.add disposable = new Disposable ->
      minimapElement.removeEventListener 'mouseenter', mouseenter
      minimapElement.removeEventListener 'mousemove', mousemove
      minimapElement.removeEventListener 'mouseleave', mouseleave
      minimapElement = null

    @disposables.add minimap.onDidDestroy ->
      disposable.dispose()

  deactivatePlugin: ->
    return unless @active
    @active = false

    @disposables.dispose()

  createViews: ->
    @codeglanceView ?= new CodeglanceView()
    @panel?.destroy()
    @panel = switch atom.config.get 'minimap-codeglance.panelLocation'
      when 'modal' then atom.workspace.addModalPanel @codeglanceView
      else atom.workspace.addBottomPanel @codeglanceView

    @disposables.add new Disposable =>
      @codeglanceView.destroy()
      @panel?.destroy()
      [@panel, @codeglanceView] = []
