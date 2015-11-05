'use babel'

export var schema = {
  numberOfLines: {
    type: 'integer',
    default: 5,
    minimum: 1,
  },
  showLineNumbers: {
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
    description: 'Soft wrapping in the codeglance view. Editor uses the soft wrap setting of the current text editor.',
    default: 'editor',
    enum: [
      'editor',
      'always',
      'never',
    ],
  },
}

export default {
  get numberOfLines() {
    return atom.config.get('minimap-codeglance.numberOfLines')
  },
  get showLineNumbers() {
    return atom.config.get('minimap-codeglance.showLineNumbers')
  },
  get codeHighlighting() {
    return atom.config.get('minimap-codeglance.codeHighlighting')
  },
  get decorations() {
    return atom.config.get('minimap-codeglance.decorations')
  },
  get softWrap() {
    return atom.config.get('minimap-codeglance.softWrap')
  },
  get displayMinimapOnLeft() {
    return atom.config.get('minimap.displayMinimapOnLeft')
  },
}
