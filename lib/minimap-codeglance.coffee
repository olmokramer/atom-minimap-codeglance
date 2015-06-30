{CompositeDisposable} = require 'event-kit'

module.exports =
  active: false

  isActive: -> @active

  activate: (state) ->
    @subscriptions = new CompositeDisposable

  consumeMinimapServiceV1: (@minimap) ->
    @minimap.registerPlugin 'minimap-codeglance', this

  deactivate: ->
    @minimap.unregisterPlugin 'minimap-codeglance'
    @minimap = null

  activatePlugin: ->
    return if @active

    @active = true

    @minimapsSubscription = @minimap.observeMinimaps (minimap) =>
      minimapElement = atom.views.getView(minimap)

      minimapElement.addEventListener 'mousemove', (event) =>
        # console.log event
        offsetY = event.offsetY
        lineHeight = atom.config.get('minimap.charHeight') + atom.config.get('minimap.interline')
        lineOffset = Math.floor offsetY / lineHeight

        # get line at mouse cursor
        firstVisibleLine = minimap.getFirstVisibleScreenRow()
        cursorLine = firstVisibleLine + lineOffset

        textEditor = atom.workspace.getActiveTextEditor()
        text = textEditor.getTextInBufferRange [[cursorLine - 1, 0], [cursorLine + 2, 0]]

        console.log text

        # draw something at y


  deactivatePlugin: ->
    return unless @active

    @active = false
    @minimapsSubscription.dispose()
    @subscriptions.dispose()
