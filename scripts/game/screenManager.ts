import Screen from './screen';
import GameEngine from './gameEngine';

export enum TransitionType {
	Cut,
	FadeToBlack
}

export default class ScreenManager {
	private game: GameEngine;
	private curScreen: Screen;
	private prevScreen: Screen;

	constructor(game: GameEngine) {
		this.game = game;
		this.curScreen = null;
		this.prevScreen = null;
	}

	setScreen(screen: Screen, transitionType: TransitionType) {
		if (screen === null) {
			throw 'Cannot set screen to null';
		}
		switch(transitionType) {
			case TransitionType.Cut:
				screen.beforeMount();
				this.game.addChild(screen.rootElement);
				if (this.curScreen) {
					this.curScreen.beforeUnmount();
					this.game.removeChild(this.curScreen.rootElement);
				}
				this.prevScreen = this.curScreen;
				this.curScreen = screen;
				break;
			case TransitionType.FadeToBlack:
				break;
		}
	}

	return(transitionType: TransitionType) {
		if (this.prevScreen) {
			this.setScreen(this.prevScreen, transitionType);
		}
	}
}