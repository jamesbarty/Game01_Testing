require(['lib/uiElement', 'lib/mouseInteractive'], function(UiElement, MouseInteractive){
  'use strict';
  var FPS = 60;

  var topLevel = new MouseInteractive({
    size: {
      width: 640,
      height: 480
    }
  });

  var mouse = new MouseInteractive({
    truePosition: {
      left: 50,
      top: 50
    },
    size: {
      width: 50,
      height: 50
    }
  });

  topLevel.addChild(mouse);


  var canvas = document.getElementById('mainCanvas');
  canvas.addEventListener('mousedown', topLevel.onMouseDown.bind(topLevel));
  canvas.addEventListener('mouseup', topLevel.onMouseUp.bind(topLevel));
  canvas.addEventListener('mousemove', topLevel.onMouseMove.bind(topLevel));

  var gameLoop = setInterval(function() {
    //update();
    //draw();
  }, 1000 / FPS);

});
