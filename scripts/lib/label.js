define([
  'lib/mouseInteractive',
  'lib/constants',
  'lib/imageManager',
  'lib/util'
], function(MouseInteractive, Constants, ImageManager, Util) {
  'use strict';

  function Label(params) {
    MouseInteractive.call(this, params);
    this.count = 0;
    this.textLines = [];
    this.textLinePositions = [];
    this.text = params.text || '';
    this.textHAlign = params.textHAlign || 'left';
    this.textVAlign = params.textVAlign || 'top';
    this.wrapping = params.wrapping || 'none';
    this.textBaseline = params.textBaseline || 'top';
    this.lineHeight = params.lineHeight || 8;
    this.frame = 0;
    this.glyphData = Constants.FAWNT_7PT_MAP;
    this.fontHeight = 7;
    this.updateText();
  }

  Label.prototype = Object.create(MouseInteractive.prototype);

  Label.prototype.draw = function(drawTarget) {
    //this.prototype.prototype.draw();

    for (var i = 0; i < this.textLines.length; i++) {
      var drawX = 0;
      var w = 0;
      var x = 0;
      for (var j = 0; j < this.textLines[i].text.length; j++) {
        var char = this.textLines[i].text[j];
        var glyphData = Constants.FAWNT_7PT_MAP[char.toLowerCase()];
        w = glyphData.w;
        x = glyphData.x;
        drawTarget.pushDrawConcrete(drawX + this.textLinePositions[i].x, this.textLinePositions[i].y, Math.floor(w / 2), Math.floor(7 / 2), ImageManager.jamal, x, 0, w, 7);
        drawX += Math.floor(glyphData.w / 2);
      }
    }

    
    
    //ctx.fillText(this.text + '', 50 + x, 50);
  }

  Label.prototype.update = function(deltaTime) {
    this.frame += 1;
    if (this.frame >= 60) {
      this.frame = 0;
      this.text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      for (var i = 0; i < 80; i++) {
        if ((i+1) % 9 === 0) {
          this.text += ' ';
          continue;
        }
        this.text += possible[Util.randBetween(0, possible.length - 1)];
      }
      console.log(this.text);
      this.updateText();
    }
    
    //this.text = ++(this.count) + '';
  }

  Label.prototype.updateText = function() {
    this.textLines = [];
    switch (this.wrapping) {
      // One line of text
      case 'none':
        this.textLines = [{
          text: this.text,
          width: this.measureText(this.text),
        }];
        break;
      case 'word':
        var words = this.text.split(' ');
        var run = '';
        var runLength = 0;
        var index = 0;
        for (var i = 0; i < words.length; i++) {
          // first word dont get no space in front
          var wordlen = this.measureText((index === 0 ? '': ' ') + words[i]);
          // oh no can't fit it
          if (runLength + wordlen > this.size.width) {
            // first word on a line needs to be wrapped at characters if can't fit
            if (index === 0) {

            }
            // this word needs to go on next line, flush it
            else {
              this.textLines.push({
                text: run,
                width: runLength
              });
              run = '';
              runLength = 0;
              index = 0;
              // look at this word again
              i -= 1;
            }
          }
          // can fit the word, add it
          else {
            run += (index === 0 ? '': ' ') + words[i];
            runLength += wordlen;
            index += 1;
          }
        }
        // ran out of words, flush any existing line
        if (run != '') {
          this.textLines.push({
            text: run,
            width: runLength
          });
          run = '';
          runLength = 0;
          index = 0;
        }
        break;
      case 'character':
        var run = '';
        var runLength = 0;
        var index = 0;
        for (var i = 0; i < this.text.length; i++) {
          // first word dont get no space in front
          var charlen = this.measureText(this.text[i]);
          // oh no can't fit it
          if (runLength + charlen > this.size.width) {
            // this char needs to go on next line, flush it
            this.textLines.push({
              text: run,
              width: runLength
            });
            run = '';
            runLength = 0;
            index = 0;
            i -= 1;
          }
          // can fit the char, add it
          else {
            // Don't want a space starting a line
            if (this.text[i] != ' ' || index != 0) {
              run += this.text[i];
              runLength += charlen;
              index += 1;
            }
          }
        }
        // ran out of words, flush any existing line
        if (run != '') {
          this.textLines.push({
            text: run,
            width: runLength
          });
          run = '';
          runLength = 0;
          index = 0;
        }
        break;
      default:
        console.error('Cannot update text, unsupported wrapping type ' + this.wrapping);
    }
    this.updateLinePositions();
  }

  Label.prototype.updateLinePositions = function() {
    this.textLinePositions = [];
    var numLines = this.textLines.length;
    for (var i = 0; i < numLines; i++) {
      var x, y;
      switch (this.textHAlign) {
        case 'left':
          x = 0;
          break;
        case 'center':
          x = Math.floor((this.size.width - this.textLines[i].width) / 2);
          break;
        case 'right':
          x = this.size.width - this.textLines[i].width;
          break;
        default:
          console.log('Invalid textHAlign: ' + this.textHAlign);
      }
      switch (this.textVAlign) {
        case 'top':
          y = i * this.lineHeight;
          break;
        case 'center':
          var textHeight = (this.lineHeight - this.fontHeight) * (numLines - 1) + this.fontHeight * numLines;
          y = Math.floor((this.size.height - textHeight) / 2) + i * this.lineHeight;
          break;
        case 'bottom':
          var textHeight = (this.lineHeight - this.fontHeight) * (numLines - 1) + this.fontHeight * numLines;
          y = this.size.height - textHeight + i * this.lineHeight
          break;
        default:
          console.log('Invalid textVAlign: ' + this.textVAlign);
      }
      this.textLinePositions.push({
        x: x,
        y: y
      })
    }
  }

  Label.prototype.measureText = function(text) {
    text = text.toLowerCase();
    var length = 0;
    for (var i = 0; i < text.length; i++) {
      length += this.glyphData[text[i]].w;
    }
    return length;
  }

  Label.prototype.setText = function(text) {
    this.text = text;
  }

  return Label;
});
