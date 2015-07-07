'use strict'
{Disposable, CompositeDisposable} = require 'event-kit'
CodeglanceView = require './codeglance-view'

addEventListener = (el, event, cb) ->
  el.addEventListener event, cb
  new Disposable -> el.removeEventListener event, cb

module.exports =
  config:
    numberOfLines:
      type: 'integer'
      default: 6
      minimum: 1
    codeglancePosition:
      type: 'string'
      default: 'cursor'
      enum: [ 'bottom', 'cursor', 'top' ]
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
    @createView()

    @disposables.add @minimap.observeMinimaps (minimap) =>
      @setupEvents minimap

    @disposables.add atom.config.observe 'minimap-codeglance.numberOfLines', (nLines) =>
      @codeglanceView.setHeight nLines

    @disposables.add atom.config.observe 'minimap-codeglance.codeglancePosition', (position) =>
      @codeglanceView.setPosition position

    @disposables.add atom.config.observe 'minimap-codeglance.showGutter', (showGutter) =>
      if showGutter then @codeglanceView.showGutter() else @codeglanceView.hideGutter()

    @disposables.add atom.config.observe 'minimap.displayMinimapOnLeft', (showOnLeft) =>
      @codeglanceView.setMinimapPosition if showOnLeft then 'left' else 'right'

  setupEvents: (minimap) ->
    minimapView = atom.views.getView minimap
    @disposables.add disposable = new CompositeDisposable()

    isDragging = false;

    disposable.add addEventListener minimapView, 'mouseenter', =>
      @codeglanceView.setMinimap minimap

    disposable.add addEventListener minimapView, 'mousemove', ({offsetY}) =>
      @codeglanceView.showLinesAtOffset offsetY unless isDragging

    disposable.add addEventListener minimapView, 'mouseleave', =>
      isDragging = false
      @codeglanceView.hide()

    disposable.add addEventListener minimapView, 'mousedown', =>
      isDragging = true
      @codeglanceView.hide()

    disposable.add addEventListener minimapView, 'mouseup', ->
      isDragging = false

    @disposables.add minimap.onDidDestroy =>
      @disposables.remove disposable
      disposable.dispose()
      disposable = null

  deactivatePlugin: ->
    return unless @active
    @active = false

    @disposables.dispose()

  createView: ->
    @codeglanceView ?= new CodeglanceView()

    @disposables.add new Disposable =>
      @codeglanceView?.destroy()
      @codeglanceView = null
