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
import ScreenManager, { TransitionType } from './screenManager';
import MainMenuScreen from './screens/mainMenu';
import WorldMapScreen from './screens/worldMap';
import TacticsScreen from './tactics/tacticsScreen';

const FPS = 60;
let canvasCount = 1;

enum Screen {
	MainMenuScreen,
	WorldMapScreen,
	TacticsScreen
}

export default class GameEngine {
	private canvas: HTMLCanvasElement;
	private gfxEng: CoreGfxEng;
	spriteSheets: IStringTMap<SpriteSheet>;
	private rootElement: MouseInteractive;
	private rootLogicalConcrete: DrawConcreteContext;
	screens: IStringTMap<Screen>;
	screenManager: ScreenManager;
	private started: boolean;

	static Screen = Screen;

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
			source: imageManager.imageMap['spritesheet'],
			engine: this.gfxEng
		});
		let framez = constants.FAWNT_7PT_MAP;
		framez["back"] = new Rect(0, 7, 294, 196);
		framez["dirt"] = new Rect(0, 203, 16, 16);
		framez["grass"] = new Rect(16, 203, 16, 16);
		framez["black"] = new Rect(32, 203, 16, 16);
		framez["left_up"] = new Rect(48, 203, 16, 16);
		framez["left_down"] = new Rect(64, 203, 16, 16);
		framez["up_up"] = new Rect(80, 203, 16, 16);
		framez["up_down"] = new Rect(96, 203, 16, 16);
		framez["right_up"] = new Rect(112, 203, 16, 16);
		framez["right_down"] = new Rect(128, 203, 16, 16);
		framez["down_up"] = new Rect(144, 203, 16, 16);
		framez["down_down"] = new Rect(160, 203, 16, 16);
		framez["spawn"] = new Rect(0, 219, 16, 16);
		framez["spawnHighlight"] = new Rect(16, 219, 16, 16);
		framez["spawnHighlightOccupied"] = new Rect(32, 219, 16, 16);
		framez["frame"] = new Rect(176, 203, 16, 16);
		framez["shroom"] = new Rect(192, 203, 12, 12);
		framez["shroom2"] = new Rect(204, 203, 12, 12);
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

		/* DEBUG */
		(window as any)["root"] = this.rootElement;
	}

	start() {
		let lastTime = performance.now();

		this.goToScreen(Screen.MainMenuScreen);

		let gameLoop = setInterval(() => {
			let curTime = performance.now();
			let deltaTime = curTime - lastTime;
			lastTime = curTime;

			this.gfxEng.getRootConcreteContext().clear(RGBA.blank);
			this.rootLogicalConcrete.clear(RGBA.blank);

			this.rootElement._update(deltaTime);
			this.rootElement._draw(this.rootLogicalConcrete);

			this.gfxEng.getRootConcreteContext().pushDrawConcrete(new Rect(0, 0, constants.LOGICAL_CANVAS_WIDTH, constants.LOGICAL_CANVAS_HEIGHT), this.rootLogicalConcrete);

			
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

	goToScreen(screen: Screen) {
		const { rootElement } = this;

		rootElement.removeAllChildren();
		switch(screen) {
			case Screen.MainMenuScreen:
				rootElement.addChild(new MainMenuScreen(this));
				break;
			case Screen.WorldMapScreen:
				rootElement.addChild(new WorldMapScreen(this));
				break;
			case Screen.TacticsScreen:
				rootElement.addChild(new TacticsScreen(this));
				break;
		}
	}
}