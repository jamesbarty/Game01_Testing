define([
  'lib/mouseInteractive',
  'lib/imageManager'], function(MouseInteractive, ImageManager) {
  'use strict';

  function Sprite(params) {
    MouseInteractive.call(this, params);
    this.spriteSheet = params.spriteSheet;
    this.stopped = false;
    this.currentAnimation = '';
    this.currentFrameDuration = 0;
    this.currentFrameNum = 0;
    this.currentFrame = null;
  }

  Sprite.prototype = Object.create(MouseInteractive.prototype);

  Sprite.prototype.stop = function() {
    this.stopped = true;
  }

  Sprite.prototype.play = function() {
    this.stopped = false;
  }

  Sprite.prototype.update = function(deltaTime) {
    if (!this.stopped) {
      // update current frame duration with delta
      // if over, switch to next frame (or not if end and no loop, or transition), reset frame duration
      this.currentFrameDuration += deltaTime;
      var anim = this.spriteSheet.animations[this.currentAnimation];
      var frameDur = anim.frameDuration;
      // go to next frame
      if (this.currentFrameDuration >= frameDur) {
        this.currentFrameDuration -= frameDur;
        this.currentFrameNum = (this.currentFrameNum + 1) % anim.frames.length;
        // End of non-looping animation
        if (this.currentFrameNum === 0 && anim.looping === false) {
          // Check if transition
          if (anim.transition) {
            this.gotoAndPlay(anim.transition);
          }
          this.stop();
          return;
        }
        this.currentFrame = this.spriteSheet.frames[this.spriteSheet.animations[this.currentAnimation].frames[this.currentFrameNum]];
      }
    }
  }

  Sprite.prototype.draw = function(ctx) {
    if (this.currentFrame != null) {
      for (var i = 0; i < 1; i++) {
      ctx.drawImage(this.spriteSheet.source, this.currentFrame[0], this.currentFrame[1], this.currentFrame[2], this.currentFrame[3],
                                          this.truePosition.left, this.truePosition.top, this.currentFrame[2], this.currentFrame[3]);
      }
    }
  }

  Sprite.prototype.gotoAndPlay = function(animation) {
    this.currentAnimation = animation;
    this.currentFrameDuration = 0;
    this.currentFrameNum = 0;
    this.currentFrame = this.spriteSheet.frames[this.spriteSheet.animations[this.currentAnimation].frames[this.currentFrameNum]];
    this.play();
  }

  Sprite.prototype.gotoAndStop = function(animation) {
    this.currentAnimation = animation;
    this.currentFrameDuration = 0;
    this.currentFrameNum = 0;
    this.currentFrame = this.spriteSheet.frames[this.spriteSheet.animations[this.currentAnimation].frames[this.currentFrameNum]];
    this.stop();
  }

  return Sprite;
});
