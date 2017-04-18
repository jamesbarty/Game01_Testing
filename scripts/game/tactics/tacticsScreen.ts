import MouseInteractive, { IMouseInteractiveParams } from '../../lib/mouseInteractive';
import Bitmap, { IBitmapParams } from '../../lib/bitmap';
import DrawTarget from '../../lib/drawTarget';
import DrawThroughContext from '../../lib/drawThroughContext';
import GameEngine from '../gameEngine';
import Label from '../../lib/label';
import { Rect } from '../../lib/geometry';
import RGBA from '../../lib/rgba';
import SpriteSheetManager from '../../lib/spriteSheetManager';
import { IStringTMap } from '../../lib/util';
import * as Constants from '../../lib/constants';
import { ITacticsMap, spawnPosition } from '../maps/maps';
import level1 from '../maps/tactics/level1';
import Bestiary from './bestiary';
import Unit, { Team } from './unit';
import Button from '../../lib/button';
import Tile, { TileOverlay } from './tile';
import InfoPanel from './infoPanel';
import { Ability, AbilityInstance, RangeType, RangeDetails, ValidTarget } from './ability';

type UnitData = IStringTMap<number>;

enum GamePhase {
	Placement,
	Started,
	EnemyTurn,
	PlayerMoving,
	PlayerTargeting
}

enum Direction {
	Down,
	Up,
	Left,
	Right
}

export default class TacticsScreen extends MouseInteractive {
	private mapContainer: MouseInteractive;
	private tileContainer: MouseInteractive;
	private placementContainer: MouseInteractive;
	private buttonContainer: ButtonContainer;
	private placementItems: IStringTMap<PlacementItem>;
	private activeInfoPanel: InfoPanel;
	private tempInfoPanel: InfoPanel;
	private tileMap: Tile[][];
	private selectedTile: Tile;
	private curMap: ITacticsMap;
	private tileWidth: number;
	private tileHeight: number;
	private maxTilesX: number;
	private maxTilesY: number;
	private game: GameEngine;
	private units: Unit[];
	private activeUnit: Unit;
	private activeAbility: AbilityInstance;
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
		this.buttonContainer = null;
		this.placementContainer = null;
		this.placementItems = {};
		this.selectedTile = null;
		this.curMap = level1;
		this.tileWidth = 16;
		this.tileHeight = 16;
		this.maxTilesX = 15;
		this.maxTilesY = 15;
		this.activeUnit = null;
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
				height: 111
			}
		});

		this.activeInfoPanel = new InfoPanel({
			name: 'TacticsScreen-infoPanel',
			spriteSheetManager: this.game.spriteSheetManager,
			position: {
				left: tileWidth * maxTilesX,
				top: 0,
			},
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH - tileWidth * maxTilesX,
				height: 111
			},
			bgColor: RGBA.lightGrey,
			onAbilityClicked: this.onAbilityClicked
		});

		this.tempInfoPanel = new InfoPanel({
			name: 'TacticsScreen-infoPanel',
			spriteSheetManager: this.game.spriteSheetManager,
			position: {
				left: tileWidth * maxTilesX,
				top: 129,
			},
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH - tileWidth * maxTilesX,
				height: 111
			},
			bgColor: RGBA.lightGrey
		});

		this.buttonContainer = new ButtonContainer({
			name: 'TacticsScreen-buttonContainer',
			position: {
				left: tileWidth * maxTilesX,
				top: 111
			},
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH - tileWidth * maxTilesX,
				height: 18
			},
			button1Click: this.onButton1Click,
			button2Click: this.onButton2Click,
			spriteSheetManager: this.game.spriteSheetManager
		});

		this.mapContainer.addChild(this.tileContainer);
		this.addChild(this.mapContainer);
		this.addChild(this.activeInfoPanel);
		this.addChild(this.placementContainer);
		this.addChild(this.tempInfoPanel);
		this.addChild(this.buttonContainer);
	}

	onButton1Click = () => {
		switch(this.gamePhase) {
			// Start game
			case GamePhase.Placement:
				this.startGame();
				break;
			// End turn
			case GamePhase.PlayerMoving:
				this.endTurn();
				break;
			// Cancel ability
			case GamePhase.PlayerTargeting:
				this.changePhase(GamePhase.PlayerMoving);
				this.clearOverlays();
				this.buildMovementOverlay(this.activeUnit);
				break;
		}
	}

	onButton2Click = () => {
		switch(this.gamePhase) {
			case GamePhase.Placement:
				this.removeUnit();
				break;
		}
	}

	buildPlacement() {
		const { game, mockUnits } = this;

		this.placementContainer.removeAllChildren();
		const title = new Label({
			text: "Units",
			spriteSheetManager: game.spriteSheetManager,
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
				height: 111
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
				spriteSheetManager: game.spriteSheetManager,
				unitName: unitName,
				quantity: unitQty
			});

			this.placementItems[unitName] = placementItem;
			placementItemContainer.addChild(placementItem);

			placementItem.onClick = () => {
				this.selectUnit(unitName);
			}
		});


		this.placementContainer.addChild(title);
		this.placementContainer.addChild(placementItemContainer);
	}

	changePhase(newPhase: GamePhase) {
		switch (this.gamePhase) {
			case GamePhase.Placement:
				switch (newPhase) {
					case GamePhase.Placement:
						break;
					case GamePhase.Started:
						this.buttonContainer.showButton1(false);
						this.buttonContainer.showButton2(false);
						break;
					case GamePhase.PlayerMoving:
						break;
					case GamePhase.PlayerTargeting:
						break;
				}
				break;
			case GamePhase.Started:
				switch (newPhase) {
					case GamePhase.Placement:
						break;
					case GamePhase.Started:
						this.buttonContainer.showButton1(false);
						break;
					case GamePhase.PlayerMoving:
						this.buttonContainer.setButton1Text('End Turn');
						this.buttonContainer.showButton1(true);
						break;
					case GamePhase.PlayerTargeting:
						break;
				}
				break;
			case GamePhase.PlayerMoving:
				switch (newPhase) {
					case GamePhase.Placement:
						break;
					case GamePhase.Started:
						break;
					case GamePhase.PlayerMoving:
						break;
					case GamePhase.PlayerTargeting:
						this.buttonContainer.setButton1Text('Cancel');
						break;
				}
				break;
			case GamePhase.PlayerTargeting:
				switch (newPhase) {
					case GamePhase.Placement:
						break;
					case GamePhase.Started:
						break;
					case GamePhase.PlayerMoving:
						this.buttonContainer.setButton1Text('End Turn');
						break;
					case GamePhase.PlayerTargeting:
						break;
				}
				break;
		}
		this.gamePhase = newPhase;
	}

	onAbilityClicked = (ability: AbilityInstance) => {
		if (this.gamePhase === GamePhase.PlayerMoving) {
			this.changePhase(GamePhase.PlayerTargeting);
			this.activeAbility = ability;
			this.clearOverlays();
			this.buildTargetOverlay(ability);
		}
	}

	buildTargetOverlay(ability: AbilityInstance) {
		let foundTile: Tile = null;
		for (let r = 0; r < this.tileMap.length; r++) {
			const row = this.tileMap[r];
			for (let c = 0; c < row.length; c++) {
				const tile = row[c];
				if (tile.isOccupied() && tile.occupant === this.activeUnit) {
					foundTile = tile;
					break;
				}
			}
		}
		if (foundTile === null) {
			console.error(`Could not find tile with that unit`);
			return;
		}

		const { rangeType, range, self } = ability.castDetails;
		const targetTiles = this.getTilesInRangeType(foundTile, ability.castDetails);
		targetTiles.forEach(tile => {
			tile.setOverlay(TileOverlay.Target);
		});
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
					spriteSheetManager: game.spriteSheetManager,
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
						this.tempInfoPanel.setUnit(tile.occupant);
					}
				};
				tile.onMouseLeave = () => {
					this.tempInfoPanel.setUnit(null);
				};
				tile.onClick = () => {
					this.selectTile(tile);
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
				spriteSheetManager: game.spriteSheetManager,
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

		switch (this.gamePhase) {
			case GamePhase.PlayerMoving:
				switch (tile.overlayType) {
					case TileOverlay.MoveDown:
						this.movePlayer(Direction.Down);
						break;
					case TileOverlay.MoveUp:
						this.movePlayer(Direction.Up);
						break;
					case TileOverlay.MoveLeft:
						this.movePlayer(Direction.Left);
						break;
					case TileOverlay.MoveRight:
						this.movePlayer(Direction.Right);
						break;
				}
				break;
			case GamePhase.PlayerTargeting:
				if (tile.overlayType === TileOverlay.Target) {
					// check if valid target
					const targetTiles = this.getTilesInRangeType(tile, this.activeAbility.targetDetails.rangeDetails);
					const validTargets: Tile[] = [];
					targetTiles.forEach(tile => {
						if (this.isTargetTileValid(this.activeUnit, this.activeAbility, tile)) {
							validTargets.push(tile);
						}
					});
					// if we have a target then do shit
					if (validTargets.length > 0) {
						this.activeAbility.apply(this.activeUnit, validTargets);
						this.endTurn();
					}
				}
				break;
		}
	}

	endTurn() {
		this.activeUnit.endTurn();
		this.activeInfoPanel.setUnit(null);
		this.activeUnit = null;
		this.activeAbility = null;
		this.clearOverlays();
		this.changePhase(GamePhase.Started);
	}

	isTargetTileValid(caster: Unit, ability: Ability, targetTile: Tile): boolean {
		const { validTarget } = ability.targetDetails;
		if (!targetTile.occupant) {
			return validTarget === ValidTarget.Vacant;
		}
		const { occupant } = targetTile;
		if (occupant === caster) {
			switch (validTarget) {
				case ValidTarget.Self:
				case ValidTarget.SelfAlly:
				case ValidTarget.SelfEnemy:
					return true;
				default:
					return false;
			}
		}
		else if (occupant.team === caster.team) {
			switch (validTarget) {
				case ValidTarget.Ally:
				case ValidTarget.AllyEnemy:
				case ValidTarget.SelfAlly:
					return true;
				default:
					return false;
			}
		}
		else if (occupant.team !== caster.team) {
			switch (validTarget) {
				case ValidTarget.Enemy:
				case ValidTarget.AllyEnemy:
				case ValidTarget.SelfEnemy:
					return true;
				default:
					return false;
			}
		}
		return true;
	}

	getTilesInRangeType(tile: Tile, rangeDetails: RangeDetails): Tile[] {
		const { rangeType, range, self } = rangeDetails;
		const tiles: Tile[] = [];
		switch (rangeType) {
			case RangeType.Bloom:
				for (let r = 0; r < this.tileMap.length; r++) {
					for (let c = 0; c < this.tileMap[0].length; c++) {
						const t = this.tileMap[r][c];
						const delta = Math.abs(tile.y - t.y) + Math.abs(tile.x - t.x);
						if (delta <= range) {
							if (delta === 0 && self === false) {
								continue;
							}
							tiles.push(t);
						}
					}
				}
				break;
		}
		return tiles;
	}

	movePlayer(dir: Direction) {
		const selTile = this.selectedTile;
		let unit = null;
		switch (dir) {
			case Direction.Down:
				unit = this.tileMap[selTile.y - 1][selTile.x].vacate();
				selTile.occupy(unit);
				break;
			case Direction.Up:
				unit = this.tileMap[selTile.y + 1][selTile.x].vacate();
				selTile.occupy(unit);
				break;
			case Direction.Left:
				unit = this.tileMap[selTile.y][selTile.x + 1].vacate();
				selTile.occupy(unit);
				break;
			case Direction.Right:
				unit = this.tileMap[selTile.y][selTile.x - 1].vacate();
				selTile.occupy(unit);
				break;
		}
		unit.moved();
		this.clearOverlays();
		this.buildMovementOverlay(unit);
	}


	clearOverlays() {
		const { tileMap } = this;
		for (let r = 0; r < tileMap.length; r++) {
			for (let c = 0; c < tileMap[0].length; c++) {
				const tile = tileMap[r][c];
				tile.setOverlay(TileOverlay.None);
			}
		}
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
					spriteSheetManager: game.spriteSheetManager,
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
		this.changePhase(GamePhase.Started);
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
					this.activeUnit = unit;
					this.activeInfoPanel.setUnit(unit);
					if (unit.team === Team.Enemy) {
						this.performEnemyTurn(unit);
					}
					else {
						this.changePhase(GamePhase.PlayerMoving);
						
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
		unit.endTurn();
		this.activeInfoPanel.setUnit(null);
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
			if (this.isTileAbove(tile, foundTile)) {
				tile.setOverlay(TileOverlay.MoveUp);
			}
			else if (this.isTileBelow(tile, foundTile)) {
				tile.setOverlay(TileOverlay.MoveDown);
			}
			else if (this.isTileRightOf(tile, foundTile)) {
				tile.setOverlay(TileOverlay.MoveRight);
			}
			else if (this.isTileLeftOf(tile, foundTile)) {
				tile.setOverlay(TileOverlay.MoveLeft);
			}
			else {
				tile.setOverlay(TileOverlay.MoveTarget);
			}
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

	isTileLeftOf(tile: Tile, targetTile: Tile) {
		return tile.y === targetTile.y && tile.x === targetTile.x - 1;
	}

	isTileRightOf(tile: Tile, targetTile: Tile) {
		return tile.y === targetTile.y && tile.x === targetTile.x + 1;
	}

	isTileAbove(tile: Tile, targetTile: Tile) {
		return tile.y === targetTile.y - 1 && tile.x === targetTile.x;
	}

	isTileBelow(tile: Tile, targetTile: Tile) {
		return tile.y === targetTile.y + 1 && tile.x === targetTile.x;
	}
}

interface IPlacementItemParams extends IMouseInteractiveParams {
	spriteSheetManager: SpriteSheetManager;
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
			spriteSheetManager: params.spriteSheetManager,
			styles: [RGBA.white, RGBA.lightGrey, RGBA.mediumGrey]
		}));

		this.unitName = params.unitName;
		this.quantity = params.quantity;

		this.unitLabel = new Label({
			spriteSheetManager: this.spriteSheetManager,
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
			spriteSheetManager: this.spriteSheetManager,
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

interface IButtonContainerParams extends IMouseInteractiveParams {
	button1Click: () => void;
	button2Click: () => void;
	spriteSheetManager: SpriteSheetManager;
}

class ButtonContainer extends MouseInteractive {
	button1: Button;
	button2: Button;
	button1Click: () => void;
	button2Click: () => void;
	spriteSheetManager: SpriteSheetManager;

	constructor(params: IButtonContainerParams) {
		super(params);

		this.button1Click = params.button1Click;
		this.button2Click = params.button2Click;
		this.spriteSheetManager = params.spriteSheetManager;

		this.button1 = new Button({
			size: {
				width: this.size.width,
				height: 9
			},
			spriteSheetManager: this.spriteSheetManager,
			styles: [RGBA.lightGrey, RGBA.mediumGrey, RGBA.darkGrey],
			text: 'Start Game'
		});
		this.button1.onClick = () => {
			this.button1Click();
		};

		this.button2 = new Button({
			position: {
				top: 9,
				left: 0
			},
			size: {
				width: this.size.width,
				height: 9
			},
			spriteSheetManager: this.spriteSheetManager,
			styles: [RGBA.lightGrey, RGBA.mediumGrey, RGBA.darkGrey],
			text: 'Remove Unit'
		});
		this.button2.onClick = () => {
			this.button2Click();
		};

		this.addChild(this.button1);
		this.addChild(this.button2);
	}

	setButton1Text(text: string) {
		this.button1.setText(text);
	}

	setButton2Text(text: string) {
		this.button2.setText(text);
	}

	showButton1(show: boolean) {
		this.button1.show(show);
		this.button1.enable(show);
	}

	showButton2(show: boolean) {
		this.button2.show(show);
		this.button1.enable(show);
	}
}

