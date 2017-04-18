import Screen from '../screen';
import GameEngine from '../gameEngine';
import MouseInteractive from '../../lib/mouseInteractive';
import Button from '../../lib/button';
import Label from '../../lib/label';
import Bitmap from '../../lib/bitmap';
import RGBA from '../../lib/rgba';
import * as Constants from '../../lib/constants';
import { TransitionType } from '../screenManager';

export default class MainMenuScreen extends MouseInteractive {
	game: GameEngine;

	constructor(game: GameEngine) {
		super({
			name: "MainMenuScreen",
			size: {
				width: Constants.LOGICAL_CANVAS_WIDTH,
				height: Constants.LOGICAL_CANVAS_HEIGHT
			}
		});

		this.game = game;
		this.buildUi();
	}

	buildUi() {
		let background = new Bitmap({
			spriteSheetManager: this.game.spriteSheetManager,
			namespace: "tiles",
			frameKey: "black",
			size: {
				width: 16,
				height: 16
			}
		});

		let menuBoard = new MouseInteractive({
			name: 'menuBoard',
			position: {
				left: 0,
				top: -40
			},
			size: {
				width: 60,
				height: 45
			},
			hAlign: 'center',
			vAlign: 'bottom'
		});
		
		let btnNewGame = new Button({
			text: 'New Game',
			position: {
				left: 0,
				top: 5
			},
			size: {
				width: 50,
				height: 15
			},
			hAlign: 'center',
			styles: [RGBA.white, RGBA.lightGrey, RGBA.mediumGrey],
			spriteSheetManager: this.game.spriteSheetManager
		});
		btnNewGame.onClick = () => {
			this.game.goToScreen(GameEngine.Screen.TacticsScreen);
		}

		let btnLoadGame = new Button({
			text: 'Load Game',
			position: {
				left: 0,
				top: 25
			},
			size: {
				width: 50,
				height: 15
			},
			hAlign: 'center',
			styles: [RGBA.white, RGBA.lightGrey, RGBA.mediumGrey],
			spriteSheetManager: this.game.spriteSheetManager
		});

		let title = new Label({
			text: 'Main Menu',
			name: 'title',
			position: {
				left: 10,
				top: 10
			},
			size: {
				width: 100,
				height: 30
			},
			spriteSheetManager: this.game.spriteSheetManager,
			wrapping: 'character',
			textHAlign: 'center',
			textVAlign: 'center'
		});
		
		menuBoard.addChild(btnNewGame);
		menuBoard.addChild(btnLoadGame);

		this.addChild(background);
		this.addChild(title);
		this.addChild(menuBoard);
	}
}