/**
 * \file
 *
 * Defines the DrawThroughContext module</br>
 * Used as a drawing target which does not have a backing surface; draws directly to parent
 */

define([
  'lib/drawTarget',
  'lib/rgba'
], function(DrawTarget, RGBA) {
  'use strict';

  function DrawThroughContext(parentTarget_n, xOff_n, yOff_n, width_n, height_n)
  {
    /*if(xOff_n < 0 || yOff_n < 0)
      throw "Invalid offsets";
    if(!(parentTarget_n instanceof DrawTarget))
      throw "Invalid parent";
    if(xOff_n + width_n > parentTarget_n.width)
      throw "Child overflows parent width";
    if(yOff_n + height_n > parentTarget_n.height)
      throw "Child overflows parent height";*/

    DrawTarget.call(this, width_n, height_n);
    this.parentTarget = parentTarget_n;
    this.xOff = xOff_n;
    this.yOff = yOff_n;
  }

  DrawThroughContext.prototype = Object.create(DrawTarget.prototype);

  DrawThroughContext.prototype.pushDrawFillRect =
    function(x, y, w, h, r, g, b, a)
  {
    if (x >= this.width || y >= this.height || x + w < 0 || y + h < 0) {
      console.log('failed to draw');
      return;
    }
    var absx = x + this.xOff;
    var absy = y + this.yOff;
    var clippedX = Math.max(x,0);
    var clippedY = Math.max(y,0);
    var clippedW = Math.min(w, w - (w + x - this.width), w + x);
    var clippedH = Math.min(h, h - (h + y - this.height), h + y);

    if (r instanceof RGBA) {
      this.parentTarget.pushDrawFillRect(this.xOff + clippedX, this.yOff + clippedY, clippedW, clippedH, r.r, r.g, r.b, r.a);
    }
    else {
      this.parentTarget.pushDrawFillRect(this.xOff + clippedX, this.yOff + clippedY, clippedW, clippedH, r, g, b, a);
    }
    //this.parentTarget.pushDrawFillRect(x + this.xOff, y + this.yOff, w, h, r, g, b, a);
  };

  DrawThroughContext.prototype.pushDrawConcrete =
    function(xDest, yDest, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc)
  { this.parentTarget.pushDrawConcrete(xDest+this.xOff, yDest+this.yOff, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc); };

  DrawThroughContext.prototype.pushDrawTextLine =
    function(x, y, str)
  { this.parentTarget.pushDrawTextLine(x + this.xOff, y + this.yOff, str); };



  return DrawThroughContext;
});
