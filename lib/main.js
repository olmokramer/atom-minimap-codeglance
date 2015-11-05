'use babel'
import minimapCodeglance from './minimap-codeglance.js'

// atom package stuff

export {schema as config} from './config.js'

export function activate() {}

export function deactivate() {
  if(!plugin) return
  plugin.unregisterPlugin()
}

// minimap plugin stuff

var plugin

export function consumeMinimapServiceV1(minimapService) {
  minimapService.registerPlugin('codeglance', plugin = {
    active: false,

    isActive() {
      return this.active
    },

    activatePlugin() {
      if(this.active) return
      this.active = true

      this.minimapCodeglance = minimapCodeglance()
      this.minimapSubscription = minimapService.observeMinimaps(minimap =>
        this.minimapCodeglance.addMinimap(minimap)
      )
    },

    deactivatePlugin() {
      if(!this.active) return
      this.active = false

      this.minimapCodeglance.destroy()
      this.minimapSubscription.dispose()
      this.minimapCodeglance = null
      this.minimapSubscription = null
    },

    unregisterPlugin() {
      this.deactivatePlugin()
      minimapService.unregisterPlugin('codeglance')
      plugin = null
    },
  })
}
