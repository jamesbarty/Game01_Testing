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
	private width: number;
	private height: number;

	constructor(width: number, height: number)
	{
		if(width < 1 || height < 1)
		{
			throw "Invalid dimensions";
		}

		this.width = width;
		this.height = height;
	}

	pushDrawFillRect(destRect: Rect, color: RGBA) : void
	{
		throw "Not implemented";
	}

	pushDrawConcrete(destRect: Rect, srcRect: Rect, srcCtx: DrawConcreteContext, alphaFac: number = 1.0, tint: RGBA = RGBA.blank) : void
	{
		throw "Not implemented";
	}
}
