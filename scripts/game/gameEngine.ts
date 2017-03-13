import UiElement from '../lib/uiElement';
import MouseInteractive from '../lib/mouseInteractive';
import Label from '../lib/label';
import Button from '../lib/button';
import DrawConcreteContext from '../lib/drawConcreteContext';
import DrawThroughContext from '../lib/drawThroughContext';
import CoreGfxEng from "../lib/coreGfxEng";
import { Rect } from "../lib/geometry";
import { imageManager } from '../lib/imageManager';
import RGBA from "../lib/rgba";
import SpriteSheet from '../lib/spriteSheet';
import MouseEvt from '../lib/mouseEvent';
import * as constants from "../lib/constants";
import { IStringTMap } from '../lib/util';
import Screen from './screen';
import ScreenManager, { TransitionType } from './screenManager';
import MainMenuScreen from './screens/mainMenu';
import WorldMapScreen from './screens/worldMap';

const FPS = 60;
let canvasCount = 1;

export default class GameEngine {
	private canvas: HTMLCanvasElement;
	private gfxEng: CoreGfxEng;
	spriteSheets: IStringTMap<SpriteSheet>;
	private rootElement: MouseInteractive;
	private rootLogicalConcrete: DrawConcreteContext;
	screens: IStringTMap<Screen>;
	screenManager: ScreenManager;
	private started: boolean;

	constructor() {

		// Generate the canvas
		this.canvas = document.createElement('canvas') as HTMLCanvasElement;
		this.canvas.id = 'mainCanvas' + canvasCount++;
		this.canvas.width = constants.LOGICAL_CANVAS_WIDTH * constants.LOGICAL_PIXEL_EDGE;
		this.canvas.height = constants.LOGICAL_CANVAS_HEIGHT * constants.LOGICAL_PIXEL_EDGE;
		this.canvas.style.left = Math.floor(window.innerWidth / 2 - this.canvas.width / 2) + 'px';
		document.body.appendChild(this.canvas);

		this.canvas.addEventListener('mousedown', this.onMouseDown);
		this.canvas.addEventListener('mouseup', this.onMouseUp);
		this.canvas.addEventListener('mousemove', this.onMouseMove);
		this.canvas.oncontextmenu = function () { return false };

		this.gfxEng = new CoreGfxEng(this.canvas);

		this.spriteSheets = {};
		this.spriteSheets[constants.SPRITESHEET_MAIN] = new SpriteSheet({
			source: imageManager.imageMap['font'],
			engine: this.gfxEng
		});
		this.spriteSheets[constants.SPRITESHEET_MAIN].loadFrames({
			frames: constants.FAWNT_7PT_MAP,
			animations: {

			}
		})

		this.rootElement = new MouseInteractive({
			name: 'toplevel',
			size: {
				width: constants.LOGICAL_CANVAS_WIDTH,
				height: constants.LOGICAL_CANVAS_HEIGHT
			}
		});
		this.rootLogicalConcrete = this.gfxEng.createConcreteContext(constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT);

		this.screenManager = new ScreenManager(this);
		this.screens = {
			mainMenu: new MainMenuScreen(this),
			worldMap: new WorldMapScreen(this)
		};
	}

	start() {
		let lastTime = performance.now();

		this.screenManager.setScreen(this.screens["mainMenu"], TransitionType.Cut);

		let gameLoop = setInterval(() => {
			let curTime = performance.now();
			let deltaTime = curTime = lastTime;

			this.gfxEng.getRootConcreteContext().clear(RGBA.blank);
			this.rootLogicalConcrete.clear(RGBA.blank);

			this.rootElement._update(deltaTime);
			this.rootElement._draw(this.rootLogicalConcrete);

			this.gfxEng.getRootConcreteContext().pushDrawConcrete(new Rect(0, 0, constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT), this.rootLogicalConcrete);

			lastTime = curTime;
		}, Math.floor(1000 / FPS));
	}

	onMouseMove = (e: MouseEvent) => {
		if (this.rootElement) {
			this.rootElement._onMouseMove(new MouseEvt(e, 0, 0));
		}
	}

	onMouseDown = (e: MouseEvent) => {
		if (this.rootElement) {
			this.rootElement._onMouseDown(new MouseEvt(e, 0, 0));
		}
	}

	onMouseUp = (e: MouseEvent) => {
		if (this.rootElement) {
			this.rootElement._onMouseUp(new MouseEvt(e, 0, 0));
			if (this.rootElement.maybeClicked) {
				this.rootElement._onClick(new MouseEvt(e, 0, 0));
			}
		}
		MouseInteractive.clearMaybeClickedElts();
	}

	addChild(child: MouseInteractive) {
		this.rootElement.addChild(child);
	}

	removeChild(child: MouseInteractive) {
		this.rootElement.removeChild(child);
	}
}