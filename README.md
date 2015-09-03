# minimap-codeglance package

Codeglance for Atom as a [minimap](https://atom.io/packages/minimap) plugin. Shows the code that's under the mouse cursor when hovering the minimap.

![Minimap codeglance](https://raw.githubusercontent.com/olmokramer/atom-minimap-codeglance/master/screencast.gif)

# styling the codeglance element

You can style the codeglance element from your stylesheet (`~/.atom/styles.less`) like this:

```less
minimap-codeglance {
  // see through the codeglance element
  opacity: .8;
  // change the shadow of the element
  box-shadow: 0 0 10px rgba(0, 0, 0, .5);
  // etc.
}
```

# todo

- [ ] Better support for huge files
