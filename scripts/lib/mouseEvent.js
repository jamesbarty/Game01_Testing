define([], function() {
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
      var x = e.offsetX ? e.offsetX : e.pageX - crect.left,
          y = e.offsetY ? e.offsetY : e.pageY - crect.top;
      this.x = x;
      this.y = y;
      this.offsetX = x;
      this.offsetY = y;
    }
    this.stopped = false;
  }

  MouseEvt.prototype.stopPropagation = function() {
    this.stopped = true;
  }

  return MouseEvt;
});
