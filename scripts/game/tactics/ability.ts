import { IStringTMap } from '../../lib/util';
import Unit from './unit';

enum ValidTarget {
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

type TargetDetails = {
	targetType: RangeType;
	range: number;
	validTarget: ValidTarget;
}

enum RangeType {
	Bloom,
	Square,
	Cross,
	Plus,
	All
}

type CastDetails = {
	castType: RangeType;
	range: number;
	self: boolean;
}

export interface Ability {
	castDetails: CastDetails,
	targetDetails: TargetDetails,
	cooldown: number;
	apply: (source: Unit, targets: Unit[]) => void;
}

const Abilities: IStringTMap<Ability> = {
	slash: {
		castDetails: {
			castType: RangeType.Bloom,
			range: 1,
			self: false
		},
		targetDetails: {
			targetType: RangeType.Bloom,
			range: 1,
			validTarget: ValidTarget.Enemy
		},
		cooldown: 0,
		apply: (source: Unit, targets: Unit[]) => {
			targets[0].takeDamage(source.attack);
		}
	}
}

export default Abilities;