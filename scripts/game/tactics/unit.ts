import MouseInteractive, { IMouseInteractiveParams } from '../../lib/mouseInteractive';
import Bestiary from './Bestiary';
import Bitmap from '../../lib/bitmap';
import DrawTarget from '../../lib/drawTarget';
import DrawThroughContext from '../../lib/drawThroughContext';
import { Rect } from '../../lib/geometry';
import RGBA from '../../lib/rgba';
import SpriteSheetManager from '../../lib/spriteSheetManager';
import { AbilityInstance } from './ability';

export enum Team {
	Player,
	Enemy
}

interface IUnitParams extends IMouseInteractiveParams {
	unitName: string;
	spriteSheetManager: SpriteSheetManager;
	team: Team;
}

export default class Unit extends MouseInteractive {
	team: Team;
	unitName: string;
	health: number;
	maxHealth: number;
	actionBar: number;
	static maxActionBar: number = 1000;
	static actionYellow = new RGBA(255, 216, 0);
	static healthRed = new RGBA(255, 124, 124);
	static barBack = new RGBA(130, 130, 130);

	speed: number;
	move: number;
	curMove: number;
	attack: number;
	defense: number;
	intellect: number;
	willpower: number;
	abilities: AbilityInstance[];

	protected picture: Bitmap;
	protected frame: Bitmap;

	constructor(params: IUnitParams) {
		super(params);

		this.team = params.team;
		this.unitName = params.unitName;
		this.abilities = [];
		this.loadStats();

		this.picture = new Bitmap({
			spriteSheetManager: params.spriteSheetManager,
			namespace: "tactics",
			frameKey: this.unitName,
			position: {
				top: 0,
				left: 4
			},
			size: {
				width: 12,
				height: 12
			}
		});
		this.frame = new Bitmap({
			spriteSheetManager: params.spriteSheetManager,
			namespace: "tactics",
			frameKey: "frame",
			size: {
				width: 16,
				height: 16
			}
		});
		this.addChild(this.picture);
		this.addChild(this.frame);
	}

	takeDamage(damage: number) {
		this.health = Math.max(0, this.health - damage);
	}

	loadStats() {
		const bestiaryEntry = Bestiary[this.unitName];
		this.health = bestiaryEntry.health;
		this.maxHealth = bestiaryEntry.health;
		this.actionBar = 0;
		this.speed = bestiaryEntry.speed;
		this.move = this.curMove = bestiaryEntry.move;
		this.attack = bestiaryEntry.attack;
		this.defense = bestiaryEntry.defense;
		this.intellect = bestiaryEntry.intellect;
		this.willpower = bestiaryEntry.willpower;

		bestiaryEntry.abilities.forEach(ability => {
			this.abilities.push(new AbilityInstance(ability));
		});
	}

	draw(drawTarget: DrawTarget) {
		const { health, maxHealth, actionBar } = this;
		const actionBarHeight = Math.ceil(12 * actionBar / Unit.maxActionBar);
		const healthBarWidth = Math.ceil(13 * health / maxHealth);
		drawTarget.pushDrawFillRect(new Rect(1, 1, 2, 12), Unit.barBack);
		drawTarget.pushDrawFillRect(new Rect(1, 13 - actionBarHeight, 2, actionBarHeight), Unit.actionYellow);
		drawTarget.pushDrawFillRect(new Rect(2, 13, 13, 2), Unit.barBack);
		drawTarget.pushDrawFillRect(new Rect(2, 13, healthBarWidth, 2), Unit.healthRed);
	}

	tick() {
		this.actionBar += this.speed;
	}

	getMoveRange() {
		return this.curMove;
	}

	moved() {
		this.curMove -= 1;
	}

	endTurn() {
		this.actionBar = 0;
		this.curMove = this.move; 
	}
}