import GameEngine from './game/gameEngine';
import { imageManager } from './lib/imageManager';

const numSheets = (window as any).sheetMeta._numSheets;
for (let i = 0; i < numSheets; i++) {
	imageManager.addImage(`res/Sheet_${i}.png`, `sheet${i}`);
}

imageManager.loadImages(() => {
	let game = new GameEngine();
	game.start();
});
