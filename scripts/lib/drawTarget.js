/**
 * \file
 *
 * Defines the DrawTarget module.</br>
 * Used as an interface class for <tt>UiElement</tt>s to draw to
 */

define(function(){
  'use strict';

  function DrawTarget(width, height)
  {
    DrawTarget.prototype.width = width;
    DrawTarget.prototype.height = height;
  }

  DrawTarget.prototype.clearRect = function(x, y, w, h) { throw "Not implemented"; };
  DrawTarget.prototype.fillRect = function(x, y, w, h) { throw "Not implemented"; };
  DrawTarget.prototype.strokeRect = function(x, y, w, h) { throw "Not implemented"; };

  DrawTarget.prototype.fillText = function(txt, x, y, maxWidth_opt) { throw "Not implemented"; };
  DrawTarget.prototype.strokeText = function(txt, x, y, maxWidth_opt) { throw "Not implemented"; };
  DrawTarget.prototype.measureText = function(txt) { throw "Not implemented"; };

  DrawTarget.prototype.setLineWidth = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setLineCap = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setLineJoin = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setMiterLimit = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.getLineDash = function() { throw "Not implemented"; };
  DrawTarget.prototype.setLineDash = function(segments) { throw "Not implemented"; };
  DrawTarget.prototype.setLineDashOffset = function(val) { throw "Not implemented"; };

  DrawTarget.prototype.setFont = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setTextAlign = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setTextBaseline = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setDirection = function(val) { throw "Not implemented"; }; /* experimental ATM */

  DrawTarget.prototype.setFillStyle = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setStrokeStyle = function(val) { throw "Not implemented"; };

  DrawTarget.prototype.createLinearGradient = function(x0, y0, x1, y1) { throw "Not implemented"; };
  DrawTarget.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1) { throw "Not implemented"; };
  DrawTarget.prototype.createPattern = function(image, repetition) { throw "Not implemented"; };

  DrawTarget.prototype.setShadowBlur = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setShadowColor = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setShadowOffsetX = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setShadowOffsetY = function(val) { throw "Not implemented"; };

  DrawTarget.prototype.beginPath = function() { throw "Not implemented"; };
  DrawTarget.prototype.closePath = function() { throw "Not implemented"; };
  DrawTarget.prototype.moveTo = function(x, y) { throw "Not implemented"; };
  DrawTarget.prototype.lineTo = function(x, y) { throw "Not implemented"; };
  DrawTarget.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) { throw "Not implemented"; };
  DrawTarget.prototype.quadraticCurveTo = function(cpx, cpy, x, y) { throw "Not implemented"; };
  DrawTarget.prototype.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) { throw "Not implemented"; };
  DrawTarget.prototype.arcTo = function(x1, y1, x2, y2, radius) { throw "Not implemented"; };
  DrawTarget.prototype.ellipse = function(x, y, rX, rY, rot, startAngle, endAngle, anticlockwise) { throw "Not implemented"; }; /* experimental ATM */
  DrawTarget.prototype.rect = function(x, y, w, h) { throw "Not implemented"; };

  DrawTarget.prototype.fill = function(a1, a2) { throw "Not implemented"; };
  DrawTarget.prototype.stroke = function(path_opt) { throw "Not implemented"; };
  DrawTarget.prototype.drawFocusIfNeeded = function(a1, a2) { throw "Not implemented"; };
  DrawTarget.prototype.scrollPathIntoView = function(path_opt) { throw "Not implemented"; };
  DrawTarget.prototype.clip = function(a1, a2) { throw "Not implemented"; };
  DrawTarget.prototype.isPointInPath = function(a1, a2, a3, a4) { throw "Not implemented"; };
  DrawTarget.prototype.isPointInStroke = function(a1, a2, a3) { throw "Not implemented"; };

  DrawTarget.prototype.getCurrentTransform = function() { throw "Not implemented"; }; /* experimental ATM */
  DrawTarget.prototype.setCurrentTransform = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.rotate = function(angle) { throw "Not implemented"; };
  DrawTarget.prototype.scale = function(x, y) { throw "Not implemented"; };
  DrawTarget.prototype.translate = function(x, y) { throw "Not implemented"; };
  DrawTarget.prototype.transform = function(a,b,c,d,e,f) { throw "Not implemented"; };
  DrawTarget.prototype.setTransform = function(a,b,c,d,e,f) { throw "Not implemented"; };
  DrawTarget.prototype.resetTransform = function() { throw "Not implemented"; }; /* experimental ATM */

  DrawTarget.prototype.setGlobalAlpha = function(val) { throw "Not implemented"; };
  DrawTarget.prototype.setGlobalCompositeOperation = function(val) { throw "Not implemented"; };

  DrawTarget.prototype.drawImage = function(img, a2, a3, a4, a5, a6, a7, a8, a9) { throw "Not implemented"; };

  DrawTarget.prototype.createImageData = function(a1, a2) { throw "Not implemented"; };
  DrawTarget.prototype.getImageData = function(x, y, w, h) { throw "Not implemented"; };
  DrawTarget.prototype.putImageData = function(img, x, y, dirtyX_opt, dirtyY_opt, dirtyW_opt, dirtyH_opt) { throw "Not implemented"; };

  return DrawTarget;
});
