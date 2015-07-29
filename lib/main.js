'use babel';
import minimapCodeglance from './minimap-codeglance.js';

// atom package stuff

export var config = {
  numberOfLines: {
    type: 'integer',
    default: 5,
    minimum: 1,
  },
  showLineNumbers: {
    type: 'boolean',
    default: true,
  },
  hideLineNumbersInTypeWriter: {
    description: 'Hide line numbers when an editor is affected by the typewriter package',
    type: 'boolean',
    default: true,
  },
  codeHighlighting: {
    description: 'Might be heavy on performance, especially with large files.',
    type: 'boolean',
    default: true,
  },
  decorations: {
    description: 'Might be heavy on performance, especially with large files.',
    type: 'boolean',
    default: true,
  },
  softWrap: {
    type: 'string',
    default: 'editor - Use the current editor\'s soft wrap setting',
    enum: [
      'editor - Use the current editor\'s soft wrap setting',
      'always - Always soft wrap in the codeglance view',
      'never - Never soft wrap in the codeglance view',
    ],
  },
};

export function activate() {}

export function deactivate() {
  if(!plugin) return;

  plugin.unregisterPlugin();
}

// minimap plugin stuff

var plugin;

export function consumeMinimapServiceV1(minimapService) {
  minimapService.registerPlugin('codeglance', plugin = {
    active: false,

    isActive() {
      return this.active;
    },

    activatePlugin() {
      if(this.active) return;
      this.active = true;

      this.minimapCodeglance = minimapCodeglance();
      this.minimapCodeglance.initialize();
      this.minimapSubscription = minimapService.observeMinimaps(minimap =>
        this.minimapCodeglance.addMinimap(minimap)
      );
    },

    deactivatePlugin() {
      if(!this.active) return;
      this.active = false;

      this.minimapCodeglance.destroy();
      this.minimapSubscription.dispose();
      [this.minimapCodeglance, this.minimapSubscription] = [];
    },

    unregisterPlugin() {
      this.deactivatePlugin();
      minimapService.unregisterPlugin('codeglance');
      plugin = null;
    },
  });
}
