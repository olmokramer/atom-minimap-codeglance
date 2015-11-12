'use babel'

export function buildTextEditor() {
  return typeof atom.workspace.buildTextEditor == 'function' ?
    atom.workspace.buildTextEditor() :
    document.createElement('atom-text-editor').getModel()
}
