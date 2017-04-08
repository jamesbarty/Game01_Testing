/**
 * \file
 *
 * Defines geometric utilities
 */

/**
 * Defines the Rect class. Identified through top left corner and width, height
 */
export class Rect
{
	x: number;
	y: number;
	w: number;
	h: number;
	constructor(x_new: number = 0, y_new: number = 0, w_new: number = 0, h_new: number = 0)
	{
		this.x = x_new;
		this.y = y_new;
		this.w = w_new;
		this.h = h_new;
	}

	toString(): string
	{
		return "{Rect: x=" + this.x + " y=" + this.y + " w=" + this.w + " h=" + this.h + "}";
	}
}
