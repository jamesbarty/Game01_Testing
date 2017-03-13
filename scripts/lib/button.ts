import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';
import MouseEvt from './mouseEvent';
import Label from './label';
import DrawTarget from './drawTarget';
import DrawThroughContext from './drawThroughContext';
import RGBA from './rgba';
import { Rect } from './geometry';
import SpriteSheet from './spriteSheet';

export interface IButtonParams extends IMouseInteractiveParams {
	text: string;
	styles: RGBA[];
	spriteSheet: SpriteSheet;
}

const enum ButtonStates {
	"none" = 0,
	"hover" = 1,
	"active" = 2
}

export default class Button extends MouseInteractive {
	label: Label;
	state: ButtonStates;
	styles: RGBA[];
	spriteSheet: SpriteSheet;

	constructor(params: IButtonParams) {
		super(params);

		this.spriteSheet = params.spriteSheet;
		this.state = ButtonStates.none; // none, hover, active
		this.styles = params.styles || [new RGBA(255, 255, 255), new RGBA(128, 128, 128), RGBA.red];

		this.label = new Label({
			text: params.text || '',
			size: {
				width: this.size.width,
				height: this.size.height
			},
			hAlign: 'center',
			vAlign: 'center',
			textHAlign: 'center',
			textVAlign: 'center',
			wrapping: 'none',
			spriteSheet: this.spriteSheet
		});
	}

	_onMouseDown(e: MouseEvt) {
		this.state = ButtonStates.active;
		super._onMouseDown.call(this, e);
	}

	_onMouseUp(e: MouseEvt) {
		this.state = ButtonStates.hover;
		super._onMouseUp.call(this, e);
	}

	_onMouseEnter(e: MouseEvt) {
		if (this.maybeClicked) {
			this.state = ButtonStates.active;
		}
		else {
			this.state = ButtonStates.hover;
		}
		super._onMouseEnter.call(this, e);
	}

	_onMouseLeave(e: MouseEvt) {
		this.state = ButtonStates.none;
		super._onMouseLeave.call(this, e);
	}

	draw(drawTarget: DrawTarget) {
		const r = new Rect(0, 0, this.size.width, this.size.height);
		drawTarget.pushDrawFillRect(r, this.styles[this.state]);
		const l = this.label;
		l.draw(new DrawThroughContext(drawTarget, l.truePosition.left, l.truePosition.top, l.size.width, l.size.height));
	}
}
