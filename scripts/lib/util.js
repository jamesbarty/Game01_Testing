define([], function() {
  'use strict';

  var Util = {
    pointInRect: function(px, py, x, y, w, h) {
      if (px < x ||
          px > x + w ||
          py < y ||
          py > y + h) {
        return false;
      }
      return true;
    },

    isFunction: function(prop) {
      return typeof(prop) === 'function' ;
    },

    randBetween: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  return Util;
});
