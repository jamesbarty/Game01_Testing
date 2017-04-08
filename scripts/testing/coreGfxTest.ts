import RGBA from "../lib/rgba";
import { Rect } from "../lib/geometry";
import * as constants from "../lib/constants";
import DrawConcreteContext from "../lib/drawConcreteContext";
import DrawThroughContext from "../lib/drawThroughContext";
import { IConcreteGiftbox } from "../lib/drawConcreteContext";
import CoreGfxEng from "../lib/coreGfxEng";
export default function runTest()
{
	let canvas = document.createElement('canvas') as HTMLCanvasElement;

	canvas.width = constants.SCREEN_CANVAS_WIDTH;
	canvas.height = constants.SCREEN_CANVAS_HEIGHT;
	document.body.appendChild(canvas);

	const fullCanvasRect = new Rect(0, 0, constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT);
	let coreGfx: CoreGfxEng = new CoreGfxEng(canvas);
	let coreRootConc: DrawConcreteContext = coreGfx.getRootConcreteContext();
	let drawConc: DrawConcreteContext = coreGfx.createConcreteContext(constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT);
	let drawThru1c: RGBA;
	let drawThru1X: number;
	let drawThru1Y: number;
	let drawThru1W: number;
	let drawThru1H: number;
	let drawThru2c: RGBA;
	let drawThru2X: number;
	let drawThru2Y: number;
	let drawThru2W: number;
	let drawThru2H: number;

	let imgRect: Rect;
	let drawConcImg = coreGfx.createConcreteContext(50, 50);
	drawConcImg.pushDrawFillRect(new Rect(0, 0, 50, 50), new RGBA(0, 0, 0, 128));
	drawConcImg.pushDrawFillRect(new Rect(0, 0, 20, 20), new RGBA(0, 0, 255, 128));
	drawConcImg.pushDrawFillRect(new Rect(30, 0, 20, 20), new RGBA(255, 0, 0, 128));
	drawConcImg.pushDrawFillRect(new Rect(0, 30, 20, 20), new RGBA(0, 255, 0, 128));
	drawConcImg.pushDrawFillRect(new Rect(30, 30, 20, 20), new RGBA(128, 128, 128, 128));

	let curTick = 0;

	setInterval(function()
	{
		if(curTick == 0)
		{
			drawThru1c = new RGBA(0, 200, 200, 100);
			drawThru1W = 150;
			drawThru1H = 150;
			drawThru1X = constants.LOGICAL_CANVAS_WIDTH / 2 - drawThru1W / 2;
			drawThru1Y = constants.LOGICAL_CANVAS_HEIGHT / 2 - drawThru1H / 2;
			drawThru2c = new RGBA(200, 100, 0, 100);
			drawThru2W = 100;
			drawThru2H = 100;
			drawThru2X = drawThru1W / 2 - drawThru2W / 2;
			drawThru2Y = drawThru1H / 2 - drawThru2H / 2;

			imgRect = new Rect(drawThru2W/2 - 25, drawThru2H/2 - 25, 50, 50);
		}

		if(curTick < 50)
		{
			imgRect.x += 1;
		}
		else if(curTick < 150)
		{
			imgRect.x -= 1;
		}
		else if(curTick < 200)
		{
			imgRect.x += 1;
			imgRect.y -= 1;
		}
		else if(curTick < 300)
		{
			imgRect.y += 1;
		}
		else if(curTick < 350)
		{
			imgRect.y -= 1;
			drawThru2X += 1;
		}
		else if(curTick < 370)
		{
			drawThru2X += 1;
		}
		else if(curTick < 510)
		{
			drawThru2X -= 1;
		}
		else if(curTick < 580)
		{
			drawThru2X += 1;
			drawThru2Y -= 1;
		}
		else if(curTick < 650)
		{
			drawThru2Y += 1;
		}
		else
		{
			curTick = -1;
		}
		++curTick;

		drawConc.clear(RGBA.darkGrey);
		for(let i = 0; i < constants.LOGICAL_CANVAS_WIDTH; i += 10)
		{
			drawConc.pushDrawFillRect(new Rect(i, 0, 5, constants.LOGICAL_CANVAS_HEIGHT), RGBA.mediumGrey);
		}

		let drawThru1: DrawThroughContext = new DrawThroughContext(drawConc, drawThru1X, drawThru1Y, drawThru1W, drawThru1H);
		let drawThru2: DrawThroughContext = new DrawThroughContext(drawThru1, drawThru2X, drawThru2Y, drawThru2W, drawThru2H);

		drawThru1.pushDrawFillRect(new Rect(0, 0, drawThru1W, drawThru1H), drawThru1c);
		drawThru2.pushDrawFillRect(new Rect(0, 0, drawThru2W, drawThru2H), drawThru2c);
		drawThru2.pushDrawConcrete(imgRect, drawConcImg);
		coreRootConc.pushDrawConcrete(fullCanvasRect, drawConc);
	}, 20);

};
