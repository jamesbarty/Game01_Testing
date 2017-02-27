define([
  'lib/drawThroughContext',
  'lib/util'
], function(drawThroughContext, Util) {
  'use strict';

  var uniqueId = 0;

  // Coordinates refer to pixel centers

  function UiElement(params) {
    this.id = ++uniqueId;                                             ///< Unique ID to this element
    this.name = params.name || "unnamed";                             ///< None-unique user-friendly name
    this.truePosition = params.truePosition || {left: 0, top: 0};     ///< Position of top left corner rel. parent's top left corner
    this.size = params.size || {width: 0, height: 0};                 ///< This element's height
    this.visible = params.visible || true;                            ///< This element's visibility
    this.children = [];                                               ///< This element's children
    this.parent = params.parent || null;                              ///< This element's parent
    this.verticalAlignment = params.verticalAlignment || 'top';       ///< Vertical alignment: {top, center, bottom}
    this.horizontalAlignment = params.horizontalAlignment || 'left';  ///< Horizontal alignment: {left, center, right}
    this.position = params.position || {left: 0, top: 0};             ///< Offset from alignment-determined position

    this.r = Util.randBetween(0,255);
    this.g = Util.randBetween(0,255);
    this.b = Util.randBetween(0,255);

    this.calculateTruePosition();
  }

  UiElement.prototype.show = function(bool) {
    console.log('UiElement ' + this.id + ' shown');
    this.visible = bool;
  };

  UiElement.prototype.setPosition = function(top, left) {
    console.log('UiElement ' + this.id + ' position set');
    this.position.top = top;
    this.position.left = left;
    this.calculateTruePosition();
  };

  UiElement.prototype.setWidth = function(width) {
    this.size.width = width;
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].parentDimensionsChanged();
    }
  };

  UiElement.prototype.parentDimensionsChanged = function() {
    this.calculateTruePosition();
  };

  UiElement.prototype.calculateTruePosition = function() {
    if (this.parent === null) {
      // should only be the toplevel elt
      this.truePosition = {
        left: 0,
        top: 0
      }
      return;
    }

    switch (this.verticalAlignment) {
      case "top":
        this.truePosition.top = this.position.top;
        break;
      case "center":
        this.truePosition.top = Math.floor((this.parent.size.height - this.size.height) / 2) + this.position.top;
        break;
      case "bottom":
        this.truePosition.top = this.parent.size.height - this.size.height + this.position.top;
        break;
      default:
        console.error("Cannot calculate true position: invalid vertical alignment " + this.verticalAlignment)
    }

    switch (this.horizontalAlignment) {
      case "left":
        this.truePosition.left = this.position.left;
        break;
      case "center":
        this.truePosition.left = Math.floor((this.parent.size.width - this.size.width) / 2) + this.position.left;
        break;
      case "right":
        this.truePosition.left = this.parent.size.width - this.size.width + this.position.left;
        break;
      default:
        console.error("Cannot calculate true position: invalid horizontal alignment " + this.horizontalAlignment)
    }
  };

  UiElement.prototype.addChild = function(child) {
    console.log('UiElement ' + this.id + ' got child ' + child.id);
    if (child.parent !== null) {
      console.error('Cannot add child: child already has a parent');
      return;
    }
    child.parent = this;
    child.calculateTruePosition();
    this.children.push(child);
  };

  UiElement.prototype.removeChild = function(child) {
    var i = this.children.indexOf(child);
    if (i !== -1) {
      this.children.splice(i, 1);
    }
    else {
      console.warn("Failed to remove child: child not found");
    }
  };

  UiElement.prototype._draw = function(drawTarget) {
    this.draw(drawTarget);
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      child._draw(new drawThroughContext(drawTarget, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height));
    }
  };

  UiElement.prototype.draw = function(drawTarget) {
    drawTarget.pushDrawFillRect(0, 0, this.size.width/2, this.size.height, this.r, this.g, this.b, 128);
    drawTarget.pushDrawFillRect(this.size.width/2, 0, this.size.width/2, this.size.height, this.r, this.g, this.b, 255);
  };

  UiElement.prototype._update = function(deltaTime) {
    if (Util.isFunction(this.update)) {
      this.update(deltaTime)
    }
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      child._update(deltaTime);
    }
  };

  // remove and perform checking
  UiElement.prototype.update = function() {

  };

  return UiElement;
});
