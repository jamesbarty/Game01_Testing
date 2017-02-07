define([
  'lib/drawTarget'
], function(DrawTarget) {
  'use strict';

  function DrawThroughContext(ctx, offsetX, offsetY, width, height)
  {
    DrawTarget.call(this, width, height);
    this.x = offsetX;
    this.y = offsetY;
    this.ctx = ctx;
  }

  DrawThroughContext.prototype = Object.create(DrawTarget1.prototype);

  return {
    fillRect: function(x, y, w, h) {
      var absX = x + offsetX,
       absY = y + offsetY;
       // if outside the bounds do not draw
       if (x >= width || y >= height || x + w < 0 || y + h < 0) {
         return;
       }
       var clippedX = Math.max(x, 0),
       clippedY = Math.max(y, 0),
       clippedW = Math.min(w, w - (x + w - (0 + width)), w + x),
       clippedH = Math.min(h, h - (y + h - (0 + height)), h + y);
       ctx.fillRect(offsetX + clippedX, offsetY + clippedY, clippedW, clippedH);
    },
    setFillStyle: function(style) {
      ctx.fillStyle = style;
    }
  };

  return DrawThroughContext;
});
