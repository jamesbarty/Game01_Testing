import UiElement, { IUiElementParams } from './uiElement';
import { isFunction, pointInRect } from './util';
import MouseEvt from './mouseEvent';

export interface IMouseInteractiveParams extends IUiElementParams {
	active?: boolean;
}

export default class MouseInteractive extends UiElement {
	static maybeClickedElts : MouseInteractive[] = [];

	active: boolean;
	lastMoveTarget: MouseInteractive;
	maybeClicked: boolean;

	onMouseEnter?: (e: MouseEvt) => void;
	onMouseLeave?: (e: MouseEvt) => void;
	onMouseMove?: (e: MouseEvt) => void;
	onMouseMoveCapture?: (e: MouseEvt) => void;
	onMouseDown?: (e: MouseEvt) => void;
	onMouseDownCapture?: (e: MouseEvt) => void;
	onMouseUp?: (e: MouseEvt) => void;
	onMouseUpCapture?: (e: MouseEvt) => void;
	onClick?: (e: MouseEvt) => void;
	onClickCapture?: (e: MouseEvt) => void;

	constructor(params: IMouseInteractiveParams) {
		super(params);
		this.active = params.active || true;
		this.lastMoveTarget = null;
		this.maybeClicked = false;
	}

	static clearMaybeClickedElts() {
		for (var i = 0; i < MouseInteractive.maybeClickedElts.length; i++) {
			MouseInteractive.maybeClickedElts[i].maybeClicked = false;
		}
		MouseInteractive.maybeClickedElts = [];
	}

	_onMouseEnter(e: MouseEvt) {
		if (isFunction(this.onMouseEnter)) {
			this.onMouseEnter(e);
		}
	}

	_onMouseLeave(e: MouseEvt) {
		if (this.lastMoveTarget && this.lastMoveTarget.active) {
			var lastTargetEvent = new MouseEvt(e, this.lastMoveTarget.truePosition.left, this.lastMoveTarget.truePosition.top);
			this.lastMoveTarget._onMouseLeave(lastTargetEvent);
			this.lastMoveTarget = null;
		}
		if (isFunction(this.onMouseLeave)) {
			this.onMouseLeave(e);
		}
	}

	_onMouseMove(e: MouseEvt) {
		// On the way down
		if (isFunction(this.onMouseMoveCapture)) {
			this.onMouseMoveCapture(e);
		}

		// Did I kill it?
		if (e.stopped) {
			return;
		}

		// If not, send down the pipe
		var childEvent,
			found = false;
		for (var i = this.children.length - 1; i >= 0; i--) {
			// Only check children that contain the event coordinates
			var child = this.children[i] as MouseInteractive;
			if (pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
				if (child.active && child instanceof MouseInteractive) {
					childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
					child._onMouseMove(childEvent);
					// check for mouse enter
					if (child != this.lastMoveTarget) {
						// check for mouse leave
						if (this.lastMoveTarget && this.lastMoveTarget.active && isFunction(this.lastMoveTarget._onMouseLeave)) {
							var lastTargetEvent = new MouseEvt(e, this.lastMoveTarget.truePosition.left, this.lastMoveTarget.truePosition.top);
							this.lastMoveTarget._onMouseLeave(lastTargetEvent);
						}
						if (isFunction(child._onMouseEnter)) {
							child._onMouseEnter(childEvent);
						}
					}
				}
				this.lastMoveTarget = child;
				found = true;
				break;
			}
		}
		// I'm not on any of my children, which means if I was last time, it needs a mouseleave
		if (!found) {
			if (this.lastMoveTarget && this.lastMoveTarget.active && isFunction(this.lastMoveTarget.onMouseLeave)) {
				var lastTargetEvent = new MouseEvt(e, this.lastMoveTarget.truePosition.left, this.lastMoveTarget.truePosition.top);
				this.lastMoveTarget._onMouseLeave(lastTargetEvent);
			}
			this.lastMoveTarget = null;
		}

		// Did the event get killed before returning?? Skip it then
		if (childEvent && childEvent.stopped) {
			return;
		}

		// On the way up
		if (isFunction(this.onMouseMove)) {
			this.onMouseMove(e);
		}
	}

	_onMouseDown(e: MouseEvt) {
		this.maybeClicked = true;
		MouseInteractive.maybeClickedElts.push(this);
		// On the way down
		if (isFunction(this.onMouseDownCapture)) {
			this.onMouseDownCapture(e);
		}


		// Did I kill it?
		if (e.stopped) {
			return;
		}

		// If not, send down the pipe
		var childEvent;
		for (var i = this.children.length - 1; i >= 0; i--) {
			// Only check children that contain the event coordinates
			var child = this.children[i] as MouseInteractive;
			if (pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
				if (child.active && child instanceof MouseInteractive) {
					childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
					child._onMouseDown(childEvent);
				}
				// One child only
				break;
			}
		}

		// Did the event get killed before returning?? Skip it then
		if (childEvent && childEvent.stopped) {
			return;
		}

		// On the way up
		if (isFunction(this.onMouseDown)) {
			this.onMouseDown(e);
		}
	}

	_onMouseUp(e: MouseEvt) {
		// On the way down
		if (isFunction(this.onMouseUpCapture)) {
			this.onMouseUpCapture(e);
		}

		// Did I kill it?
		if (e.stopped) {
			return;
		}

		// If not, send down the pipe
		var childEvent;
		for (var i = this.children.length - 1; i >= 0; i--) {
			// Only check children that contain the event coordinates
			var child = this.children[i] as MouseInteractive;
			if (pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
				if (child.active && child instanceof MouseInteractive) {
					childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
					child._onMouseUp(childEvent);
				}
				// One child only
				break;
			}
		}

		// Did the event get killed before returning?? Skip it then
		if (childEvent && childEvent.stopped) {
			return;
		}

		// On the way up
		if (isFunction(this.onMouseUp)) {
			this.onMouseUp(e);
		}
	}

	_onClick(e: MouseEvt) {
		if (isFunction(this.onClickCapture)) {
			this.onClickCapture(e);
		}

		if (e.stopped) {
			return;
		}

		var childEvent;
		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i] as MouseInteractive;
			if (pointInRect(e.offsetX, e.offsetY, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height)) {
				if (child.active && child.maybeClicked && child instanceof MouseInteractive) {
					childEvent = new MouseEvt(e, child.truePosition.left, child.truePosition.top);
					child._onClick(childEvent);
				}
				break;
			}
		}

		// Did the event get killed before returning?? Skip it then
		if (childEvent && childEvent.stopped) {
			return;
		}

		// On the way up
		if (isFunction(this.onClick)) {
			this.onClick(e);
		}
	}

	enable(bool: boolean) {
		console.log('MouseInteractive ' + this.id + ' enabled ' + bool);
		this.active = bool;
	}

	addChild(child: MouseInteractive) {
		super.addChild(child);
	}
}
