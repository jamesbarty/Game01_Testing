define([
  'lib/uiElement',
  'lib/util',
  'lib/mouseEvent'
], function(UiElement, Util, MouseEvt) {
  'use strict';

  function MouseInteractive(params) {
    UiElement.call(this, params);

    this.active = params.active || true; ///< Whether or not this element accepts events
    this.lastMoveTarget = null; ///< The last child element that consumed a mouse move event
  }

  MouseInteractive.prototype = Object.create(UiElement.prototype);

  var _super = UiElement.prototype;

  MouseInteractive.prototype._onClick = function(e) {
    if (!this.active) {
      return false;
    }
    console.log('MouseInteractive ' + this.id + ' handled click');
  };

  //////////////////////////////////////////////////////////////////////////////////
  MouseInteractive.prototype._onMouseLeave = function(e) {
    if (this.lastMoveTarget && this.lastMoveTarget.active) {
      var lastTargetEvent = new MouseEvt(e, this.lastMoveTarget.truePosition.left, this.lastMoveTarget.truePosition.top);
      this.lastMoveTarget._onMouseLeave(lastTargetEvent);
      this.lastMoveTarget = null;
    }
    if (Util.isFunction(this.onMouseLeave)) {
      this.onMouseLeave(e);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////
  MouseInteractive.prototype._onMouseMove = function(e) {
    // On the way down
    if (Util.isFunction(this.onMouseMoveCapture)) {
      this.onMouseMoveCapture(e);
    }

    // Did I kill it?
    if (e.stopped) {
      return;
    }

    // If not, send down the pipe
    var childEvent,
        found = false;
    for (var i = this.children.length - 1; i >= 0; i--) {
      // Only check children that contain the event coordinates
      var child = this.children[i];
      if (Util.pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
        if (child.active && child instanceof MouseInteractive) {
          childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
          child._onMouseMove(childEvent);
          // check for mouse enter
          if (child != this.lastMoveTarget) {
            // check for mouse leave
            if (this.lastMoveTarget && this.lastMoveTarget.active && Util.isFunction(this.lastMoveTarget.onMouseLeave)) {
              var lastTargetEvent = new MouseEvt(e, this.lastMoveTarget.truePosition.left, this.lastMoveTarget.truePosition.top);
              this.lastMoveTarget._onMouseLeave(lastTargetEvent);
            }
            if (Util.isFunction(child.onMouseEnter)) {
              child.onMouseEnter(childEvent);
            }
          }
        }
        this.lastMoveTarget = child;
        found = true;
        break;
      }
    }
    // I'm not on any of my children, which means if I was last time, it needs a mouseleave
    if (!found) {
      if (this.lastMoveTarget && this.lastMoveTarget.active && Util.isFunction(this.lastMoveTarget.onMouseLeave)) {
        var lastTargetEvent = new MouseEvt(e, this.lastMoveTarget.truePosition.left, this.lastMoveTarget.truePosition.top);
        this.lastMoveTarget._onMouseLeave(lastTargetEvent);
      }
      this.lastMoveTarget = null;
    }

    // Did the event get killed before returning?? Skip it then
    if (childEvent && childEvent.stopped) {
      return;
    }

    // On the way up
    if (Util.isFunction(this.onMouseMove)) {
      this.onMouseMove(e);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////
  MouseInteractive.prototype._onMouseDown = function(e) {
    // On the way down
    if (Util.isFunction(this.onMouseDownCapture)) {
      this.onMouseDownCapture(e);
    }

    // Did I kill it?
    if (e.stopped) {
      return;
    }

    // If not, send down the pipe
    var childEvent;
    for (var i = this.children.length - 1; i >= 0; i--) {
      // Only check children that contain the event coordinates
      var child = this.children[i];
      if (Util.pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
        if (child.active && child instanceof MouseInteractive) {
          childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
          child._onMouseDown(childEvent);
        }
        // One child only
        break;
      }
    }

    // Did the event get killed before returning?? Skip it then
    if (childEvent && childEvent.stopped) {
      return;
    }

    // On the way up
    if (Util.isFunction(this.onMouseDown)) {
      this.onMouseDown(e);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////
  MouseInteractive.prototype._onMouseUp = function(e) {
    // On the way down
    if (Util.isFunction(this.onMouseUpCapture)) {
      this.onMouseUpCapture(e);
    }

    // Did I kill it?
    if (e.stopped) {
      return;
    }

    // If not, send down the pipe
    var childEvent;
    for (var i = this.children.length - 1; i >= 0; i--) {
      // Only check children that contain the event coordinates
      var child = this.children[i];
      if (Util.pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
        if (child.active && child instanceof MouseInteractive) {
          childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
          child._onMouseUp(childEvent);
        }
        // One child only
        break;
      }
    }

    // Did the event get killed before returning?? Skip it then
    if (childEvent && childEvent.stopped) {
      return;
    }

    // On the way up
    if (Util.isFunction(this.onMouseUp)) {
      this.onMouseUp(e);
    }
  };

  MouseInteractive.prototype.enable = function(bool) {
    console.log('MouseInteractive ' + this.id + ' enabled ' + bool);
    this.active = bool;
  }

  return MouseInteractive;
});
