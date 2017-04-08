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

	setFrame(frameName: string) {
		this.frame = this.spriteSheet.getFrame(frameName);
	}

	draw(drawTarget: DrawTarget) {
		const destRect = new Rect(0, 0, this.frame.w, this.frame.h);
		drawTarget.pushDrawConcrete(destRect, this.spriteSheet.concrete, 1, RGBA.blank, this.frame);
	}
}
