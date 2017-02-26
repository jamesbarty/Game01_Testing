define(['lib/constants'], function (constants) {
  'use strict';

  function MouseEvt(e, offsetLeft, offsetTop) {
    if (e instanceof MouseEvt) {
      this.x = e.x;
      this.y = e.y;
      this.offsetX = e.offsetX - offsetLeft;
      this.offsetY = e.offsetY - offsetTop;
    }
    else {
      var crect = document.getElementById('mainCanvas').getBoundingClientRect();
      var x = e.offsetX ? e.offsetX : e.pageX - crect.left;
      var y = e.offsetY ? e.offsetY : e.pageY - crect.top;

      x = Math.floor(x / constants.LOGICAL_PIXEL_EDGE);
      y = Math.floor(y / constants.LOGICAL_PIXEL_EDGE);
      this.x = x;
      this.y = y;
      this.offsetX = x;
      this.offsetY = y;
    }
    this.stopped = false;
  }

  MouseEvt.prototype.stopPropagation = function () {
    this.stopped = true;
  }

  return MouseEvt;
});
