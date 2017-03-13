import Screen from '../screen';
import GameEngine from '../gameEngine';
import MouseInteractive from '../../lib/mouseInteractive';
import Button from '../../lib/button';
import Label from '../../lib/label';
import RGBA from '../../lib/rgba';
import * as Constants from '../../lib/constants';
import { TransitionType } from '../screenManager';

export default class WorldMap extends Screen {

	constructor(game: GameEngine) {
		super("WorldMapScreen", game);

		//lame
		let parentElt = new MouseInteractive({
			name: 'worldmap',
			position: {
				left: -20,
				top: -20
			},
			size: {
				width: 50,
				height: 50
			},
			hAlign: 'right',
			vAlign: 'bottom'
		});
		/*parentElt.onMouseEnter = () => {
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
		}*/

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

		let titleElt = new Label({
			text: 'World Map Screen',
			name: 'title',
			position: {
				left: 10,
				top: 20
			},
			size: {
				width: 100,
				height: 30
			},
			spriteSheet: this.game.spriteSheets[Constants.SPRITESHEET_MAIN],
			wrapping: 'character',
			hAlign: 'left',
			vAlign: 'top',
			textHAlign: 'center',
			textVAlign: 'center'
		});
		/*childElt.onMouseEnter = () => {
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
		}*/

		childElt.onClick = () => {
			this.game.screenManager.setScreen(this.game.screens['mainMenu'], TransitionType.Cut);
		}

		childElt.update = function() {
			//this.position.x = this.position.x + 1 % this.size.width;
		}
		parentElt.addChild(childElt);

		this.rootElement.addChild(parentElt);
		this.rootElement.addChild(titleElt);
	}
}