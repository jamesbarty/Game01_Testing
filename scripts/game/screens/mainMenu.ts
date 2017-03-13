import Screen from '../screen';
import GameEngine from '../gameEngine';
import MouseInteractive from '../../lib/mouseInteractive';
import Button from '../../lib/button';
import Label from '../../lib/label';
import RGBA from '../../lib/rgba';
import * as Constants from '../../lib/constants';
import { TransitionType } from '../screenManager';

export default class MainMenu extends Screen {

	constructor(game: GameEngine) {
		super("MainMenuScreen", game);

		//lame
		let parentElt = new MouseInteractive({
			name: 'parent',
			position: {
				left: 20,
				top: 20
			},
			size: {
				width: 50,
				height: 50
			}
		});
		parentElt.onMouseEnter = () => {
			console.log('parent enter');
		}
		parentElt.onMouseLeave = () => {
			console.log('parent leave');
		}
		parentElt.onMouseDown = () => {
			console.log('parent down');
		}
		parentElt.onMouseUp = () => {
			console.log('parent up');
		}

		/*let childElt = new Label({
			text: 'Fonts dont work all the time',
			name: 'child',
			position: {
				left: 0,
				top: 0
			},
			size: {
				width: 35,
				height: 30
			},
			spriteSheet: this.spriteSheets[constants.SPRITESHEET_MAIN],
			wrapping: 'character'
		});*/

		let titleElt = new Label({
			text: 'Main Menu Screen',
			name: 'title',
			position: {
				left: -10,
				top:- 20
			},
			size: {
				width: 100,
				height: 30
			},
			spriteSheet: this.game.spriteSheets[Constants.SPRITESHEET_MAIN],
			wrapping: 'character',
			hAlign: 'right',
			vAlign: 'bottom',
			textHAlign: 'center',
			textVAlign: 'center'
		});

		let childElt = new Button({
			text: 'click me',
			styles: [RGBA.red, RGBA.green, RGBA.blue],
			spriteSheet: this.game.spriteSheets[Constants.SPRITESHEET_MAIN],
			size: {
				width: 35,
				height: 15
			},
			hAlign: 'center'
		});
		childElt.onMouseEnter = () => {
			console.log('child enter');
		}
		childElt.onMouseLeave = () => {
			console.log('child leave');
		}
		childElt.onMouseDown = () => {
			console.log('child down');
		}
		childElt.onMouseUp = () => {
			console.log('child up');
		}
		childElt.onClick = () => {
			//parentElt.setWidth(parentElt.size.width + 10);
			this.game.screenManager.setScreen(this.game.screens['worldMap'], TransitionType.Cut);
		}

		childElt.update = function() {
			//this.position.x = this.position.x + 1 % this.size.width;
		}
		parentElt.addChild(childElt);

		this.rootElement.addChild(parentElt);
		this.rootElement.addChild(titleElt);
	}
}