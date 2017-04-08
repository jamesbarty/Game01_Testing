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
import Unit from './unit';

type UnitData = IStringTMap<number>;

export default class TacticsScreen extends MouseInteractive {
	private mapContainer: MouseInteractive;
	private tileContainer: MouseInteractive;
	private placementContainer: MouseInteractive;
	private listEntryQuantities: IStringTMap<Label>;
	private infoPanel: MouseInteractive;
	private tileMap: Tile[][];
	private spawnMap: SpawnPoint[];
	private selectedSpawn: SpawnPoint;
	private curMap: ITacticsMap;
	private tileWidth: number;
	private tileHeight: number;
	private maxTilesX: number;
	private maxTilesY: number;
	private game: GameEngine;

	private mockUnits: UnitData;

	constructor(game: GameEngine) {
		super({
			name: "TacticsScreen",
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH,
				height: Constants.LOGICAL_CANVAS_HEIGHT
			}
		});

		this.mockUnits = {
			"shroom": 1,
			"shroom2": 2
		};

		this.game = game;
		this.mapContainer = null;
		this.tileContainer = null;
		this.placementContainer = null;
		this.listEntryQuantities = {};
		this.selectedSpawn = null;
		this.curMap = level1;
		this.tileWidth = 16;
		this.tileHeight = 16;
		this.maxTilesX = 15;
		this.maxTilesY = 15;
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
			}
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
				height: Constants.LOGICAL_CANVAS_HEIGHT
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

		const listEntryContainer = new MouseInteractive({
			name: `TacticsScreen-listEntryContainer`,
			position: {
				left: 0,
				top: 20
			},
			size: {
				width: 104,
				height: 500
			}
		});

		Object.keys(mockUnits).forEach((unitName, i) => {
			const unitQty = mockUnits[unitName];
			const listEntry = new MouseInteractive({
				position: {
					left: 0,
					top: i * 9
				},
				size: {
					width: 104,
					height: 9
				},
				bgColor: RGBA.white
			});
			const listEntryTitle = new Label({
				name: `TacticsScreen-listEntryTitle-${unitName}`,
				text: `${unitName}`,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				position: {
					left: 2,
					top: 0
				},
				size: {
					width: 94,
					height: 9
				},
				textVAlign: 'center',
				bgColor: RGBA.blank
			});
			const listEntryQuantity = new Label({
				name: `TacticsScreen-listEntryQuantity-${unitName}`,
				text: `x${unitQty}`,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				position: {
					left: -2,
					top: 0
				},
				size: {
					width: 94,
					height: 9
				},
				hAlign: 'right',
				textHAlign: 'right',
				textVAlign: 'center',
				bgColor: RGBA.blank
			});
			this.listEntryQuantities[unitName] = listEntryQuantity;
			listEntry.addChild(listEntryTitle);
			listEntry.addChild(listEntryQuantity);
			listEntryContainer.addChild(listEntry);

			listEntry.onClick = () => {
				this.selectUnit(unitName);
			}
		})

		this.placementContainer.addChild(title);
		this.placementContainer.addChild(listEntryContainer);
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
				const tileBg = new Bitmap({
					spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
					frameKey: frame,
					size: {
						width: tileWidth,
						height: tileHeight
					}
				});
				tile.setBackground(tileBg);
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

		this.spawnMap = [];
		for (let i = 0; i < curMap.spawns.length; i++) {
			const spawn = curMap.spawns[i];
			const spawnPoint = new SpawnPoint({
				x: spawn.x,
				y: spawn.y,
				spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
				position: {
					left: spawn.x * tileWidth,
					top: spawn.y * tileHeight
				},
				size: {
					width: tileWidth,
					height: tileHeight
				}
			});
			spawnPoint.onClick = () => {
				this.selectSpawn(spawnPoint);
			}
			this.spawnMap.push(spawnPoint);
			tileContainer.addChild(spawnPoint);
		}

		this.placeEnemies();
	}

	placeEnemies() {
		const { curMap, game, tileWidth, tileHeight } = this;
		for (var i = 0; i < curMap.enemies.length; i++) {
			const enemy = curMap.enemies[i];
			const enemyUnit = new Unit({
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

	selectSpawn(spawn: SpawnPoint) {
		if (this.selectedSpawn !== null) {
			this.selectedSpawn.deselect();
		}
		this.selectedSpawn = spawn;
		spawn.select();
	}

	selectUnit(unit: string) {
		const { game } = this;
		if (this.selectedSpawn != null) {
			if (this.mockUnits[unit] > 0) {
				const { x, y } = this.selectedSpawn;
				const tile = this.tileMap[y][x];
				if (tile.isOccupied()) {
					const oldLabel = this.listEntryQuantities[tile.occupant.unitName];
					this.mockUnits[tile.occupant.unitName] += 1;
					oldLabel.setText("x" + this.mockUnits[tile.occupant.unitName]);
					tile.vacate();
				}
				this.tileMap[y][x].occupy(new Unit({
					unitName: unit,
					spriteSheet: game.spriteSheets[Constants.SPRITESHEET_MAIN],
					size: {
						width: 16,
						height: 16
					}
				}));
				this.mockUnits[unit] -= 1;
				const newLabel = this.listEntryQuantities[unit];
				newLabel.setText("x" + this.mockUnits[unit]);
				this.selectedSpawn.occupy();
				this.selectedSpawn = null;
			}
		}
	}
}

interface ISpawnPointParams extends IMouseInteractiveParams {
	x: number;
	y: number;
	spriteSheet: SpriteSheet
}

class SpawnPoint extends Bitmap {
	x: number;
	y: number;
	occupied: boolean;

	constructor(params: ISpawnPointParams) {
		super(Object.assign(params, {
			frameKey: "spawn"
		}));
		this.x = params.x;
		this.y = params.y;
	}

	isOccupied() {
		return this.occupied;
	}

	occupy() {
		this.occupied = true;
		this.show(false);
	}

	vacate() {
		this.occupied = false;
		this.show(true);
	}

	select() {
		if (this.isOccupied()) {
			this.show(true);
			this.setFrame("spawnHighlightOccupied")
		}
		else {
			this.setFrame("spawnHighlight");
		}
	}

	deselect() {
		if (this.isOccupied()) {
			this.show(false);
		}
		else {
			this.setFrame("spawn");
		}
	}

}



interface ITileParams extends IMouseInteractiveParams {
	spriteSheet: SpriteSheet;
}

class Tile extends MouseInteractive {
	private background: Bitmap;
	occupant: Unit;
	private spriteSheet: SpriteSheet;

	constructor(params: ITileParams) {
		super(params);
		
		this.background = null;
		this.occupant = null;
		this.spriteSheet = params.spriteSheet;
	}

	setBackground(bg: Bitmap) {
		if (this.background != null) {
			this.removeChild(this.background);
		}
		this.background = bg;
		this.addChild(bg);
	}

	isOccupied() {
		return this.occupant != null;
	}

	occupy(unit: Unit) {
		this.occupant = unit;
		this.addChild(unit);
	}

	vacate() {
		if (this.occupant != null) {
			this.removeChild(this.occupant);
		}
		this.occupant = null;
	}
}