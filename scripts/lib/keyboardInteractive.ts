import MouseInteractive, { IMouseInteractiveParams } from './mouseInteractive';

export interface IKeyboardInteractiveParams extends IMouseInteractiveParams {

}

export default class KeyboardInteractive extends MouseInteractive {

	constructor(params: IKeyboardInteractiveParams) {
		super(params);
	}

	onKeyDown(e: KeyboardEvent) {

	}

	onKeyUp(e: KeyboardEvent) {

	}

	onCharacter(e: KeyboardEvent) {

	}

	onFocus(e: KeyboardEvent) {

	}

	onLoseFocus(e: KeyboardEvent) {

	}
}
