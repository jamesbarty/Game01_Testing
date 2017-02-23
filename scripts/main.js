require([
  'lib/uiElement',
  'lib/mouseInteractive',
  'lib/mouseEvent',
  'lib/drawThroughContext',
  'lib/keyboardManager',
  'lib/imageManager',
  'lib/coreGfxEng',
  'lib/constants'
], function(UiElement,
            MouseInteractive,
            MouseEvt,
            DrawThroughContext,
            KeyboardManager,
            ImageManager,
            CoreGfxEng,
            constants)
{
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


  var canvas = document.getElementById('mainCanvas');

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

  var old = performance.now();
  var gameFunc = function() {
    //console.log('loaded');
    //console.log(performance.now() - old);
    //var gameLoop = setInterval(function() {
      //update();
      //ctx.clearRect(0,0,640,480);
      topLevel._draw(ctx);

      var a = [];
      var o = {};
      for (var i = 0; i < 10000; i++) {
        a[i] = i;
        o[i] = i;
        //ctx.drawImage(ImageManager.image['fawnt'], 0, 0);
        //ctx.globalCompositeOperation = 'source-in';
        //ctx.fillStyle = "blue";
        //ctx.fillRect(0, 0, 640, 50);
        //ctx.globalCompositeOperation = 'source-over';
      }
      var old = performance.now();
      var sum = 0;
      for (var i = 0; i < 10000; i++) {
        sum += o[i];
      }
      console.log(performance.now() - old);
    //}, 1000 / FPS);
  };

  ImageManager.addImage('back1.jpg', 'one');
  ImageManager.addImage('back2.jpg', 'two');
  ImageManager.addImage('back3.jpg', 'three');
  ImageManager.addImage('back4.jpg', 'four');
  ImageManager.addImage('back5.jpg', 'five');
  ImageManager.addImage('back6.jpg', 'six');
  ImageManager.addImage('back7.jpg', 'seven');
  ImageManager.addImage('back8.jpg', 'eight');
  ImageManager.addImage('back9.jpg', 'nine');
  //ImageManager.addImage('large.jpg', 'ten');
  //ImageManager.addImage('large.png', 'eleven');
  ImageManager.addImage('fawnt_7pt.png', 'fawnt');
  ImageManager.addImage('res/index.jpg', constants.MAIN_SPRITE_SHEET_ID); // 512x512 for demo

  ImageManager.loadImages(gameFunc);

  var coreGfxEng = CoreGfxEng(canvas, ImageManager);
  var concCtx = coreGfxEng.createConcreteContext(constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT);
  var mainCtx = coreGfxEng.getRootConcreteContext();
  concCtx.pushDrawSprite(0, 0, 128, 128, 128, 128, 256, 256);
  mainCtx.pushDrawConcrete(0, 0, concCtx.width, concCtx.height, concCtx);

});
