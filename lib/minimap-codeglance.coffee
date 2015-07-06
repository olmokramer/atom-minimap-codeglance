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
    showGutter:
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
    @disposables.add atom.config.observe 'minimap-codeglance.panelLocation', =>
      @createViews()
    @disposables.add atom.config.observe 'minimap-codeglance.showGutter', (showGutter) =>
      if showGutter then @codeglanceView.showGutters() else @codeglanceView.hideGutters()
    @disposables.add @minimap.observeMinimaps (minimap) =>
      @setupEvents minimap

  setupEvents: (minimap) ->
    minimapElement = atom.views.getView minimap

    minimapElement.addEventListener 'mouseenter', mouseenter = =>
      @panel.show()
      @codeglanceView.resetEditorHeight()
      @codeglanceView.setGrammar minimap.getTextEditor().getGrammar()
      @codeglanceView.setText minimap.getTextEditor().getText()

    minimapElement.addEventListener 'mousemove', mousemove = ({offsetY}) =>
      if @codeglanceView.showLinesAtOffset offsetY, minimap
        @panel.show()
      else
        @panel.hide()

    minimapElement.addEventListener 'mouseleave', mouseleave = =>
      @panel.hide()

    @disposables.add disposable = new Disposable ->
      minimapElement.removeEventListener 'mouseenter', mouseenter
      minimapElement.removeEventListener 'mousemove', mousemove
      minimapElement.removeEventListener 'mouseleave', mouseleave
      [minimap, minimapElement] = null

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
      @codeglanceView?.destroy()
      @panel?.destroy()
      [@panel, @codeglanceView] = []
