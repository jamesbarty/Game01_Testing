require([
  'lib/uiElement',
  'lib/mouseInteractive',
  'lib/mouseEvent',
  'lib/drawThroughContext',
  'lib/keyboardManager',
  'lib/imageManager',
  'lib/spriteSheet',
  'lib/sprite',
  'lib/label',
  'lib/button',
  'lib/coreGfxEng',
  'lib/constants'
], function(UiElement,
            MouseInteractive,
            MouseEvt,
            DrawThroughContext,
            KeyboardManager,
            ImageManager,
            SpriteSheet,
            Sprite,
            Label,
            Button,
            CoreGfxEng,
            constants)
{
  'use strict';
  var FPS = 60;

  var topLevel = new MouseInteractive({
    size: {
      width: 160,
      height: 120
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
      left: 20,
      top: 20
    },
    size: {
      width: 40,
      height: 20
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

  var btn = new Button({
    name: 'button',
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    size: {
      width: 30,
      height: 11
    },
    text: 'Click'
  });
  btn.onMouseEnter = function(e) {
    console.log('child enter');
    //console.log(e);
  }
  btn.onMouseLeave = function(e) {
    console.log('child leave');
  }
  btn.onClick = function(e) {
    newThing.setWidth(newThing.size.width + 5);
  }

  newThing.addChild(btn);

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
    if (topLevel.maybeClicked) {
      topLevel._onClick(new MouseEvt(e));
    }
    MouseInteractive.clearMaybeClickedElts();
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

    var coreGfxEng = CoreGfxEng(canvas);
    var concCtx = coreGfxEng.createConcreteContext(constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT);
    var mainCtx = coreGfxEng.getRootConcreteContext();
    var font = ImageManager.image['fawnt'];
    var spriteCtx = coreGfxEng.createConcreteContext(font.width, font.height);
    ImageManager.jamal = spriteCtx;
    spriteCtx.loadImage(font);
    //concCtx.pushDrawFillRect(0,0,30,30,255,0,0,255);
    //concCtx.pushDrawFillRect(50,50,40,40,0,255,0,255);
    mainCtx.pushDrawConcrete(0, 0, concCtx.width, concCtx.height, concCtx);
    //mainCtx.pushDrawConcrete(40, 40, 40, 40, spriteCtx, 0, 0, 20, 20);

    /*var guySpriteSheet = new SpriteSheet({
      source: ImageManager.image['spriteSheet'],
      frames:[
        [0, 0, 12, 17],
        [12, 0, 12, 17],
        [24, 0, 12, 17],
        [36, 0, 12, 17],
        [48, 0, 12, 17]
      ],
      animations: {
        idle: {
          looping: false,
          frames: [0]
        },
        runRight: {
          looping: false,
          frameDuration: 100,
          frames: [1,2,3,4,3,2],
          transition: 'idle'
        }
      }
    });

    var guy = new Sprite({
      spriteSheet: guySpriteSheet,
      position: {
        left: 100,
        top: 100
      },
      size: {
        width: 50,
        height: 50
      }
    });
    guy.onMouseEnter = function() {
      console.log('asdsad');
    }
    guy.gotoAndPlay('runRight');
    topLevel.addChild(guy);*/

    var labe = new Label({
      text: 'weee',
      size: {
        width: 50,
        height: 24
      },
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      wrapping: 'word',
      textHAlign: 'center',
      textVAlign: 'center'
    });
    //topLevel.addChild(labe);
    //console.log('loaded');
    //console.log(performance.now() - old);
    var lastTime = performance.now();
    var gameLoop = setInterval(function() {
      var curTime = performance.now();
      topLevel._update(curTime - lastTime);
      lastTime = curTime;
      topLevel._draw(concCtx);
      mainCtx.pushDrawConcrete(0, 0, concCtx.width, concCtx.height, concCtx);
      /*var a = [];
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
      }*/

      
      //console.log(performance.now() - old);
    }, 1000 / FPS);
  };

  /*ImageManager.addImage('back1.jpg', 'one');
  ImageManager.addImage('back2.jpg', 'two');
  ImageManager.addImage('back3.jpg', 'three');
  ImageManager.addImage('back4.jpg', 'four');
  ImageManager.addImage('back5.jpg', 'five');
  ImageManager.addImage('back6.jpg', 'six');
  ImageManager.addImage('back7.jpg', 'seven');
  ImageManager.addImage('back8.jpg', 'eight');
  ImageManager.addImage('back9.jpg', 'nine');*/
  //ImageManager.addImage('large.jpg', 'ten');
  //ImageManager.addImage('large.png', 'eleven');
  ImageManager.addImage('res/fawnt_7pt_2.png', 'fawnt');

  ImageManager.loadImages(gameFunc);

});
