export const LOGICAL_CANVAS_WIDTH: number = 160;
export const LOGICAL_CANVAS_HEIGHT: number = 120;
export const LOGICAL_PIXEL_EDGE: number = 4;
export const SCREEN_CANVAS_WIDTH: number = LOGICAL_CANVAS_WIDTH * LOGICAL_PIXEL_EDGE;
export const SCREEN_CANVAS_HEIGHT: number = LOGICAL_CANVAS_HEIGHT * LOGICAL_PIXEL_EDGE;

export interface IGlyphData {
	x: number;
	w: number;
}

export interface IFontMap {
	[key: string] : IGlyphData;
}

export const FAWNT_7PT_MAP: IFontMap = {
	"a": { x: 0, w: 5 },
	"b": { x: 5, w: 5 },
	"c": { x: 10, w: 5 },
	"d": { x: 15, w: 5 },
	"e": { x: 20, w: 5 },
	"f": { x: 25, w: 5 },
	"g": { x: 30, w: 5 },
	"h": { x: 35, w: 5 },
	"i": { x: 40, w: 4 },
	"j": { x: 44, w: 5 },
	"k": { x: 49, w: 5 },
	"l": { x: 54, w: 5 },
	"m": { x: 59, w: 6 },
	"n": { x: 65, w: 6 },
	"o": { x: 71, w: 5 },
	"p": { x: 76, w: 5 },
	"q": { x: 81, w: 5 },
	"r": { x: 86, w: 5 },
	"s": { x: 91, w: 5 },
	"t": { x: 96, w: 6 },
	"u": { x: 102, w: 5 },
	"v": { x: 107, w: 6 },
	"w": { x: 113, w: 6 },
	"x": { x: 119, w: 6 },
	"y": { x: 125, w: 6 },
	"z": { x: 131, w: 5 },
	"0": { x: 136, w: 5 },
	"1": { x: 141, w: 4 },
	"2": { x: 145, w: 5 },
	"3": { x: 150, w: 5 },
	"4": { x: 155, w: 5 },
	"5": { x: 160, w: 5 },
	"6": { x: 165, w: 5 },
	"7": { x: 170, w: 5 },
	"8": { x: 175, w: 5 },
	"9": { x: 180, w: 5 },
	"_": { x: 185, w: 5 },
	",": { x: 190, w: 3 },
	":": { x: 193, w: 2 },
	"#": { x: 195, w: 6 },
	"(": { x: 201, w: 4 },
	")": { x: 205, w: 4 },
	"$": { x: 209, w: 6 },
	"!": { x: 215, w: 2 },
	".": { x: 217, w: 2 },
	"+": { x: 219, w: 6 },
	"-": { x: 225, w: 5 },
	"%": { x: 230, w: 8 },
	"^": { x: 238, w: 6 },
	"[": { x: 244, w: 4 },
	"]": { x: 248, w: 4 },
	'"': { x: 252, w: 4 },
	"'": { x: 256, w: 3 },
	"?": { x: 259, w: 6 },
	"<": { x: 265, w: 4 },
	">": { x: 269, w: 4 },
	" ": { x: 273, w: 5 }
}