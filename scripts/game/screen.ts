import GameEngine from './gameEngine';
import MouseInteractive from '../lib/mouseInteractive';
import * as Constants from '../lib/constants';

export default class Screen {
	rootElement: MouseInteractive;
	game: GameEngine;

	constructor(name: string, game: GameEngine) {
		this.rootElement = new MouseInteractive({
			name: name,
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH,
				height: Constants.LOGICAL_CANVAS_HEIGHT
			}
		});
		this.game = game;
	}

	beforeMount() {

	}

	beforeUnmount() {

	}
}