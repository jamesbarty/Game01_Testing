import Screen from '../screen';
import GameEngine from '../gameEngine';
import MouseInteractive from '../../lib/mouseInteractive';
import Button from '../../lib/button';
import Label from '../../lib/label';
import Bitmap from '../../lib/bitmap';
import RGBA from '../../lib/rgba';
import * as Constants from '../../lib/constants';
import { TransitionType } from '../screenManager';

export default class MainMenu extends Screen {

	constructor(game: GameEngine) {
		super("MainMenuScreen", game);

		this.buildUi();
	}

	buildUi() {
		const ss =  this.game.spriteSheets[Constants.SPRITESHEET_MAIN];
		let background = new Bitmap({
			spriteSheet: ss,
			frameKey: "back",
			size: {
				width: ss.getFrame("back").w,
				height: ss.getFrame("back").h
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
			spriteSheet: this.game.spriteSheets[Constants.SPRITESHEET_MAIN]
		});
		btnNewGame.onClick = () => {
			this.game.screenManager.setScreen(this.game.screens['worldMap'], TransitionType.Cut);
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
			spriteSheet: ss
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
			spriteSheet: ss,
			wrapping: 'character',
			textHAlign: 'center',
			textVAlign: 'center'
		});
		
		menuBoard.addChild(btnNewGame);
		menuBoard.addChild(btnLoadGame);

		this.rootElement.addChild(background);
		this.rootElement.addChild(title);
		this.rootElement.addChild(menuBoard);
	}
}