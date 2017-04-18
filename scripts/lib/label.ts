import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';
import * as Constants from './constants';
import { imageManager } from './imageManager';
import * as Util from './util';
import DrawTarget from './drawTarget';
import RGBA from './rgba';
import { Rect } from './geometry';
import SpriteSheetManager from './spriteSheetManager';

interface ITextLine {
	text: string;
	width: number;
}

interface ILinePosition {
	x: number;
	y: number;
}

interface ILabelParams extends IMouseInteractiveParams {
	textHAlign?: Util.hAlign;
	textVAlign?: Util.vAlign;
	wrapping?: Util.wrapping;
	lineHeight?: number;
	text?: string;
	// SpritesheetManager for font glyphs
	spriteSheetManager: SpriteSheetManager;
}

export default class Label extends MouseInteractive {
	count: number;
	textLines: ITextLine[];
	textLinePositions: ILinePosition[];
	text: string;
	textHAlign: Util.hAlign;
	textVAlign: Util.vAlign;
	wrapping: Util.wrapping;
	lineHeight: number;
	frame: number;
	fontHeight: number;
	spriteSheetManager: SpriteSheetManager;

	constructor(params: ILabelParams) {
		super(params);

		this.count = 0;
		this.textLines = [];
		this.textLinePositions = [];
		this.text = params.text || '';
		this.textHAlign = params.textHAlign || 'left';
		this.textVAlign = params.textVAlign || 'top';
		this.wrapping = params.wrapping || 'none';
		this.lineHeight = params.lineHeight || 8;
		this.frame = 0;
		this.fontHeight = 7;
		this.spriteSheetManager = params.spriteSheetManager;
		this.updateText();
	}

	draw(drawTarget: DrawTarget) {
		super.draw(drawTarget);
		for (let i = 0; i < this.textLines.length; i++) {
			let drawX = 0;
			let line = this.textLines[i];
			let linePosition = this.textLinePositions[i];
			let destRect = new Rect();
			let srcRect = new Rect();
			for (let j = 0; j < line.text.length; j++) {
				const char = this.parseChar(line.text[j]);
				const frameOutput = this.spriteSheetManager.getFrame("font7", char.toLowerCase());
				destRect.x = drawX + linePosition.x;
				destRect.y = linePosition.y;
				destRect.w = frameOutput.frame.w;
				destRect.h = frameOutput.frame.h;
				drawTarget.pushDrawConcrete(destRect, frameOutput.context, 1, RGBA.blank, frameOutput.frame);
				drawX += frameOutput.frame.w;
			}
		}
	}

	parseChar(char: string) {
		if (char === " ") {
			return "space";
		}
		return char;
	}

	updateText() {
		this.textLines = [];
		switch (this.wrapping) {
			// One line of text
			case 'none':
				this.textLines = [{
					text: this.text,
					width: this.measureText(this.text),
				}];
				break;
			case 'word':
				var words = this.text.split(' ');
				var run = '';
				var runLength = 0;
				var index = 0;
				for (var i = 0; i < words.length; i++) {
					// first word dont get no space in front
					var wordlen = this.measureText((index === 0 ? '' : ' ') + words[i]);
					// oh no can't fit it
					if (runLength + wordlen > this.size.width) {
						// TODO: first word on a line needs to be wrapped at characters if can't fit
						if (index === 0) {

						}
						// this word needs to go on next line, flush it
						else {
							this.textLines.push({
								text: run,
								width: runLength
							});
							run = '';
							runLength = 0;
							index = 0;
							// look at this word again
							i -= 1;
						}
					}
					// can fit the word, add it
					else {
						run += (index === 0 ? '' : ' ') + words[i];
						runLength += wordlen;
						index += 1;
					}
				}
				// ran out of words, flush any existing line
				if (run != '') {
					this.textLines.push({
						text: run,
						width: runLength
					});
					run = '';
					runLength = 0;
					index = 0;
				}
				break;
			case 'character':
				var run = '';
				var runLength = 0;
				var index = 0;
				for (var i = 0; i < this.text.length; i++) {
					// first word dont get no space in front
					var charlen = this.measureText(this.text[i]);
					// oh no can't fit it
					if (runLength + charlen > this.size.width) {
						// this char needs to go on next line, flush it
						this.textLines.push({
							text: run,
							width: runLength
						});
						run = '';
						runLength = 0;
						index = 0;
						i -= 1;
					}
					// can fit the char, add it
					else {
						// Don't want a space starting a line
						if (this.text[i] != ' ' || index != 0) {
							run += this.text[i];
							runLength += charlen;
							index += 1;
						}
					}
				}
				// ran out of words, flush any existing line
				if (run != '') {
					this.textLines.push({
						text: run,
						width: runLength
					});
					run = '';
					runLength = 0;
					index = 0;
				}
				break;
			default:
				console.error('Cannot update text, unsupported wrapping type ' + this.wrapping);
		}
		this.updateLinePositions();
	}

	updateLinePositions() {
		this.textLinePositions = [];
		var numLines = this.textLines.length;
		for (var i = 0; i < numLines; i++) {
			var x, y;
			switch (this.textHAlign) {
				case 'left':
					x = 0;
					break;
				case 'center':
					x = Math.ceil((this.size.width - this.textLines[i].width) / 2);
					break;
				case 'right':
					x = this.size.width - this.textLines[i].width;
					break;
				default:
					console.log('Invalid textHAlign: ' + this.textHAlign);
			}
			switch (this.textVAlign) {
				case 'top':
					y = i * this.lineHeight;
					break;
				case 'center':
					var textHeight = (this.lineHeight - this.fontHeight) * (numLines - 1) + this.fontHeight * numLines;
					y = Math.floor((this.size.height - textHeight) / 2) + i * this.lineHeight;
					break;
				case 'bottom':
					var textHeight = (this.lineHeight - this.fontHeight) * (numLines - 1) + this.fontHeight * numLines;
					y = this.size.height - textHeight + i * this.lineHeight
					break;
				default:
					console.log('Invalid textVAlign: ' + this.textVAlign);
			}
			this.textLinePositions.push({
				x: x,
				y: y
			})
		}
	}

	measureText(text: string) {
		text = text.toLowerCase();
		var length = 0;
		for (var i = 0; i < text.length; i++) {
			length += this.spriteSheetManager.getFrame('font7', this.parseChar(text[i])).frame.w;
		}
		return length;
	}

	setText(text: string) {
		this.text = text;
		this.updateText();
	}

	getText() {
		return this.text;
	}
}
