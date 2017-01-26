define('lib/uiElement', [], function() {
  'use strict';

  function UiElement(top, left) {
    this.top = top || 0;
    this.left = left || 0;
    this.visible = true;
  }

  UiElement.prototype.disable = function() {
    console.log('UiElement disabled');
  }

  return UiElement;
});
