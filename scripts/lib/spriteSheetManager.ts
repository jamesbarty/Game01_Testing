import CoreGfxEngine from './coreGfxEng';
import SpriteSheet from './spriteSheet';
import DrawConcreteContext from './drawConcreteContext';
import { imageManager } from './imageManager';
import { Rect } from './geometry';

interface IFrame {
	sheet: number;
	x: number;
	y: number;
	w: number;
	h: number;
}

interface IFrameOutput {
	frame: Rect;
	context: DrawConcreteContext;
}

interface ISpriteSheetMetadata {
	[index: string]: IFrame;
}

interface IStichMetadata {
	[index: string]: ISpriteSheetMetadata | number;
}

export default class SpriteSheetManager {
	private numSheets: number;
	private sheets: HTMLImageElement[];
	private concreteContexts: DrawConcreteContext[];
	private engine: CoreGfxEngine;
	private stitch: IStichMetadata;

	constructor(metadata: IStichMetadata, engine: CoreGfxEngine) {
		this.numSheets = metadata['_numSheets'] as number;
		this.sheets = [];
		this.concreteContexts = [];
		this.engine = engine;
		this.stitch = metadata;

		for(let i = 0; i < this.numSheets; i++) {
			const sheetImage = imageManager.imageMap[`sheet${i}`]
			this.sheets.push(sheetImage);
			const concreteContext = this.engine.createConcreteContext(sheetImage.width, sheetImage.height);
			concreteContext.loadImage(sheetImage);
			this.concreteContexts.push(concreteContext);
		}
	}

	getFrame(namespace: string, key: string): IFrameOutput {
		if (!this.stitch[namespace]) {
			console.error(`Could not find stitch namespace ${namespace}`);
			return;
		}
		const subset = this.stitch[namespace] as ISpriteSheetMetadata;
		if (!subset[key]) {
			console.error(`Could not find frame with key ${key} in namespace ${namespace}`);
			return;
		}
		const frame = subset[key];
		return {
			frame: new Rect(frame.x, frame.y, frame.w, frame.h),
			context: this.concreteContexts[frame.sheet]
		};
	}
}