import { IStringTMap } from './util';

type frameX = number;
type frameY = number;
type frameW = number;
type frameH = number;
export type IFrame = [frameX, frameY, frameW, frameH];

interface IAnimation {
	looping: boolean;
	frameDuration: number;
	frames: number[];
	transition: string;
}

export interface ISpriteSheetParams {
	source: HTMLImageElement;
	frames: IFrame[];
	animations: IStringTMap<IAnimation>;
}

export default class SpriteSheet {
	source: HTMLImageElement;
	frames: IFrame[];
	animations: IStringTMap<IAnimation>;

	constructor(data: ISpriteSheetParams) {
		this.source = data.source;
		this.frames = data.frames;
		this.animations = data.animations;
	}
}
