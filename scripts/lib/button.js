define([
  'lib/mouseInteractive',
  'lib/label',
  'lib/drawThroughContext',
  'lib/rgba'
], function(MouseInteractive, Label, DrawThroughContext, RGBA) {
  'use strict';


  function Button(params) {
    MouseInteractive.call(this, params);

    this.label = new Label({
      text: params.text || '',
      size: {
        width: this.size.width,
        height: this.size.height
      },
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      textHAlign: 'center',
      textVAlign: 'center',
      wrapping: 'none'
    });
    this.state = 'none'; // none, hover, active
    this.styles = params.styles || [new RGBA(255, 255, 255), new RGBA(128, 128, 128), RGBA.red];
  }

  Button.states = {
    'none': 0,
    'hover': 1,
    'active': 2
  }

  Button.prototype = Object.create(MouseInteractive.prototype);

  var _super = MouseInteractive.prototype;

  Button.prototype._onMouseDown = function(e) {
    this.state = 'active';
    _super._onMouseDown.call(this, e);
  }

  Button.prototype._onMouseUp = function(e) {
    this.state = 'hover';
    _super._onMouseUp.call(this, e);
  }

  Button.prototype._onMouseEnter = function(e) {
    if (this.maybeClicked) {
      this.state = 'active';
    }
    else {
      this.state = 'hover';
    }
    _super._onMouseEnter.call(this, e);
  };

  Button.prototype._onMouseLeave = function(e) {
    this.state = 'none';
    _super._onMouseLeave.call(this, e);
  };

  Button.prototype.draw = function(drawTarget) {
    switch (this.state) {
      case 'none':
        drawTarget.pushDrawFillRect(0, 0, this.size.width, this.size.height, this.styles[Button.states[this.state]]);
        break;
      case 'hover':
        drawTarget.pushDrawFillRect(0, 0, this.size.width, this.size.height, this.styles[Button.states[this.state]]);
        break;
      case 'active':
        drawTarget.pushDrawFillRect(0, 0, this.size.width, this.size.height, this.styles[Button.states[this.state]]);
        break;
      default:
        console.error('Unsupported button state: ' + this.state);
    }
    var l = this.label;
    l.draw(new DrawThroughContext(drawTarget, l.truePosition.left, l.truePosition.top, l.size.width, l.size.height));
  };

  return Button;
});
