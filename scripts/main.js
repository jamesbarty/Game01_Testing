require([
  'lib/uiElement',
  'lib/mouseInteractive',
  'lib/mouseEvent',
  'lib/drawThroughContext',
  'lib/keyboardManager'
], function(UiElement, MouseInteractive, MouseEvt, DrawThroughContext, KeyboardManager){
  'use strict';
  var FPS = 60;

  var topLevel = new MouseInteractive({
    size: {
      width: 640,
      height: 480
    }
  });

  /*var mouse = new MouseInteractive({
    truePosition: {
      left: 50,
      top: 50
    },
    size: {
      width: 50,
      height: 50
    }
  });

  topLevel.addChild(mouse);*/


  var newThing = new MouseInteractive({
    name: 'parent',
    position: {
      left: 50,
      top: 50
    },
    size: {
      width: 200,
      height: 100
    }
  });
  newThing.onMouseEnter = function(e) {
    console.log('parent enter');
    //console.log(e);
  }
  newThing.onMouseLeave = function(e) {
    console.log('parent leave');
  }

  topLevel.addChild(newThing);

  var newThing2 = new MouseInteractive({
    name: 'child',
    horizontalAlignment: 'right',
    verticalAlignment: 'bottom',
    position: {
      left: 10,
      top: -10
    },
    size: {
      width: 50,
      height: 50
    }
  });
  newThing2.onMouseEnter = function(e) {
    console.log('child enter');
    //console.log(e);
  }
  newThing2.onMouseLeave = function(e) {
    console.log('child leave');
  }

  newThing.addChild(newThing2);


  var canvas = document.getElementById('mainCanvas'),
      ctx = canvas.getContext('2d');
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.oncontextmenu = function() {return false};
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function onMouseDown(e) {
    topLevel._onMouseDown(new MouseEvt(e));
    //console.log(e);
  }

  function onMouseUp(e) {
    topLevel._onMouseUp(new MouseEvt(e));
  }

  function onMouseMove(e) {
    topLevel._onMouseMove(new MouseEvt(e));
  }

  function onKeyDown(e) {
    KeyboardManager.onKeyDown(e);
  }

  function onKeyUp(e) {
    KeyboardManager.onKeyUp(e);
  }

  var gameLoop = setInterval(function() {
    //update();
    ctx.clearRect(0,0,640,480);
    topLevel._draw(ctx);
  }, 1000 / FPS);

});
