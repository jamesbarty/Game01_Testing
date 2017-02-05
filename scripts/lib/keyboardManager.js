define([], function() {
  'use strict';

  var KeyboardManager = (function() {

    var state = {};

    return {
      getKeyState: function(key) {
        return state;
      },
      onKeyDown: function(e) {
        console.log(e.keyCode);
        state[e.keyCode] = 1;
      },
      onKeyUp: function(e) {
        state[e.keyCode] = 0;
      }
    }
  })();

  return KeyboardManager;
});
