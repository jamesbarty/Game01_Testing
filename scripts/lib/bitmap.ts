import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';
import { imageManager } from './imageManager';
import SpriteSheetManager from './spriteSheetManager';
import DrawTarget from './drawTarget';
import DrawConcreteContext from './drawConcreteContext';
import { Rect } from './geometry';
import RGBA from './rgba';

export interface IBitmapParams extends IMouseInteractiveParams {
	spriteSheetManager: SpriteSheetManager;
	frameKey: string;
	namespace: string;
}

export default class Bitmap extends MouseInteractive {
	spriteSheetManager: SpriteSheetManager
	frame: Rect;
	context: DrawConcreteContext;

	constructor(params: IBitmapParams) {
		super(params);

		this.spriteSheetManager = params.spriteSheetManager;
		const frameOutput = this.spriteSheetManager.getFrame(params.namespace, params.frameKey);
		this.frame = frameOutput.frame;
		this.context = frameOutput.context;
	}

	setFrame(namespace: string, frameKey: string) {
		const frameOutput = this.spriteSheetManager.getFrame(namespace, frameKey);
		this.frame = frameOutput.frame;
		this.context = frameOutput.context;
	}

	draw(drawTarget: DrawTarget) {
		const destRect = new Rect(0, 0, this.frame.w, this.frame.h);
		drawTarget.pushDrawConcrete(destRect, this.context, 1, RGBA.blank, this.frame);
	}
}
