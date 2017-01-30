define(['lib/uiElement'], function(UiElement) {
  'use strict';

  function MouseInteractive(params) {
    UiElement.call(this, params);

    this.active = params.active || true;
  }

  MouseInteractive.prototype = Object.create(UiElement.prototype);

  var _super = UiElement.prototype;

  MouseInteractive.prototype.onClick = function(e) {
    console.log('MouseInteractive ' + this.id + ' handled click');
  };

  MouseInteractive.prototype.onMouseEnter = function(e) {
    console.log('MouseInteractive ' + this.id + ' handled mouse enter');
  };

  MouseInteractive.prototype.onMouseLeave = function(e) {
    console.log('MouseInteractive ' + this.id + ' handled mouse leave');
    //console.log(e);
  };

  MouseInteractive.prototype.onMouseMove = function(e) {
    //console.log('MouseInteractive ' + this.id + ' handled mouse move');
    //console.log(e);
  };

  MouseInteractive.prototype.onMouseDown = function(e) {
    console.log('MouseInteractive ' + this.id + ' handled mouse down');
    //console.log(e);
  };

  MouseInteractive.prototype.onMouseUp = function(e) {
    console.log('MouseInteractive ' + this.id + ' handled mouse up');
    //console.log(e);
  };

  MouseInteractive.prototype.enable = function(bool) {
    console.log('MouseInteractive ' + this.id + ' enabled ' + bool);
    this.active = bool;
  }

  return MouseInteractive;
});
