export interface IMap {
	width: number;
	height: number;
	map: string[][];
}

export type spawnPosition = {
	x: number;
	y: number;
}
type enemyInfo = {
	name: string;
	position: spawnPosition;
}

export interface ITacticsMap extends IMap {
	spawns: spawnPosition[];
	enemies: enemyInfo[];
}