'use babel'
import 'object-assign-shim'
import {CompositeDisposable, Point} from 'atom'
import minimapCodeglanceElement from './minimap-codeglance-element.js'
import config from './config.js'
import domListener from './dom-listener.js'

var prototype = {
  initialize() {
    this.element = minimapCodeglanceElement()
    this.disposables = new CompositeDisposable(
      atom.config.observe('minimap-codeglance.showLineNumbers', showLineNumbers =>
        this.element.showLineNumbers(showLineNumbers)
      ),
      atom.config.observe('minimap.displayMinimapOnLeft', showOnLeft =>
        this.updatePosition(showOnLeft)
      ),
    )
    return this
  },

  destroy() {
    this.element.destroy()
    this.disposables.dispose()
    this.element = null
    this.disposables = null
    this.minimap = null
    this.textEditor = null
  },

  updatePosition(showOnLeft) {
    if(!this.minimap) return

    var minimapWidth = `${atom.views.getView(this.minimap).clientWidth}px`
    Object.assign(this.element.style, {
      left: showOnLeft ? minimapWidth : 0,
      right: showOnLeft ? 0 : minimapWidth,
    })

    this.fixTypeWriterEditor()
  },

  // support for typewriter (https://atom.io/packages/typewriter)
  fixTypeWriterEditor() {
    var textEditorView = atom.views.getView(this.textEditor)
    var isTypeWriter = textEditorView.getAttribute('data-typewriter')

    if(isTypeWriter) {
      var {marginLeft, marginRight, paddingLeft, paddingRight} = window.getComputedStyle(textEditorView)
      marginLeft = `${parseFloat(marginLeft) + parseFloat(paddingLeft)}px`
      marginRight = `${parseFloat(marginRight) + parseFloat(paddingRight)}px`
      Object.assign(this.element.style, {marginLeft, marginRight})
      this.element.showLineNumbers(false)
    } else {
      this.element.style.margin = ''
      this.element.showLineNumbers(config.showLineNumbers)
    }
  },

  disableDuringMouseDown() {
    if(this.disabled) return
    this.disabled = true
    this.element.hide()
    domListener(document.body, 'mouseup', () =>
      this.disabled = false
    , {once: true})
  },

  addMinimap(minimap) {
    var minimapView = atom.views.getView(minimap)
    var textEditorView = atom.views.getView(minimap.getTextEditor())

    var minimapDisposable = new CompositeDisposable(
      domListener(minimapView, 'mouseenter', () =>
        this.setCurrentMinimap(minimap)
      ),
      domListener(minimapView, 'mousemove', event => {
        if(this.minimap != minimap) this.setCurrentMinimap(minimap)
        this.scrollToMinimapOffset(event)
      }),
      domListener(minimapView, 'mouseleave', () =>
        this.element.hide()
      ),
      domListener(textEditorView, 'mousedown', () =>
        this.disableDuringMouseDown()
      ),
      minimap.onDidDestroy(() => {
        this.disposables.remove(minimapDisposable)
        minimapDisposable.dispose()
        minimapDisposable = null

        if(this.textEditor == minimap.getTextEditor()) {
          this.element.hide()
          this.textEditor = null
          this.minimap = null
        }
      }),
    )

    this.disposables.add(minimapDisposable)
  },

  setCurrentMinimap(minimap) {
    if(this.minimap != minimap) {
      this.minimap = minimap
      this.textEditor = minimap.getTextEditor()
    }

    this.attachElement()
    this.updatePosition(config.displayMinimapOnLeft)
    this.element.update(this.textEditor)
  },

  attachElement() {
    atom.views.getView(this.textEditor).parentNode.appendChild(this.element)
  },

  scrollToMinimapOffset(event) {
    if(this.disabled || !this.minimap) return
    var screenPosition = this.screenPositionForMinimapOffset(event)

    if(screenPosition.row > this.textEditor.getLastScreenRow()) {
      return void this.element.hide()
    }

    this.element.show()
    this.element.scrollToBufferPosition(
      this.textEditor.bufferPositionForScreenPosition(screenPosition)
    )
    this.translateY(event.offsetY)
  },

  screenPositionForMinimapOffset({offsetX, offsetY}) {
    var firstVisibleScreenRow = this.minimap.getFirstVisibleScreenRow()
    var lineHeight = this.minimap.getCharHeight() + this.minimap.getInterline()
    var row = firstVisibleScreenRow + Math.floor(offsetY / lineHeight)
    var columnWidth = this.minimap.getCharWidth()
    var column = Math.floor(offsetX / columnWidth)
    return new Point(row, column)
  },

  translateY(offsetY) {
    var codeglanceHeight = this.element.clientHeight
    var textEditorHeight = this.minimap.getTextEditorHeight()

    offsetY -= codeglanceHeight / 2
    offsetY = Math.round(offsetY)
    offsetY = Math.max(0, offsetY)
    offsetY = Math.min(textEditorHeight - codeglanceHeight, offsetY)
    requestAnimationFrame(() =>
      this.element.style.transform = `translateY(${offsetY}px)`
    )
  },
}

export default function minimapCodeglance() {
  return Object.create(prototype).initialize()
}
