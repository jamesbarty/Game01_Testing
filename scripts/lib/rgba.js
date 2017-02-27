define([], function () {
  'use strict';

  function RGBA(r, g, b, a) {
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
    this.a = a || 255;
  }

  RGBA.red = new RGBA(255, 0, 0);
  RGBA.green = new RGBA(0, 255, 0);
  RGBA.blue = new RGBA(0, 0, 255);



  return RGBA;
});
