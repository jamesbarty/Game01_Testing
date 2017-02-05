define([], function() {
  'use strict';

  return {
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
    }
  }

  return Util;
});
