'use strict'
{Disposable, CompositeDisposable} = require 'event-kit'
CodeglanceView = require './codeglance-view'

addEventListener = (el, event, cb) ->
  el.addEventListener event, cb
  new Disposable -> el.removeEventListener event, cb

module.exports =
  config:
    codeglancePosition:
      type: 'string'
      default: 'cursor'
      enum: [ 'bottom', 'cursor', 'top' ]
      order: 0
    numberOfLines:
      type: 'integer'
      default: 6
      minimum: 1
      order: 1
    showLineNumbers:
      type: 'boolean'
      default: true
      order: 2
    highlightCode:
      type: 'boolean'
      default: true
      order: 3

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

    @disposables.add atom.config.observe 'minimap-codeglance.codeglancePosition', (position) =>
      @codeglanceView.setPosition position

    @disposables.add atom.config.observe 'minimap-codeglance.showLineNumbers', (showLineNumbers) =>
      if showLineNumbers then @codeglanceView.showLineNumbers() else @codeglanceView.hideLineNumbers()

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
      @codeglanceView.hide()

    disposable.add addEventListener minimapView, 'mousedown', =>
      isDragging = true
      @codeglanceView.hide()

      upDisposable = addEventListener document.body, 'mouseup', ->
        isDragging = false
        upDisposable.dispose()
        upDisposable = null

    @disposables.add minimap.onDidDestroy =>
      @disposables.remove disposable
      disposable.dispose()
      disposable = null

  deactivatePlugin: ->
    return unless @active
    @active = false

    @disposables.dispose()
    @disposables = null

  createView: ->
    @codeglanceView ?= new CodeglanceView()

    @disposables.add new Disposable =>
      @codeglanceView?.destroy()
      @codeglanceView = null
