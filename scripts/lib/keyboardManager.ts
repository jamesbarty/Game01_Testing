class KeyboardManager {
	private state: any; // TODO

	getKeyState(key: string) {
		return this.state[key];
	}

	onKeyDown(e: KeyboardEvent) {
		console.log(e.keyCode);
		this.state[e.keyCode] = 1;	
	}

	onKeyUp(e: KeyboardEvent) {
		this.state[e.keyCode] = 0;
	}
}

export let keyboardManager = new KeyboardManager();
