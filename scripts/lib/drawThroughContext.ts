/**
 * \file
 *
 * Defines the DrawThroughContext module</br>
 * Used as a drawing target which does not have a backing surface; draws directly to parent
 */

import DrawTarget from "./drawTarget";
import DrawConcreteContext from "./drawConcreteContext";
import { Rect } from "./geometry";
import RGBA from "./rgba";

export default class DrawThroughContext extends DrawTarget
{
	private parentTarget: DrawTarget;
	private xOff: number;
	private yOff: number;
	private rectCacheDest: Rect;
	private rectCacheSrc: Rect;

	/**
	 * Reads the rectangles and output clipped rectangles to \c rectCacheDest and
	 * \c rectCacheSrc.
	 * @returns \c true iff there is something to be drawn
	 */
	private clipToCache(dest: Rect, src?: Rect) : boolean
	{
		let x = dest.x;
		let y = dest.y;
		let w = dest.w;
		let h = dest.h;

		if(w < 1 || h < 1)
		{
			return false;
		}

		if(x >= this.width || y >= this.height)
		{
			return false;
		}

		if(x + w <= 0 || y + h <= 0)
		{
			return false;
		}

		if(x + w > this.width)
		{
			w = this.width - x;
		}

		if(y + h > this.height)
		{
			h = this.height - y;
		}

		if(x < 0)
		{
			w += x;
			x = 0;
		}

		if(y < 0)
		{
			h += y
			y = 0;
		}

		// Perhaps final check for rectangle existence is necessary

		this.rectCacheDest.x = x + this.xOff;
		this.rectCacheDest.y = y + this.yOff;
		this.rectCacheDest.w = w;
		this.rectCacheDest.h = h;

		if(src)
		{
			this.rectCacheSrc.x = src.x + (x - dest.x) * (src.w / dest.w);
			this.rectCacheSrc.y = src.y + (y - dest.y) * (src.h / dest.h);
			this.rectCacheSrc.w = src.w * (w / dest.w);
			this.rectCacheSrc.h = src.h * (h / dest.h);
		}

		return true;
	}

	constructor(parentTarget_new: DrawTarget,
				xOff_new: number,
			    yOff_new: number,
			    width_new: number,
			    height_new: number)
	{
		super(width_new, height_new);

		this.parentTarget = parentTarget_new;
		this.xOff = xOff_new;
		this.yOff = yOff_new;
		this.rectCacheDest = new Rect();
		this.rectCacheSrc = new Rect();
	}

	pushDrawFillRect(destRect: Rect, color: RGBA) : void
	{
		if(this.clipToCache(destRect))
		{
			this.parentTarget.pushDrawFillRect(this.rectCacheDest, color);
		}
	}

	pushDrawConcrete(destRect: Rect,
					 srcCtx: DrawConcreteContext,
					 alphaFac: number = 1.0,
					 tint: RGBA = RGBA.blank,
					 srcRect?: Rect) : void
	{
		if(this.clipToCache(destRect, srcRect))
		{
			this.parentTarget.pushDrawConcrete(this.rectCacheDest,
											   srcCtx,
											   alphaFac,
											   tint,
											   this.rectCacheSrc);
		}
	}
}
