import { IStringTMap } from '../../lib/util';
import Unit from './unit';
import Tile from './tile';

export enum ValidTarget {
	Vacant,
	Unit,
	Self,
	Ally,
	Enemy,

	SelfAlly,
	SelfEnemy,
	AllyEnemy,
	Any
}

export type TargetDetails = {
	rangeDetails: RangeDetails;
	validTarget: ValidTarget;
}

export enum RangeType {
	Bloom,
	Square,
	Cross,
	Plus,
	All
}

export type RangeDetails = {
	rangeType: RangeType;
	range: number;
	self: boolean;
}

export interface Ability {
	name: string;
	castDetails: RangeDetails,
	targetDetails: TargetDetails,
	cooldown: number;
	apply: (source: Unit, targets: Tile[]) => void;
	spriteNamespace: string;
	spriteFrame: string;
}

const Abilities: IStringTMap<Ability> = {
	slash: {
		name: 'slash',
		castDetails: {
			rangeType: RangeType.Bloom,
			range: 1,
			self: false
		},
		targetDetails: {
			rangeDetails: {
				rangeType: RangeType.Bloom,
				range: 0,
				self: true
			},
			validTarget: ValidTarget.Enemy
		},
		cooldown: 0,
		apply: (source: Unit, targets: Tile[]) => {
			targets[0].occupant.takeDamage(source.attack);
		},
		spriteNamespace: 'tactics',
		spriteFrame: 'shroom'
	}
}

export class AbilityInstance implements Ability {
	name: string;
	castDetails: RangeDetails;
	targetDetails: TargetDetails;
	cooldown: number;
	spriteNamespace: string;
	spriteFrame: string;
	apply: (source: Unit, targets: Tile[]) => void;

	constructor(abil: Ability) {
		this.name = abil.name;
		this.castDetails = abil.castDetails;
		this.targetDetails = abil.targetDetails;
		this.cooldown = abil.cooldown;
		this.apply = abil.apply;
		this.spriteNamespace = abil.spriteNamespace;
		this.spriteFrame = abil.spriteFrame;
	}
}

export default Abilities;