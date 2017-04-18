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
import { AbilityInstance } from './ability';

export interface IInfoPanelParams extends IMouseInteractiveParams {
	spriteSheetManager: SpriteSheetManager;
	onAbilityClicked?: (ability: AbilityInstance) => void; 
}

export default class InfoPanel extends MouseInteractive {
	private spriteSheetManager: SpriteSheetManager;
	private unit: Unit;
	private unitSprite: Bitmap;
	private nameLabel: Label;
	private healthLabel: Label;
	private actionLabel: Label;
	private spriteMargin: number;
	private deltaCounter: number;
	private updateInterval: number;
	private abilityContainer: MouseInteractive;
	private abilityElts: MouseInteractive[];
	private onAbilityClicked: (ability: AbilityInstance) => void; 

	constructor(params: IInfoPanelParams) {
		super(params);

		this.unit = null;
		this.spriteSheetManager = params.spriteSheetManager;
		this.spriteMargin = 6;
		this.deltaCounter = 0;
		this.updateInterval = 100;
		this.onAbilityClicked = params.onAbilityClicked;
		this.buildUi();
		this.show(false);
	}

	setUnit(unit: Unit) {
		this.unit = unit;
		this.abilityContainer.removeAllChildren();
		if (this.unit == null) {
			this.show(false);
		}
		else {
			this.unitSprite.setFrame("tactics", unit.unitName);
			this.nameLabel.setText(unit.unitName);
			this.healthLabel.setText(`HP: ${this.unit.health}/${this.unit.maxHealth}`);
			this.actionLabel.setText(`AP: ${this.unit.actionBar}/${Unit.maxActionBar}`);
			this.unit.abilities.forEach((ability, index) => {
				const abilityEntry = new AbilityEntry({
					position: {
						left: 2,
						top: index * (9 + 2) + 2
					},
					size: {
						width: this.abilityContainer.size.width - 4,
						height: 12
					},
					spriteSheetManager: this.spriteSheetManager,
					ability: ability,
					bgColor: RGBA.green
				});
				abilityEntry.onClick = () => {
					this.onAbilityClicked && this.onAbilityClicked(ability);
				}
				this.abilityContainer.addChild(abilityEntry);
			});
			this.show(true);
		}
	}

	buildUi() {
		this.unitSprite = new Bitmap({
			spriteSheetManager: this.spriteSheetManager,
			namespace: "tiles",
			frameKey: "black",
			size: {
				width: 12,
				height: 12
			},
			position: {
				left: 4,
				top: 4
			}
		});
		this.nameLabel = new Label({
			text: "fundefined",
			spriteSheetManager: this.spriteSheetManager,
			size: {
				height: 12,
				width: this.size.width - (12 + this.spriteMargin)
			},
			position: {
				left: 18,
				top: 4
			},
			textVAlign: 'center',
			bgColor: RGBA.blank
		});
		this.healthLabel = new Label({
			text: `HP: 0/0`,
			spriteSheetManager: this.spriteSheetManager,
			size: {
				height: 9,
				width: this.size.width - (12 + this.spriteMargin)
			},
			position: {
				left: 18,
				top: 18
			},
			bgColor: RGBA.blank,
			textVAlign: 'center'
		});
		this.actionLabel = new Label({
			text: `AP: 0/0`,
			spriteSheetManager: this.spriteSheetManager,
			size: {
				height: 9,
				width: this.size.width - (12 + this.spriteMargin)
			},
			position: {
				left: 18,
				top: 29
			},
			bgColor: RGBA.blank,
			textVAlign: 'center'
		});

		this.abilityContainer = new MouseInteractive({
			size: {
				width: this.size.width - 4,
				height: 42
			},
			position: {
				left: 2,
				top: 40
			},
			bgColor: RGBA.mediumGrey
		});

		this.addChild(this.unitSprite);
		this.addChild(this.nameLabel);
		this.addChild(this.healthLabel);
		this.addChild(this.actionLabel);
		this.addChild(this.abilityContainer);
	}

	update(deltaTime: number) {
		super.update(deltaTime);
		this.deltaCounter += deltaTime;
		if (this.deltaCounter >= this.updateInterval) {
			this.deltaCounter -= this.updateInterval;
			if (this.unit != null && this.visible) {
				this.healthLabel.setText(`HP: ${this.unit.health}/${this.unit.maxHealth}`);
				this.actionLabel.setText(`AP: ${this.unit.actionBar}/${Unit.maxActionBar}`);
			}
		}
	}
}

interface IAbilityEntryParams extends IMouseInteractiveParams {
	ability: AbilityInstance;
	spriteSheetManager: SpriteSheetManager;
}

class AbilityEntry extends Button {
	private ability: AbilityInstance;
	private abilityBitmap: Bitmap;
	private abilityLabel: Label;
	private cooldownLabel: Label;

	constructor(params: IAbilityEntryParams) {
		super(Object.assign(params, {
			text: '',
			styles: [RGBA.white, RGBA.lightGrey, RGBA.mediumGrey],
			spriteSheetManager: params.spriteSheetManager
		}));

		this.ability = params.ability;
		this.abilityBitmap = new Bitmap({
			size: {
				width: 12,
				height: 12
			},
			spriteSheetManager: this.spriteSheetManager,
			namespace: this.ability.spriteNamespace,
			frameKey: this.ability.spriteFrame
		});

		this.abilityLabel = new Label({
			text: this.ability.name,
			position: {
				left: 14,
				top: 0
			},
			size: {
				width: this.size.width - 14,
				height: 12
			},
			spriteSheetManager: this.spriteSheetManager,
			textVAlign: 'center'
		});

		this.cooldownLabel = new Label({
			text: this.ability.cooldown.toString(),
			size: {
				width: 12,
				height: 12
			},
			spriteSheetManager: this.spriteSheetManager,
			textVAlign: 'center',
			textHAlign: 'center',
			hAlign: 'right',
			bgColor: RGBA.lightGrey
		});

		this.addChild(this.abilityBitmap);
		this.addChild(this.abilityLabel);
		this.addChild(this.cooldownLabel);
	}
}