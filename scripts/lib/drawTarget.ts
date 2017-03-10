/**
 * \file
 *
 * Defines the DrawTarget module.</br>
 * Used as an interface class for <tt>UiElement</tt>s to draw to
 */

import RGBA from "./rgba";
import { Rect } from "./geometry";
import DrawConcreteContext from "./drawConcreteContext";

export default class DrawTarget
{
	readonly width: number;
	readonly height: number;

	protected constructor(width_new: number, height_new: number)
	{
		if(width_new < 1 || height_new < 1)
		{
			throw "Invalid dimensions";
		}

		this.width = width_new;
		this.height = height_new;
	}

	pushDrawFillRect(destRect: Rect, color: RGBA) : void
	{
		throw "Not implemented";
	}

	pushDrawConcrete(destRect: Rect,
					 srcCtx: DrawConcreteContext,
					 alphaFac: number = 1.0,
					 tint: RGBA = RGBA.blank,
					 srcRect?: Rect) : void
	{
		throw "Not implemented";
	}
}
