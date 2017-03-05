import UiElement from './lib/uiElement';

const FPS = 60;

let topLevel = new UiElement({
	size: {
		width: 160,
		height: 120
	}
});

const canvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

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
var gameFunc = function () {

	var lastTime = performance.now();
	var gameLoop = setInterval(function () {
		var curTime = performance.now();
		topLevel.draw(ctx);
		topLevel._update(curTime - lastTime);
	}, 1000 / FPS);
};

gameFunc();
