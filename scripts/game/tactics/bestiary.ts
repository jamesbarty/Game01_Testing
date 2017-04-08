import { IStringTMap } from '../../lib/util';
import { Ability } from './ability';

interface BestiaryEntry {
	health: number;
	speed: number;
	move: number;
	attack: number;
	defense: number;
	willpower: number;
	intellect: number;

	abilities: Ability[];
}

const Bestiary: IStringTMap<BestiaryEntry> = {
	shroom: {
		health: 20,
		speed: 20,
		move: 2,
		attack: 5,
		defense: 0,
		willpower: 0,
		intellect: 0,
		
		abilities: []
	},
	shroom2: {
		health: 50,
		speed: 25,
		move: 2,
		attack: 2,
		defense: 2,
		willpower: 2,
		intellect: 2,
		
		abilities: []
	}
}

export default Bestiary;