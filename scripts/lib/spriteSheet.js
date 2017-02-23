define(['lib/ImageManager'], function(ImageManager) {
  'use strict';

  // holds all information for a SpriteSheet
  // i.e. the frame data and animation data of the SpriteSheet
  // all sprites that use the spritesheet use this same object???

  function SpriteSheet(data) {
    this.source = data.source;
    this.frames = data.frames;
    this.animations = data.animations;
  }

  return SpriteSheet;
});
