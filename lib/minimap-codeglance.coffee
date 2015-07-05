'use strict'
{CompositeDisposable} = require 'event-kit'
CodeglanceView = require './codeglance-view'

module.exports =
  active: false

  isActive: -> @active

  activate: (state) ->
    @subscriptions = new CompositeDisposable()
    @codeglanceView = new CodeglanceView()
    @panel = atom.workspace.addBottomPanel @codeglanceView

  consumeMinimapServiceV1: (@minimap) ->
    @minimap.registerPlugin 'codeglance', this

  deactivate: ->
    @minimap.unregisterPlugin 'codeglance'
    @codeglanceView.destroy()
    @panel.destroy()
    [@minimap, @codeglanceView, @panel] = []

  activatePlugin: ->
    return if @active
    @active = true

    @minimapsSubscription = @minimap.observeMinimaps (minimap) =>
      minimapElement = atom.views.getView(minimap)

      minimapElement.addEventListener 'mouseenter', =>
        @codeglanceView.setGrammar minimap.textEditor.getGrammar()

      minimapElement.addEventListener 'mousemove', (event) =>
        # console.log event
        offsetY = event.offsetY
        lineHeight = atom.config.get('minimap.charHeight') + atom.config.get('minimap.interline')
        lineOffset = Math.floor offsetY / lineHeight

        # get line at mouse cursor
        firstVisibleLine = minimap.getFirstVisibleScreenRow()
        cursorLine = firstVisibleLine + lineOffset

        nLines = atom.config.get 'minimap-codeglance.numberOfLines'
        textRange = [[cursorLine - Math.floor(nLines / 2), 0], [cursorLine + Math.ceil(nLines / 2), 0]]
        text = minimap.textEditor.getTextInBufferRange(textRange).slice(0, -1)

        if text
          @codeglanceView.setText text
          @panel.show()
        else
          @panel.hide()

      minimapElement.addEventListener 'mouseleave', =>
        @panel.hide()

  deactivatePlugin: ->
    return unless @active

    @active = false
    @minimapsSubscription.dispose()
    @subscriptions.dispose()

  config:
    numberOfLines:
      type: 'integer'
      default: 3
      minimum: 1
