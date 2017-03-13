import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';
import { imageManager } from './imageManager';
import SpriteSheet, { IFrame } from './spriteSheet';
import DrawTarget from './drawTarget';
import { Rect } from './geometry';
import RGBA from './rgba';

export interface IBitmapParams extends IMouseInteractiveParams {
	spriteSheet: SpriteSheet;
	frameKey: string;
}

export default class Bitmap extends MouseInteractive {
	spriteSheet: SpriteSheet
	frame: Rect;

	constructor(params: IBitmapParams) {
		super(params);

		this.spriteSheet = params.spriteSheet;
		this.frame = this.spriteSheet.getFrame(params.frameKey);
	}

	draw(drawTarget: DrawTarget) {
		const destRect = new Rect(this.truePosition.left, this.truePosition.top, this.frame.w, this.frame.h);
		drawTarget.pushDrawConcrete(destRect, this.spriteSheet.concrete, 1, RGBA.blank, this.frame);
	}
}
