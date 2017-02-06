define([
  'lib/drawThroughContext'
], function(drawThroughContext) {
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

  UiElement.prototype._draw = function(ctx) {
    this.draw(ctx);
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      child._draw(drawThroughContext(ctx, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height));
    }
  };

  UiElement.prototype.draw = function(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, this.size.width, this.size.height);
  };

  return UiElement;
});
