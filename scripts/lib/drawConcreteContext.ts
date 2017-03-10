/**
 * \file
 *
 * Defines the DrawConcreteContext module.</br>
 * Drawing target which has its own backing surface
 */

import DrawTarget from "./drawTarget";
import { Rect } from "./geometry";
import RGBA from "./rgba";

export interface IConcreteGiftbox
{
	pushDrawFillRect: (destRect: Rect, color: RGBA) => void;

	pushDrawConcrete: (destRect: Rect,
					   srcCtx: DrawConcreteContext,
					   alphaFac: number,
					   tint: RGBA,
					   srcRect?: Rect) => void

	loadImage: (img: HTMLImageElement) => void;

	clear: (color: RGBA) => void;

	release: () => void;
}

export default class DrawConcreteContext extends DrawTarget
{
	readonly giftbox: IConcreteGiftbox;

	constructor(giftbox_new: IConcreteGiftbox, width_new: number, height_new: number)
	{
		super(width_new, height_new);
		this.giftbox = giftbox_new;
	}

	pushDrawFillRect(destRect: Rect, color: RGBA) : void
	{
		this.giftbox.pushDrawFillRect(destRect, color);
	}

	pushDrawConcrete(destRect: Rect,
					 srcCtx: DrawConcreteContext,
					 alphaFac: number = 1.0,
					 tint: RGBA = RGBA.blank,
					 srcRect?: Rect) : void
	{
		this.giftbox.pushDrawConcrete(destRect, srcCtx, alphaFac, tint, srcRect);
	}

	loadImage(img: HTMLImageElement) : void
	{
		this.giftbox.loadImage(img);
	}

	clear(color: RGBA) : void
	{
		this.giftbox.clear(color);
	}

	release() : void
	{
		this.giftbox.release();
	}
}
