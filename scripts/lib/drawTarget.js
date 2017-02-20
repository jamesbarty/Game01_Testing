/**
 * \file
 *
 * Defines the DrawTarget module.</br>
 * Used as an interface class for <tt>UiElement</tt>s to draw to
 */

define(function(){
  'use strict';

  function DrawTarget(width_n, height_n)
  {
    if(width_n < 1 || height_n < 1)
      throw "Invalid dimensions";

    this.width = width_n;
    this.height = height_n;
  }

  DrawTarget.prototype.pushDrawFillRect = function() { throw "Not implemented"; };
  DrawTarget.prototype.pushDrawSprite = function() { throw "Not implemented"; };
  DrawTarget.prototype.pushDrawTextLine = function() { throw "Not implemented"; };
  DrawTarget.prototype.pushDrawConcrete = function() { throw "Not implemented"; };

  return DrawTarget;
});
