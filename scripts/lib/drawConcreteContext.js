/**
 * \file
 *
 * Defines the DrawConcreteContext module.</br>
 * Drawing target which has its own backing surface
 */

define([
  'lib/drawTarget'
], function(DrawTarget) {
  'use strict';

  function DrawConcreteContext(giftbox_n, width_n, height_n)
  {
    DrawTarget.call(this, width_n, height_n);
    this.giftbox = giftbox_n;
  }

  DrawConcreteContext.prototype = Object.create(DrawTarget.prototype);

  DrawConcreteContext.prototype.pushDrawFillRect =
    function(x, y, w, h, r, g, b, a)
  { this.giftbox.pushDrawFillRect(x, y, w, h, r, g, b, a); };

  DrawConcreteContext.prototype.pushDrawConcrete =
    function(xDest, yDest, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc)
  { this.giftbox.pushDrawConcrete(xDest, yDest, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc); };

  DrawConcreteContext.prototype.loadImage =
    function(img)
  { this.giftbox.loadImage(img); };

  DrawConcreteContext.prototype.pushDrawTextLine =
    function(x, y, str)
  { this.giftbox.pushDrawTextLine(x, y, str); };



  return DrawConcreteContext;
});
