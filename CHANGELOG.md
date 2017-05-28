## 0.4.7
* Explicitly disable autoHeight

## 0.4.6
* Removed deprecated ::shadow selector

## 0.4.5
* Fix issue during package activation in Atom v1.1.0 (#17, #18, #20)
* Fix compatibility issue with typewriter package

## 0.4.4
* Fix issue where line numbers wouldn't show the first time codeglance was shown

## 0.4.3
* Fix an issue that was caused by changed variable names in minimap (#15, #16)

## 0.4.2
* Fix an exception when closing a text editor when codeglance hasn't been activated yet (#8)

## 0.4.1
* Fix an exception when closing a text editor while its codeglance was showing (#11)
* Hide codeglance when closing a text editor (#11)

## 0.4.0
* Show text editor decorations in the codeglance view
* Add `decorations` setting that toggles decorations

## 0.3.0
* Fix issue where text in the codeglance view would not show
* Align text editor when `showLineNumbers` is disabled

## 0.2.4
* Fix crash (#8)

## 0.2.3
* Fix issue where sometimes text wasn't visible

## 0.2.2
* :racehorse: Don't reset text buffer when it is not needed to prevent unnecessary tokenisation
* :bug: Fix issue where disabling the minimap package could cause the text editor contents to be removed from the DOM
* Fix where text was blurry because the transform values weren't rounded (#7)

## 0.2.1
* Disable codeglance while selecting code

## 0.2.0
* Update styling
* Fix issue where the height of the editor was off by a few pixels

## 0.1.9
* Add `softWrap` setting that controls soft wrapping in the codeglance view

## 0.1.8
* Fix crash on minimap plugin deactivation

## 0.1.7
* Fix issue where text was red

## 0.1.6
* Reflect soft wrap state in the codeglance view

## 0.1.5
* Better soft wrap support
* Fix issue where codeglance would sometimes show only the first lines of the editor
* Always hide non-line-number gutters
* Rename setting `showGutter` to `showLineNumbers`
* Rename setting `useSyntaxTheme` to `highlightCode`

## 0.1.4
* Fix crash

## 0.1.3
* Fix issue where the number of lines shown was incorrect after resizing the editor font

## 0.1.2
* Styling fixes and tweaks

## 0.1.1
* Fix padding on the left side when the gutter is hidden
* Fix issue where codeglance would be hidden on the first line

## 0.1.0
* Setting to hover codeglance view next to cursor (default)
* Better soft wrapping handling
* Hide codeglance while dragging the minimap

## 0.0.6
* Add option to show or hide gutter
* Fix issue when file contains lots of successive newlines

## 0.0.5
* Add line wrapping support

## 0.0.4
* Add `useSyntaxTheme` setting

## 0.0.3
* Add modal panel
* Fix some activation/deactivation issues

## 0.0.2
* Fix readme

## 0.0.1
* First release
