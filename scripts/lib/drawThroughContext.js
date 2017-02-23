/**
 * \file
 *
 * Defines the DrawThroughContext module</br>
 * Used as a drawing target which does not have a backing surface; draws directly to parent
 */

define([
  'lib/drawTarget'
], function(DrawTarget) {
  'use strict';

  function DrawThroughContext(parentTarget_n, xOff_n, yOff_n, width_n, height_n)
  {
    if(xOff_n < 0 || yOff_n < 0)
      throw "Invalid offsets";
    if(!(parentTarget_n instanceof DrawTarget))
      throw "Invalid parent";
    if(xOff_n + width_n > parentTarget_n.width)
      throw "Child overflows parent width";
    if(yOff_n + height_n > parentTarget_n.height)
      throw "Child overflows parent height";

    DrawTarget.call(this, width_n, height_n);
    this.parentTarget = parentTarget_n;
    this.xOff = xOff_n;
    this.yOff = yOff_n;
  }

  DrawThroughContext.prototype = Object.create(DrawTarget.prototype);

  DrawThroughContext.prototype.pushDrawFillRect = function(x, y, w, h, r, g, b, a)
  { parentTarget.pushDrawFillRect(x + this.xOff, y + this.yOff, w, h, r, g, b, a); };

  DrawThroughContext.prototype.pushDrawSprite = function(xDest, yDest, wDest, hDest, xSrc, ySrc, wSrc, hSrc)
  { parentTarget.pushDrawSprite(xDest + this.xOff, yDest + this.yOff, wDest, hDest, xSrc, ySrc, wSrc, hSrc); };

  DrawThroughContext.prototype.pushDrawTextLine = function(x, y, str)
  { parentTarget.pushDrawTextLine(x + this.xOff, y + this.yOff, str); };

  DrawThroughContext.prototype.pushDrawConcrete = function(x, y, w, h, concreteCtx)
  { parentTarget.pushDrawConcrete(x + this.xOff, y + this.yOff, w, h, concreteCtx); };

  return DrawThroughContext;
});
