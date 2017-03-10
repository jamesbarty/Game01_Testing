import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';
import { imageManager } from './imageManager';
import SpriteSheet from './spriteSheet';
import DrawTarget from './drawTarget';

export interface ISpriteParams extends IMouseInteractiveParams {
	spriteSheet: SpriteSheet;
}

export default class Sprite extends MouseInteractive {
	spriteSheet: SpriteSheet
	stopped: boolean;
	currentAnimation: string;
	currentFrameDuration: number;
	currentFrameNum: number;
	currentFrame: any // TODO;

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

	draw(drawTarget: DrawTarget) {
		if (this.currentFrame != null) {
			drawTarget.drawImage(this.spriteSheet.source, this.currentFrame[0], this.currentFrame[1], this.currentFrame[2], this.currentFrame[3],
				this.truePosition.left, this.truePosition.top, this.currentFrame[2], this.currentFrame[3]);
		}
	}

	gotoAndPlay(animation: string) {
		this.currentAnimation = animation;
		this.currentFrameDuration = 0;
		this.currentFrameNum = 0;
		this.currentFrame = this.spriteSheet.frames[this.spriteSheet.animations[this.currentAnimation].frames[this.currentFrameNum]];
		this.play();
	}

	gotoAndStop(animation: string) {
		this.currentAnimation = animation;
		this.currentFrameDuration = 0;
		this.currentFrameNum = 0;
		this.currentFrame = this.spriteSheet.frames[this.spriteSheet.animations[this.currentAnimation].frames[this.currentFrameNum]];
		this.stop();
	}
}
