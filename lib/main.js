'use babel';
import minimapCodeglance from './minimap-codeglance.js';

// atom package stuff

export var config = {
  numberOfLines: {
    type: 'integer',
    default: 5,
    minimum: 1
  },
  showLineNumbers: {
    type: 'boolean',
    default: true
  },
  codeHighlighting: {
    type: 'boolean',
    default: true
  },
  softWrap: {
    type: 'string',
    default: 'editor - Use the current editor\'s soft wrap setting',
    enum: [
      'editor - Use the current editor\'s soft wrap setting',
      'always - Always soft wrap in the codeglance view',
      'never - Never soft wrap in the codeglance view'
    ]
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

      this.minimapCodeglance = minimapCodeglance();
      this.minimapCodeglance.initialize();
      this.disposable = minimap.observeMinimaps(minimap =>
        this.minimapCodeglance.addMinimap(minimap)
      );
    },

    deactivatePlugin() {
      if(!this.active) return;
      this.active = false;

      this.minimapCodeglance.destroy();
      this.disposable.dispose();
      [this.minimapCodeglance, this.disposable] = [];
    },

    unregisterPlugin() {
      this.deactivatePlugin();
      minimap.unregisterPlugin('codeglance');
      plugin = null;
    }
  });
}
