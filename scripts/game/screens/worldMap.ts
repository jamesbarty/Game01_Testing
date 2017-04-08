import Screen from '../screen';
import GameEngine from '../gameEngine';
import MouseInteractive from '../../lib/mouseInteractive';
import Button from '../../lib/button';
import Label from '../../lib/label';
import RGBA from '../../lib/rgba';
import Bitmap from '../../lib/bitmap';
import * as Constants from '../../lib/constants';
import { TransitionType } from '../screenManager';
import { AnimationType, Easing, ITopLeftPos } from '../../lib/util';
import testMap from '../maps/test';
import { IMap } from '../maps/maps';

enum Direction {
	None,
	North,
	West,
	East,
	South
}

export default class WorldMapScreen extends MouseInteractive {
	private game: GameEngine;
	private mapContainer: MouseInteractive;
	private navContainer: MouseInteractive;
	private tileContainer: MouseInteractive;
	private mapWidth: number;
	private mapHeight: number;
	private tileWidth: number;
	private tileHeight: number;
	private tileMap: Bitmap[][];
	private curDirection: Direction;
	private curMap: IMap;
	private nextDirection: Direction;
	private shouldMove: boolean;
	private isMoving: boolean;
	private playerX: number;
	private playerY: number;

	constructor(game: GameEngine) {
		super({
			name: "WorldMapScreen",
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH,
				height: Constants.LOGICAL_CANVAS_HEIGHT
			}
		});
		this.game = game;
		this.curMap = testMap;
		this.mapWidth = 15;
		this.mapHeight = 15;
		this.tileWidth = 16;
		this.tileHeight = 16;
		this.curDirection = Direction.None;
		this.nextDirection = Direction.None;
		this.shouldMove = false;
		this.isMoving = false;
		this.playerX = 0;
		this.playerY = 0;
		this.buildUi();
	}

	handleNavDown(dir: Direction) {
		const { tileWidth, tileHeight } = this;
		const oldPos = this.tileContainer.position;
		switch (dir) {
			case Direction.North:
				this.shouldMove = true;
				this.nextDirection = Direction.North;
				break;
			case Direction.West:
				this.shouldMove = true;
				this.nextDirection = Direction.West;
				break;
			case Direction.East:
				this.shouldMove = true;
				this.nextDirection = Direction.East;
				break;
			case Direction.South:
				this.shouldMove = true;
				this.nextDirection = Direction.South;
				break;
		}
	}

	handleNavUp(dir: Direction) {
		if (dir === this.nextDirection) {
			this.shouldMove = false;
			this.nextDirection = Direction.None;
		}
	}

	buildUi() {
		this.buildUiNav();
		this.buildUiMap();
		this.addChild(this.navContainer);
		this.addChild(this.mapContainer);
	}

	buildUiNav() {
		let navStyles = [RGBA.red, RGBA.green, RGBA.blue];
		let ss = this.game.spriteSheets[Constants.SPRITESHEET_MAIN];
		let navBtnSize = {
			width: 16,
			height: 16
		};
		this.navContainer = new MouseInteractive({
			name: 'navContainer',
			position: {
				left: -20,
				top: 20
			},
			size: {
				width: 48,
				height: 48
			},
			hAlign: 'right',
			vAlign: 'top'
		});

		let btnNDownBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'up_down'
		});
		let btnNUpBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'up_up'
		});
		let btnN = new Button({
			name: 'btnN',
			text: '',
			styles: [btnNUpBitmap, btnNUpBitmap, btnNDownBitmap],
			spriteSheet: ss,
			size: navBtnSize,
			hAlign: 'center',
			vAlign: 'top'
		});
		btnN.onButtonDown = () => {
			this.handleNavDown(Direction.North);
		};
		btnN.onButtonUp = () => {
			this.handleNavUp(Direction.North);
		};

		let btnWDownBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'left_down'
		});
		let btnWUpBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'left_up'
		});
		let btnW = new Button({
			name: 'btnW',
			text: '',
			styles: [btnWUpBitmap, btnWUpBitmap, btnWDownBitmap],
			spriteSheet: ss,
			size: navBtnSize,
			hAlign: 'left',
			vAlign: 'center'
		});
		btnW.onButtonDown = () => {
			this.handleNavDown(Direction.West);
		};
		btnW.onButtonUp = () => {
			this.handleNavUp(Direction.West);
		};

		let btnEDownBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'right_down'
		});
		let btnEUpBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'right_up'
		});
		let btnE = new Button({
			name: 'btnE',
			text: '',
			styles: [btnEUpBitmap, btnEUpBitmap, btnEDownBitmap],
			spriteSheet: ss,
			size: navBtnSize,
			hAlign: 'right',
			vAlign: 'center'
		});
		btnE.onButtonDown = () => {
			this.handleNavDown(Direction.East);
		};
		btnE.onButtonUp = () => {
			this.handleNavUp(Direction.East);
		};

		let btnSDownBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'down_down'
		});
		let btnSUpBitmap = new Bitmap({
			spriteSheet: ss,
			frameKey: 'down_up'
		});
		let btnS = new Button({
			name: 'btnS',
			text: '',
			styles: [btnSUpBitmap, btnSUpBitmap, btnSDownBitmap],
			spriteSheet: ss,
			size: navBtnSize,
			hAlign: 'center',
			vAlign: 'bottom'
		});
		btnS.onButtonDown = () => {
			this.handleNavDown(Direction.South);
		};
		btnS.onButtonUp = () => {
			this.handleNavUp(Direction.South);
		};

		this.navContainer.addChild(btnN);
		this.navContainer.addChild(btnW);
		this.navContainer.addChild(btnE);
		this.navContainer.addChild(btnS);
	}

	buildUiMap() {
		const { curMap, game, mapWidth, mapHeight, tileWidth, tileHeight } = this;

		this.mapContainer = new MouseInteractive({
			name: 'mapContainer',
			position: {
				left: 0,
				top: 0
			},
			size: {
				width: this.mapWidth * this.tileWidth,
				height: this.mapHeight * this.tileHeight
			}
		});

		this.tileContainer = new MouseInteractive({
			name: 'tileContainer',
			position: {
				left: -tileWidth,
				top: -tileHeight
			},
			size: {
				width: (this.mapWidth + 2) * this.tileWidth,
				height: (this.mapHeight + 2) * this.tileHeight
			}
		});

		this.tileMap = [];
		for (let r = 0; r < mapHeight + 2; r++) {
			this.tileMap[r] = [];
			for (let c = 0; c < mapWidth + 2; c++) {
				let mapRow = this.playerY + r - Math.floor((mapHeight + 2) / 2);
				let mapCol = this.playerX + c - Math.floor((mapWidth + 2) / 2);
				let frame = mapRow >= 0 && mapRow < curMap.height && mapCol >= 0 && mapCol < curMap.width ? curMap.map[mapRow][mapCol] : "black";
				this.tileMap[r][c] = new Bitmap({
					spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
					frameKey: frame,
					position: {
						left: c * tileWidth,
						top: r * tileHeight
					},
					size: {
						width: tileWidth,
						height: tileHeight
					}
				});
				//console.log(`left: ${c * tileWidth}, top: ${r * tileHeight}`);
				this.tileContainer.addChild(this.tileMap[r][c]);
			}
		}
		this.mapContainer.addChild(this.tileContainer);


		let player = new Bitmap({
			name: 'player',
			spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
			frameKey: 'back',
			position: {
				top:  Math.floor(mapHeight / 2) * tileHeight,
				left: Math.floor(mapWidth / 2) * tileWidth
			},
			size: {
				width: tileWidth,
				height: tileHeight
			}
		});

		this.mapContainer.addChild(player);
	}

	update(deltaTime: number) {
		// handle movement logic
		const { curMap, isMoving, nextDirection, shouldMove, tileContainer, tileHeight, tileWidth } = this;
		if (!isMoving && shouldMove) {
			// TODO: Check if I can move to the place I want to go
			// Move there
			const oldPos = tileContainer.position; 
			let newPos: ITopLeftPos;
			switch (nextDirection) {
				case Direction.None:
					console.error('should move but no next direction');
					return;
				case Direction.North:
					if (this.playerY <= 0) {
						return;
					}
					newPos = {top: oldPos.top + tileHeight, left: oldPos.left};
					break;
				case Direction.West:
					if (this.playerX <= 0) {
						return;
					}
					newPos = {top: oldPos.top, left: oldPos.left + tileWidth};
					break;
				case Direction.East:
					if (this.playerX >= curMap.width - 1) {
						return;
					}
					newPos = {top: oldPos.top, left: oldPos.left - tileWidth};
					break
				case Direction.South:
					if (this.playerY >= curMap.height - 1) {
						return;
					}
					newPos = {top: oldPos.top - tileHeight, left: oldPos.left};
					break;
			}
			this.isMoving = true;
			this.curDirection = nextDirection;
			tileContainer.animate(AnimationType.Position, newPos, 600, () => {
				this.finishMovement();
			}, Easing.Linear);
		}
	}

	finishMovement() {
		const { curDirection, curMap, mapHeight, mapWidth, tileContainer, tileHeight, tileMap, tileWidth } = this;

		tileContainer.setPosition(-tileHeight, -tileWidth);
		switch (curDirection) {
			case Direction.North:
				this.playerY -= 1;
				break;
			case Direction.West:
				this.playerX -= 1;
				break;
			case Direction.East:
				this.playerX += 1;
				break;
			case Direction.South:
				this.playerY += 1;
				break;
		}
		console.log(`New position: x=${this.playerX}, y=${this.playerY}`);
		// Update frames for whole map
		for (let r = 0; r < mapHeight + 2; r++) {
			for (let c = 0; c < mapWidth + 2; c++) {
				let mapRow = this.playerY + r - Math.floor((mapHeight + 2) / 2);
				let mapCol = this.playerX + c - Math.floor((mapWidth + 2) / 2);
				let frame = mapRow >= 0 && mapRow < curMap.height && mapCol >= 0 && mapCol < curMap.width ? curMap.map[mapRow][mapCol] : "black";
				if (!frame){
					console.log(`Bad position: x=${mapCol}, y=${mapCol}`)
				}
				tileMap[r][c].setFrame(frame);
			}
		}

		this.curDirection = Direction.None;
		this.isMoving = false;
	}
}