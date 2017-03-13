import { IStringTMap } from './util';
import { Rect } from './geometry';

export const LOGICAL_CANVAS_WIDTH: number = 264;
export const LOGICAL_CANVAS_HEIGHT: number = 196;
export const LOGICAL_PIXEL_EDGE: number = 4;
export const SCREEN_CANVAS_WIDTH: number = LOGICAL_CANVAS_WIDTH * LOGICAL_PIXEL_EDGE;
export const SCREEN_CANVAS_HEIGHT: number = LOGICAL_CANVAS_HEIGHT * LOGICAL_PIXEL_EDGE;
export const SPRITESHEET_MAIN = "mainSpriteSheet";

export interface IGlyphData {
	x: number;
	w: number;
}

export interface IFontMap {
	[key: string] : IGlyphData;
}

export const FAWNT_7PT_MAP: IStringTMap<Rect> = {
	"a": new Rect(0, 0, 5, 7),
	"b": new Rect(5, 0, 5, 7),
	"c": new Rect(10, 0, 5, 7),
	"d": new Rect(15, 0, 5, 7),
	"e": new Rect(20, 0, 5, 7),
	"f": new Rect(25, 0, 5, 7),
	"g": new Rect(30, 0, 5, 7),
	"h": new Rect(35, 0, 5, 7),
	"i": new Rect(40, 0, 4, 7),
	"j": new Rect(44, 0, 5, 7),
	"k": new Rect(49, 0, 5, 7),
	"l": new Rect(54, 0, 5, 7),
	"m": new Rect(59, 0, 6, 7),
	"n": new Rect(65, 0, 6, 7),
	"o": new Rect(71, 0, 5, 7),
	"p": new Rect(76, 0, 5, 7),
	"q": new Rect(81, 0, 5, 7),
	"r": new Rect(86, 0, 5, 7),
	"s": new Rect(91, 0, 5, 7),
	"t": new Rect(96, 0, 6, 7),
	"u": new Rect(102, 0, 5, 7),
	"v": new Rect(107, 0, 6, 7),
	"w": new Rect(113, 0, 6, 7),
	"x": new Rect(119, 0, 6, 7),
	"y": new Rect(125, 0, 6, 7),
	"z": new Rect(131, 0, 5, 7),
	"0": new Rect(136, 0, 5, 7),
	"1": new Rect(141, 0, 4, 7),
	"2": new Rect(145, 0, 5, 7),
	"3": new Rect(150, 0, 5, 7),
	"4": new Rect(155, 0, 5, 7),
	"5": new Rect(160, 0, 5, 7),
	"6": new Rect(165, 0, 5, 7),
	"7": new Rect(170, 0, 5, 7),
	"8": new Rect(175, 0, 5, 7),
	"9": new Rect(180, 0, 5, 7),
	"_": new Rect(185, 0, 5, 7),
	",": new Rect(190, 0, 3, 7),
	":": new Rect(193, 0, 2, 7),
	"#": new Rect(195, 0, 6, 7),
	"(": new Rect(201, 0, 4, 7),
	")": new Rect(205, 0, 4, 7),
	"$": new Rect(209, 0, 6, 7),
	"!": new Rect(215, 0, 2, 7),
	".": new Rect(217, 0, 2, 7),
	"+": new Rect(219, 0, 6, 7),
	"-": new Rect(225, 0, 5, 7),
	"%": new Rect(230, 0, 8, 7),
	"^": new Rect(238, 0, 6, 7),
	"[": new Rect(244, 0, 4, 7),
	"]": new Rect(248, 0, 4, 7),
	'"': new Rect(252, 0, 4, 7),
	"'": new Rect(256, 0, 3, 7),
	"?": new Rect(259, 0, 6, 7),
	"<": new Rect(265, 0, 4, 7),
	">": new Rect(269, 0, 4, 7),
	" ": new Rect(273, 0, 5, 7)
}
