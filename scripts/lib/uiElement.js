define([], function() {
  'use strict';

  var uniqueId = 0;

  function UiElement(params) {
    this.id = ++uniqueId;
    this.name = params.name || "unnamed";
    this.truePosition = params.truePosition || {left: 0, top: 0};
    this.size = params.size || {left: 0, top: 0};
    this.visible = params.visible || true;
    this.children = [];
    this.parent = params.parent || null;
    this.verticalAlignment = params.verticalAlignment || 'top';
    this.horizontalAlignment = params.horizontalAlignment || 'left';
    this.position = params.position || {left: 0, top: 0};
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
