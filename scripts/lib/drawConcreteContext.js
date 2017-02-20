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

  DrawConcreteContext.prototype.pushDrawFillRect = function(x, y, w, h, r, g, b, a)
  { this.giftbox.pushDrawFillRect(x, y, w, h, r, g, b, a); };

  DrawConcreteContext.prototype.pushDrawSprite = function(xDest, yDest, xSrc, ySrc, wSrc, hSrc, scale)
  { this.giftbox.pushDrawSprite(xDest, yDest, wDest, hDest, xSrc, ySrc, wSrc, hSrc); };

  DrawConcreteContext.prototype.pushDrawTextLine = function(x, y, str)
  { this.giftbox.pushDrawTextLine(x, y, str) };

  DrawConcreteContext.prototype.pushDrawConcrete = function(x, y, w, h, concreteCtx)
  { this.giftbox.pushDrawConcrete(x, y, w, h, concreteCtx) };

  return DrawConcreteContext;
});
