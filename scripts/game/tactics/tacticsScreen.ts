import MouseInteractive, { IMouseInteractiveParams } from '../../lib/mouseInteractive';
import Bitmap, { IBitmapParams } from '../../lib/bitmap';
import DrawTarget from '../../lib/drawTarget';
import DrawThroughContext from '../../lib/drawThroughContext';
import GameEngine from '../gameEngine';
import Label from '../../lib/label';
import { Rect } from '../../lib/geometry';
import RGBA from '../../lib/rgba';
import SpriteSheet from '../../lib/spriteSheet';
import { IStringTMap } from '../../lib/util';
import * as Constants from '../../lib/constants';
import { ITacticsMap, spawnPosition } from '../maps/maps';
import level1 from '../maps/tactics/level1';
import Bestiary from './bestiary';
import Unit, { Team } from './unit';
import Button from '../../lib/button';
import Tile, { TileOverlay } from './tile';

type UnitData = IStringTMap<number>;

enum GamePhase {
	Placement,
	Started,
	PlayerTurn
}

export default class TacticsScreen extends MouseInteractive {
	private mapContainer: MouseInteractive;
	private tileContainer: MouseInteractive;
	private placementContainer: MouseInteractive;
	private placementItems: IStringTMap<PlacementItem>;
	private infoPanel: MouseInteractive;
	private tileMap: Tile[][];
	private selectedTile: Tile;
	private curMap: ITacticsMap;
	private tileWidth: number;
	private tileHeight: number;
	private maxTilesX: number;
	private maxTilesY: number;
	private game: GameEngine;
	private units: Unit[];
	private gamePhase: GamePhase;
	private actionTickDuration: number;
	private actionTickCount: number;

	private mockUnits: UnitData;

	constructor(game: GameEngine) {
		super({
			name: "TacticsScreen",
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH,
				height: Constants.LOGICAL_CANVAS_HEIGHT
			},
			bgColor: RGBA.white
		});

		this.mockUnits = {
			"shroom": 1,
			"shroom2": 2
		};

		this.game = game;
		this.gamePhase = GamePhase.Placement;
		this.mapContainer = null;
		this.tileContainer = null;
		this.placementContainer = null;
		this.placementItems = {};
		this.selectedTile = null;
		this.curMap = level1;
		this.tileWidth = 16;
		this.tileHeight = 16;
		this.maxTilesX = 15;
		this.maxTilesY = 15;
		this.actionTickDuration = 20;
		this.actionTickCount = 0;
		this.buildUi();
		this.initMap(this.curMap);
	}

	buildUi() {
		const { curMap, maxTilesX, maxTilesY, tileHeight, tileWidth } = this;

		this.mapContainer = new MouseInteractive({
			name: 'TacticsScreen-mapContainer',
			position: {
				left: 0,
				top: 0
			},
			size: {
				width: tileWidth * maxTilesX,
				height: tileHeight * maxTilesY
			},
			bgColor: RGBA.lightGrey
		});

		this.tileContainer = new MouseInteractive({
			name: 'TacticsScreen-tileContainer',
			vAlign: 'center',
			hAlign: 'center'
		});

		this.placementContainer = new MouseInteractive({
			name: 'TacticsScreen-placementContainer',
			position: {
				left: tileWidth * maxTilesX,
				top: 0
			},
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH - tileWidth * maxTilesX,
				height: Math.floor(Constants.LOGICAL_CANVAS_HEIGHT / 2)
			}
		});

		this.infoPanel = new MouseInteractive({
			name: 'TacticsScreen-infoPanel',
			position: {
				left: tileWidth * maxTilesX,
				top: Math.floor(Constants.LOGICAL_CANVAS_HEIGHT / 2),
			},
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH - tileWidth * maxTilesX,
				height: Math.floor(Constants.LOGICAL_CANVAS_HEIGHT / 2)
			},
			bgColor: RGBA.lightGrey
		});

		this.mapContainer.addChild(this.tileContainer);
		this.addChild(this.mapContainer);
		this.addChild(this.placementContainer);
		this.addChild(this.infoPanel);
	}

	buildPlacement() {
		const { game, mockUnits } = this;

		this.placementContainer.removeAllChildren();
		const title = new Label({
			text: "Units",
			spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
			size: {
				width: 104,
				height: 20
			},
			textVAlign: 'center',
			textHAlign: 'center',
			bgColor: RGBA.lightGrey
		});

		const placementItemContainer = new MouseInteractive({
			name: `TacticsScreen-listEntryContainer`,
			position: {
				left: 0,
				top: 20
			},
			size: {
				width: 104,
				height: Math.floor(Constants.LOGICAL_CANVAS_HEIGHT / 2)
			}
		});

		Object.keys(mockUnits).forEach((unitName, i) => {
			const unitQty = mockUnits[unitName];
			const placementItem = new PlacementItem({
				position: {
					left: 0,
					top: i * 9
				},
				size: {
					width: 104,
					height: 9
				},
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				unitName: unitName,
				quantity: unitQty
			});

			this.placementItems[unitName] = placementItem;
			placementItemContainer.addChild(placementItem);

			placementItem.onClick = () => {
				this.selectUnit(unitName);
			}
		});

		const startBtn = new Button({
			text: "Start Game",
			spriteSheet: this.game.spriteSheets[Constants.SPRITESHEET_MAIN],
			size: {
				width: this.placementContainer.size.width,
				height: 9
			},
			styles: [RGBA.lightGrey, RGBA.mediumGrey, RGBA.darkGrey],
			position: {
				left: 0,
				top: -9
			},
			vAlign: 'bottom'
		});
		startBtn.onClick = () => {
			this.startGame();
		}
		const removeBtn = new Button({
			text: "Remove Unit",
			spriteSheet: this.game.spriteSheets[Constants.SPRITESHEET_MAIN],
			size: {
				width: this.placementContainer.size.width,
				height: 9
			},
			styles: [RGBA.lightGrey, RGBA.mediumGrey, RGBA.darkGrey],
			position: {
				left: 0,
				top: 0
			},
			vAlign: 'bottom'
		});
		removeBtn.onClick = () => {
			this.removeUnit();
		}

		this.placementContainer.addChild(title);
		this.placementContainer.addChild(placementItemContainer);
		this.placementContainer.addChild(startBtn);
		this.placementContainer.addChild(removeBtn);
	}

	populateInfoPanel(unit: Unit) {
		const { game } = this;
		this.infoPanel.removeAllChildren();
		if (unit != null) {
			const unitSprite = new Bitmap({
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				frameKey: unit.unitName,
				size: {
					width: 12,
					height: 12
				},
				position: {
					left: 4,
					top: 4
				}
			});
			const nameLabel = new Label({
				text: unit.unitName,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				size: {
					height: 12,
					width: 80
				},
				position: {
					left: 18,
					top: 4
				},
				textVAlign: 'center',
				bgColor: RGBA.blank
			});

			const healthLabel = new Label({
				text: `HP: ${unit.health}/${unit.maxHealth}`,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				size: {
					height: 9,
					width: 80
				},
				position: {
					left: 18,
					top: 18
				},
				bgColor: RGBA.blank,
				textVAlign: 'center'
			});

			const actionLabel = new Label({
				text: `AP: ${unit.actionBar}/${Unit.maxActionBar}`,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				size: {
					height: 9,
					width: 80
				},
				position: {
					left: 18,
					top: 29
				},
				bgColor: RGBA.blank,
				textVAlign: 'center'
			});

			this.infoPanel.addChild(unitSprite);
			this.infoPanel.addChild(nameLabel);
			this.infoPanel.addChild(healthLabel);
			this.infoPanel.addChild(actionLabel);
		}
	}

	initMap(newMap: ITacticsMap) {
		const { curMap, game, tileContainer, tileHeight, tileWidth, tileMap } = this;
		
		this.curMap = newMap;
		tileContainer.removeAllChildren();
		tileContainer.setWidth(curMap.width * tileWidth);
		tileContainer.setHeight(curMap.height * tileHeight);
		this.tileMap = [];
		for (let r = 0; r < curMap.height; r++) {
			this.tileMap[r] = [];
			for (let c = 0; c < curMap.width; c++) {
				let frame = curMap.map[r][c];
				const tile = new Tile({
					x: c,
					y: r,
					spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
					position: {
						left: c * tileWidth,
						top: r * tileHeight
					},
					size: {
						width: tileWidth,
						height: tileHeight
					}
				});
				tile.setBackgroundFrame(frame);
				tile.onMouseEnter = () => {
					if (tile.isOccupied()) {
						this.populateInfoPanel(tile.occupant);
					}
				};
				tile.onMouseLeave = () => {
					this.populateInfoPanel(null);
				};
				this.tileMap[r][c] = tile;
				tileContainer.addChild(tile);
			}
		}

		this.buildPlacement();

		for (let i = 0; i < curMap.spawns.length; i++) {
			const spawn = curMap.spawns[i];
			const targetTile = this.tileMap[spawn.y][spawn.x];
			targetTile.setOverlay(TileOverlay.Spawn);
			targetTile.onClick = () => {
				this.selectTile(targetTile);
			};
		}

		this.placeEnemies();
	}

	placeEnemies() {
		const { curMap, game, tileWidth, tileHeight } = this;
		for (var i = 0; i < curMap.enemies.length; i++) {
			const enemy = curMap.enemies[i];
			const enemyUnit = new Unit({
				team: Team.Enemy,
				unitName: enemy.name,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				size: {
					width: tileWidth,
					height: tileHeight
				}
			});
			this.tileMap[enemy.position.y][enemy.position.x].occupy(enemyUnit);
		}
	}

	selectTile(tile: Tile) {
		if (this.selectedTile !== null) {
			this.selectedTile.deselect();
		}
		this.selectedTile = tile;
		tile.select();
	}

	selectUnit(unit: string) {
		const { game } = this;
		if (this.selectedTile != null) {
			if (this.mockUnits[unit] > 0) {
				const { x, y } = this.selectedTile;
				const tile = this.tileMap[y][x];
				if (tile.isOccupied()) {
					const placementItem = this.placementItems[tile.occupant.unitName];
					this.mockUnits[tile.occupant.unitName] += 1;
					placementItem.updateQuantity(this.mockUnits[tile.occupant.unitName]);
					tile.vacate();
				}
				tile.occupy(new Unit({
					team: Team.Player,
					unitName: unit,
					spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
					size: {
						width: 16,
						height: 16
					}
				}));
				this.mockUnits[unit] -= 1;
				const newPlacementItem = this.placementItems[unit];
				newPlacementItem.updateQuantity(this.mockUnits[unit]);
				this.selectedTile.deselect();
				this.selectedTile = null;
			}
		}
	}

	startGame() {
		const { curMap } = this;
		this.units = [];
		// Clear any unused spawns, add units to the player list
		this.tileMap.forEach((row) => { 
			row.forEach((tile) => {
				tile.setOverlay(TileOverlay.None);
				if (tile.isOccupied()) {
					this.units.push(tile.occupant);
				}
			});
		});

		this.removeChild(this.placementContainer);
		this.gamePhase = GamePhase.Started;
	}

	removeUnit() {
		const { selectedTile } = this;
		// This kinda doesn't work
		if (selectedTile != null && selectedTile.isOccupied() && selectedTile.occupant.team === Team.Player) {
			const occupant = selectedTile.occupant;
			this.mockUnits[occupant.unitName] += 1;
			this.placementItems[occupant.unitName].updateQuantity(this.mockUnits[occupant.unitName]);
			selectedTile.vacate();
			selectedTile.select();
		}
	}

	update(deltaTime: number) {
		if (this.gamePhase === GamePhase.Started) {
			// check if anyone is ready
			for (let i = 0; i < this.units.length; i++) {
				const unit = this.units[i];
				if (unit.actionBar >= Unit.maxActionBar) {
					// take turn
					if (unit.team === Team.Enemy) {
						this.performEnemyTurn(unit);
					}
					else {
						this.gamePhase = GamePhase.PlayerTurn;
						// set info panel
						this.buildMovementOverlay(unit);
					}
					return;
				}
			}
			this.actionTickCount += deltaTime;
			if (this.actionTickCount > this.actionTickDuration) {
				this.actionTickCount -= this.actionTickDuration;
				for (let i = 0; i < this.units.length; i++) {
					this.units[i].tick();
				}
			}
		}
	}

	performEnemyTurn(unit: Unit) {
		unit.actionBar = 0;
		console.log('yo I went jk');
	}

	buildMovementOverlay(unit: Unit) {
		let foundTile: Tile = null;
		for (let r = 0; r < this.tileMap.length; r++) {
			const row = this.tileMap[r];
			for (let c = 0; c < row.length; c++) {
				const tile = row[c];
				if (tile.isOccupied() && tile.occupant === unit) {
					foundTile = tile;
					break;
				}
			}
		}
		if (foundTile === null) {
			console.error(`Could not find tile with that unit`);
			return;
		}
		const moveRange = unit.getMoveRange();
		const tilesInRange = this.getTilesInRange(foundTile, moveRange);
		tilesInRange.forEach(tile => {
			tile.setOverlay(TileOverlay.Target);
		});
	}

	getTilesInRange(tile: Tile, range: number) {
		let tiles: Tile[] = [];
		let searchedMap: IStringTMap<Tile> = {};
		let curTiles: Tile[] = [tile];
		while (range > 0 && curTiles.length > 0) {
			let newTiles: Tile[] = [];
			curTiles.forEach(c => {
				let neighbours = this.getNeighbours(c);
				neighbours.forEach(n => {
					const hashKey = n.x * this.tileMap.length + n.y;
					// Skip tiles already considered
					if (searchedMap[hashKey]) {
						return;
					}
					searchedMap[hashKey] = n;
					if (!n.isOccupied()) {
						// Consider this guy's neighbours next time
						newTiles.push(n);
						tiles.push(n);
					}
				});
			});
			curTiles = newTiles;
			range -= 1;
		}
		return tiles;
	}

	getNeighbours(tile: Tile) {
		const { tileMap } = this;
		let neighbours = [];
		const { x, y } = tile;
		if (x > 0) {
			neighbours.push(tileMap[y][x - 1]);
		}
		if (x < tileMap[0].length - 1) {
			neighbours.push(tileMap[y][x + 1]);
		}
		if (y > 0) {
			neighbours.push(tileMap[y - 1][x]);
		}
		if (y < tileMap.length - 1) {
			neighbours.push(tileMap[y + 1][x]);
		}
		return neighbours;
	}
}

interface IPlacementItemParams extends IMouseInteractiveParams {
	spriteSheet: SpriteSheet;
	unitName: string;
	quantity: number;
}

class PlacementItem extends Button {
	unitName: string;
	quantity: number;
	unitLabel: Label;
	quantityLabel: Label;

	constructor(params: IPlacementItemParams) {
		super(Object.assign(params, {
			text: '',
			spriteSheet: params.spriteSheet,
			styles: [RGBA.white, RGBA.lightGrey, RGBA.mediumGrey]
		}));

		this.unitName = params.unitName;
		this.quantity = params.quantity;

		this.unitLabel = new Label({
			spriteSheet: this.spriteSheet,
			text: this.unitName,
			size: {
				width: 94,
				height: 9
			},
			position: {
				left: 2,
				top: 0
			},
			textVAlign: 'center'
		});

		this.quantityLabel = new Label({
			spriteSheet: this.spriteSheet,
			text: `x${this.quantity}`,
			size: {
				width: 94,
				height: 9
			},
			position: {
				left: -2,
				top: 0
			},
			textVAlign: 'center',
			textHAlign: 'right',
			hAlign: 'right'
		});

		this.addChild(this.unitLabel);
		this.addChild(this.quantityLabel);
	}

	updateQuantity(quantity: number) {
		this.quantity = quantity;
		this.quantityLabel.setText(`x${this.quantity}`);
	}
}