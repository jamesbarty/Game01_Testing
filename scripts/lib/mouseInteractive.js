define(['lib/uiElement'], function(UiElement) {
  'use strict';

  function MouseInteractive(top, left, active) {
    UiElement.call(this, top, left);

    this.active = active || true;
  }

  MouseInteractive.prototype = Object.create(UiElement.prototype);

  var _super = UiElement.prototype;

  MouseInteractive.prototype.onClick = function() {
    console.log('Click handled');
  };

  MouseInteractive.prototype.onMouseEnter = function() {
    console.log('MouseEnter handled');
  };

  MouseInteractive.prototype.onMouseLeave = function() {
    console.log('MouseLeave handled');
  };

  MouseInteractive.prototype.onMouseMove = function() {
    console.log('MouseMove handled');
  };

  MouseInteractive.prototype.disable = function() {
    console.log('MouseInteractiveDisabled');
    _super.disable.call(this);
  }

  return MouseInteractive;
});
