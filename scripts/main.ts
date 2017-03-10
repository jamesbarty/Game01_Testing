import UiElement from './lib/uiElement';
import CoreGfxEng from "./lib/coreGfxEng";
import { Rect } from "./lib/geometry";
import RGBA from "./lib/rgba";
import * as constants from "./lib/constants";
const FPS = 60;

let topLevel = new UiElement({
	size: {
		width: 160,
		height: 120
	}
});

const canvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
let coreGfx = new CoreGfxEng(canvas);
let conc = coreGfx.createConcreteContext(1024, 1024);
let img = document.createElement("img");
img.src = "res/pic.jpg";
conc.loadImage(img);


canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mousemove', onMouseMove);
canvas.oncontextmenu = function () { return false };
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onMouseDown(e: any) {

}

function onMouseUp(e: MouseEvent) {

}

function onMouseMove(e: any) {

}

function onKeyDown(e: any) {

}

function onKeyUp(e: any) {

}

var old = performance.now();
var MAX_TICK = 120;
var tick = 0;
var state = 0;
var gameFunc = function () {

	var lastTime = performance.now();
	var gameLoop = setInterval(function () {
		var curTime = performance.now();
		++tick;
		if(tick >= MAX_TICK)
		{
			++state;
			tick = 0;
		}
		coreGfx.getRootConcreteContext().clear(RGBA.blank);
		if(state == 0)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(0,0,constants.LOGICAL_CANVAS_WIDTH*(tick+1)/(MAX_TICK+1),64),
				conc,
				1,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 1)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(0,0,64,constants.LOGICAL_CANVAS_HEIGHT*(tick+1)/(MAX_TICK+1)),
				conc,
				1,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 2)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(0,0,128,128),
				conc,
				tick / MAX_TICK,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 3)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(0,0,128,128),
				conc,
				1-tick / MAX_TICK,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 4)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(constants.LOGICAL_CANVAS_WIDTH * (tick/MAX_TICK) - 32,10,64,64),
				conc,
				1,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 5)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(10,constants.LOGICAL_CANVAS_HEIGHT * (tick/MAX_TICK) - 32,64,64),
				conc,
				1,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 6)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(constants.LOGICAL_CANVAS_WIDTH * (tick/MAX_TICK) - 32,constants.LOGICAL_CANVAS_HEIGHT * (tick/MAX_TICK) - 32,64,64),
				conc,
				1,
				RGBA.blank,
				new Rect(0,0,1024,1024));
		}
		else if(state == 7)
		{
			coreGfx.getRootConcreteContext().pushDrawConcrete(
				new Rect(10,10,64,64),
				conc,
				1,
				new RGBA(0,0,255, 255*tick/MAX_TICK),
				new Rect(0,0,1024,1024));
		}
		else
		{
			state = 0;
		}
	}, 1000 / FPS);
};

gameFunc();
