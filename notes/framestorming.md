# TITLE

## Classes

### UiElement
* id - unique identifier
* truePosition {top, left} - absolute distance from parent's origin
* verticalAlignment {top | center | bottom}
* horizontalAlignment {left | center | right}
* position {top, left} - offset from aligned position
* visible - whether or not it renders/draws
* children
* parent

### MouseInteractive : UiElement
* onClick()
* onMouseMove()
* onMouseEnter()
* onMouseLeave()
* active - whether or not it is listening to events

* MouseEnter/Leave will never propagate
* MouseEnter/Leave is an artifact of MouseMove

### KeyboardInteractive : MouseInteractive
* onKeyDown()
* onKeyUp()
* onFocus()
* onLoseFocus()
* onCharacter()

### Button : KeyboardInteractive
* label
* state {none, over, focus, active}
* backgroundStyleMap - one for each state

###
