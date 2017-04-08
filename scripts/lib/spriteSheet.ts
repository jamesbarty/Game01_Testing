import { IStringTMap } from './util';
import DrawConcreteContext from './drawConcreteContext';
import CoreGfxEngine from './coreGfxEng';
import { Rect } from './geometry';

type frameX = number;
type frameY = number;
type frameW = number;
type frameH = number;
export type IFrame = [frameX, frameY, frameW, frameH];

interface IAnimation {
	looping: boolean;
	frameDuration: number;
	frames: string[];
	transition: string;
}

interface IFrame extends Rect {

}

export interface IFrameMetadata {
	frames: IStringTMap<Rect>;
	animations: IStringTMap<IAnimation>;
} 

export interface ISpriteSheetParams {
	source: HTMLImageElement;
	engine: CoreGfxEngine;
}

export default class SpriteSheet {
	private source: HTMLImageElement;
	concrete: DrawConcreteContext;
	private frames: IStringTMap<Rect>;
	private animations: IStringTMap<IAnimation>;
	private engine: CoreGfxEngine;
	private loaded: boolean;

	constructor(data: ISpriteSheetParams) {
		this.source = data.source;
		this.engine = data.engine;
		this.concrete = this.engine.createConcreteContext(this.source.width, this.source.height);
		this.concrete.loadImage(this.source);

		this.frames = {};
		this.animations = {};
		this.loaded = false;
	}

	loadFrames(metadata: IFrameMetadata) {
		const frames = metadata.frames;
		const animations = metadata.animations;
		Object.keys(frames).forEach((key) => {
			if (this.frames[key]) {
				throw `Duplicate frame identifier: ${key}`;
			}
			this.frames[key] = frames[key];
		});
		Object.keys(animations).forEach((key) => {
			if (this.animations[key]) {
				throw `Duplicate animations identifier: ${key}`;
			}
			this.animations[key] = animations[key];
		});
		this.loaded = true;
	}

	getAnimation(key: string): IAnimation {
		if (this.loaded === false) {
			throw `Cannot get animation from empty spritesheet`;
		}
		let lowerKey = key.toLowerCase();
		if (this.animations[lowerKey] === undefined) {
			throw `No animation with key ${lowerKey} could be found`;
		}
		return this.animations[lowerKey];
	}

	getFrame(key: string): Rect {
		if (this.loaded === false) {
			throw `Cannot get frame from empty spritesheet`;
		}
		if (this.frames[key] === undefined) {
			throw `No frame with key ${key} could be found`;
		}
		return this.frames[key];
	}
}
