define([], function() {
  'use strict';

  function KeyboardInteractive() {

  }

  KeyBoardInteractive.prototype = Object.create(MouseInteractive.prototype);

  var _super = UiElement.prototype;

  KeyboardInteractive.prototype.onKeyDown = function(e) {

  };

  KeyboardInteractive.prototype.onKeyUp = function(e) {

  };

  KeyboardInteractive.prototype.onCharacter = function() {

  };

  KeyboardInteractive.prototype.onFocus = function(e) {

  };

  KeyboardInteractive.prototype.onLoseFocus = function() {

  };

  return KeyboardInteractive;
});
