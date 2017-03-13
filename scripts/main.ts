import GameEngine from './game/gameEngine';
import { imageManager } from './lib/imageManager';

imageManager.addImage('res/fawnt_7pt_2.png', 'font');
imageManager.loadImages(() => {
	let game = new GameEngine();
	game.start();
});
