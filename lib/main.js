'use babel';
import MinimapCodeglance from './minimap-codeglance.js';

// atom package stuff

export var config = {
  numberOfLines: {
    type: 'integer',
    default: 5,
    minimum: 1,
    order: 1
  },
  showLineNumbers: {
    type: 'boolean',
    default: true,
    order: 2
  },
  codeHighlighting: {
    type: 'boolean',
    default: true,
    order: 3
  }
};

export function activate() {}

export function deactivate() {
  plugin.unregisterPlugin();
}

// minimap plugin stuff

var plugin;

export function consumeMinimapServiceV1(minimap) {
  minimap.registerPlugin('codeglance', plugin = {
    active: false,

    isActive() {
      return this.active;
    },

    activatePlugin() {
      if(this.active) return;
      this.active = true;

      this.codeglance = Object.create(MinimapCodeglance).initialize();
      this.disposable = minimap.observeMinimaps(minimap => this.codeglance.addMinimap(minimap));
    },

    deactivatePlugin() {
      if(!this.active) return;
      this.active = false;

      this.codeglance.destroy();
      this.disposable.dispose();
      [this.codeglance, this.disposable] = [];
    },

    unregisterPlugin() {
      this.deactivatePlugin();
      minimap.unregisterPlugin('codeglance');
      plugin = null;
    }
  });
}
