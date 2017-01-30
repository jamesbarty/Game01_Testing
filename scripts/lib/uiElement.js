define([], function() {
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
  }

  UiElement.prototype.show = function(bool) {
    console.log('UiElement ' + this.id + ' shown');
    this.visible = bool;
  };

  UiElement.prototype.setPosition = function(top, left) {
    console.log('UiElement ' + this.id + ' position set');
    this.top = top;
    this.left = left;
  };

  UiElement.prototype.addChild = function(child) {
    console.log('UiElement ' + this.id + ' got child ' + child.id);
    this.children.push(child);
  }

  return UiElement;
});
