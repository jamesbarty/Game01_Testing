import MouseInteractive, { IMouseInteractiveParams } from '../../lib/mouseInteractive';
import Bestiary from './Bestiary';
import Bitmap from '../../lib/bitmap';
import DrawTarget from '../../lib/drawTarget';
import DrawThroughContext from '../../lib/drawThroughContext';
import { Rect } from '../../lib/geometry';
import RGBA from '../../lib/rgba';
import SpriteSheet from '../../lib/spriteSheet';

interface IUnitParams extends IMouseInteractiveParams {
	unitName: string;
	spriteSheet: SpriteSheet;
}

export default class Unit extends MouseInteractive {
	unitName: string;
	health: number;
	maxHealth: number;
	actionBar: number;
	static maxActionBar: number = 10000;
	static actionYellow = new RGBA(255, 216, 0);
	static healthRed = new RGBA(255, 124, 124);
	static barBack = new RGBA(130, 130, 130);

	speed: number;
	attack: number;
	defense: number;
	intellect: number;
	willpower: number;

	protected picture: Bitmap;
	protected frame: Bitmap;

	constructor(params: IUnitParams) {
		super(params);

		this.unitName = params.unitName;
		this.loadStats();

		this.picture = new Bitmap({
			spriteSheet: params.spriteSheet,
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
			spriteSheet: params.spriteSheet,
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
		this.attack = bestiaryEntry.attack;
		this.defense = bestiaryEntry.defense;
		this.intellect = bestiaryEntry.intellect;
		this.willpower = bestiaryEntry.willpower;
	}

	draw(drawTarget: DrawTarget) {
		const { health, maxHealth, actionBar } = this;
		drawTarget.pushDrawFillRect(new Rect(1, 1, 2, 12), Unit.barBack);
		drawTarget.pushDrawFillRect(new Rect(1, 1, 2, 12 * Math.ceil(actionBar / Unit.maxActionBar)), Unit.actionYellow);
		drawTarget.pushDrawFillRect(new Rect(2, 13, 13, 2), Unit.barBack);
		drawTarget.pushDrawFillRect(new Rect(2, 13, 13 * Math.ceil(health / maxHealth), 2), Unit.healthRed);
	}
}