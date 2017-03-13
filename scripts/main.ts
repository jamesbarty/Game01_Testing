import GameEngine from './game/gameEngine';
import { imageManager } from './lib/imageManager';

imageManager.addImage('res/spritesheet.png', 'spritesheet');
imageManager.loadImages(() => {
	let game = new GameEngine();
	game.start();
});
