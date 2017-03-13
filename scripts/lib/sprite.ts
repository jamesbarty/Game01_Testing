import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';
import { imageManager } from './imageManager';
import SpriteSheet, { IFrame } from './spriteSheet';
import DrawTarget from './drawTarget';
import { Rect } from './geometry';
import RGBA from './rgba';

export interface ISpriteParams extends IMouseInteractiveParams {
	spriteSheet: SpriteSheet;
}

export default class Sprite extends MouseInteractive {
	spriteSheet: SpriteSheet
	stopped: boolean;
	currentAnimation: string;
	currentFrameDuration: number;
	currentFrameNum: number;
	currentFrame: Rect;

	constructor(params: ISpriteParams) {
		super(params);

		this.spriteSheet = params.spriteSheet;
		this.stopped = false;
		this.currentAnimation = '';
		this.currentFrameDuration = 0;
		this.currentFrameNum = 0;
		this.currentFrame = null;
	}

	stop() {
		this.stopped = true;
	}

	play() {
		this.stopped = false;
	}

	update(deltaTime: number) {
		super.update(deltaTime);
		
		if (!this.stopped) {
			// update current frame duration with delta
			// if over, switch to next frame (or not if end and no loop, or transition), reset frame duration
			this.currentFrameDuration += deltaTime;
			var anim = this.spriteSheet.getAnimation(this.currentAnimation);
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
				this.currentFrame = this.spriteSheet.getFrame(this.spriteSheet.getAnimation(this.currentAnimation).frames[this.currentFrameNum]);
			}
		}
	}

	draw(drawTarget: DrawTarget) {
		if (this.currentFrame != null) {
			const destRect = new Rect(this.truePosition.left, this.truePosition.top, this.currentFrame.w, this.currentFrame.h);
			drawTarget.pushDrawConcrete(destRect, this.spriteSheet.concrete, 1, RGBA.blank, this.currentFrame);
		}
	}

	gotoAndPlay(animation: string) {
		this.currentAnimation = animation;
		this.currentFrameDuration = 0;
		this.currentFrameNum = 0;
		this.currentFrame = this.spriteSheet.getFrame(this.spriteSheet.getAnimation(this.currentAnimation).frames[this.currentFrameNum]);
		this.play();
	}

	gotoAndStop(animation: string) {
		this.currentAnimation = animation;
		this.currentFrameDuration = 0;
		this.currentFrameNum = 0;
		this.currentFrame = this.spriteSheet.getFrame(this.spriteSheet.getAnimation(this.currentAnimation).frames[this.currentFrameNum]);
		this.stop();
	}
}
