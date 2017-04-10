//import DrawThroughContext from './drawThroughContext';
import { AnimationType, isFunction, ITopLeftPos, randBetween, vAlign, hAlign } from './util';
import DrawTarget from './drawTarget';
import DrawThroughContext from './drawThroughContext';
import RGBA from './rgba';
import { Rect } from './geometry';

interface IAnimation {
	animType: AnimationType;
	newValue: any;
	oldValue: any;
	duration: number;
	callback: () => void;
	easing: (t: number) => number;
	isAbsolute: boolean;
	lifetime: number;
	complete: boolean;
}

export interface IUiElementParams {
	name?: string;
	size?: {
		width: number;
		height: number;
	};
	visible?: boolean;
	parent?: UiElement;
	vAlign?: vAlign;
	hAlign?: hAlign;
	position?: ITopLeftPos;
	bgColor?: RGBA;
}

let uniqueId = 0;

export default class UiElement {
	protected _position: ITopLeftPos;
	protected _size: {
		width: number;
		height: number;
	};
	private _truePosition: ITopLeftPos;
	protected children: UiElement[];
	protected hAlign: hAlign;
	protected id: number;
	protected name: string;
	protected parent: UiElement;
	protected vAlign: vAlign;
	protected visible: boolean;
	protected bgColor: RGBA;
	private animations: IAnimation[];
	private opacity: number;

	public get position() {
		return Object.assign({}, this._position);
	}
	public get truePosition() {
		return Object.assign({}, this._truePosition);
	}
	public get size() {
		return Object.assign({}, this._size);
	}

	constructor(params: IUiElementParams) {
		this.id = ++uniqueId;
		this.name = params.name || "unnamed";
		this._truePosition = { left: 0, top: 0 };
		this._size = params.size || { width: 0, height: 0 };
		this.visible = params.visible !== undefined ? params.visible : true;
		this.children = [];
		this.parent = params.parent || null;
		this.vAlign = params.vAlign || 'top';
		this.hAlign = params.hAlign || 'left';
		this.bgColor = params.bgColor || RGBA.blank;
		this._position = params.position || { left: 0, top: 0 };
		this.animations = [];

		this.calculateTruePosition();
	}

	show(show: boolean) {
		//console.log('UiElement ' + this.id + ' shown');
		this.visible = show;
	}

	setPosition(top: number, left: number) {
		//console.log('UiElement ' + this.id + ' position set');
		this._position.top = top;
		this._position.left = left;
		this.calculateTruePosition();
	}

	setWidth(width: number) {
		this._size.width = width;
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].parentDimensionsChanged();
		}
		this.calculateTruePosition();
	}

	setHeight(height: number) {
		this._size.height = height;
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].parentDimensionsChanged();
		}
		this.calculateTruePosition();
	}

	parentDimensionsChanged() {
		this.calculateTruePosition();
	}

	calculateTruePosition() {
		if (this.parent === null) {
			// should only be the toplevel elt
			this._truePosition = {
				left: 0,
				top: 0
			}
			return;
		}

		switch (this.vAlign) {
			case "top":
				this._truePosition.top = this._position.top;
				break;
			case "center":
				this._truePosition.top = Math.floor((this.parent._size.height - this._size.height) / 2) + this._position.top;
				break;
			case "bottom":
				this._truePosition.top = this.parent._size.height - this._size.height + this._position.top;
				break;
			default:
				console.error("Cannot calculate true position: invalid vertical alignment " + this.vAlign)
		}

		switch (this.hAlign) {
			case "left":
				this._truePosition.left = this._position.left;
				break;
			case "center":
				this._truePosition.left = Math.floor((this.parent._size.width - this._size.width) / 2) + this._position.left;
				break;
			case "right":
				this._truePosition.left = this.parent._size.width - this._size.width + this._position.left;
				break;
			default:
				console.error("Cannot calculate true position: invalid horizontal alignment " + this.hAlign)
		}
	}

	addChild(child: UiElement) {
		//console.log('UiElement ' + this.id + ' got child ' + child.id);
		if (child.parent !== null) {
			console.error('Cannot add child: child already has a parent');
			return;
		}
		child.parent = this;
		child.calculateTruePosition();
		this.children.push(child);
	}

	removeChild(child: UiElement) {
		var i = this.children.indexOf(child);
		if (i !== -1) {
			child.parent = null;
			this.children.splice(i, 1);
		}
		else {
			console.warn("Failed to remove child: child not found");
		}
	}

	removeAllChildren() {
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].parent = null;
		}
		this.children = [];
	}

	animate(animType: AnimationType, value: any, duration: number, callback: () => void = null, easing: (t: number) => number, isAbsolute: boolean = true): void {
		let oldValue;
		switch (animType) {
			case AnimationType.Opacity:
				oldValue = this.opacity;
				break;
			case AnimationType.Position:
				oldValue = this.position;
				break;
		}

		this.animations.push({
			animType,
			newValue: value,
			oldValue: oldValue,
			duration,
			callback,
			easing,
			isAbsolute,
			lifetime: 0,
			complete: false
		});
	}

	_draw(drawTarget: DrawTarget) {
		if (this.visible) {
			this.draw(drawTarget);
			for (let i = 0; i < this.children.length; i++) {
				let child = this.children[i];
				child._draw(new DrawThroughContext(drawTarget, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height));
			}
		}
	}

	draw(drawTarget: DrawTarget) {
		if (this.bgColor !== null && this.bgColor !== RGBA.blank) {
			drawTarget.pushDrawFillRect(new Rect(0, 0, this.size.width, this.size.height), this.bgColor);
		}
	}

	_update(deltaTime: number) {
		if (isFunction(this.update)) {
			this.update(deltaTime)
		}
		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			child._update(deltaTime);
		}
	}

	update(deltaTime: number) {
		for (let i = 0; i < this.animations.length; i++) {
			// update time on each animation,
			// set new value as appropriate
			const anim = this.animations[i];
			if (anim.complete === false) {
				anim.lifetime += deltaTime;
				const t = Math.min(anim.lifetime / anim.duration, 1);
				const factor = anim.easing(t);
				//console.log(deltaTime);
				//console.log(t);
				//console.log(factor);
				switch (anim.animType) {
					case AnimationType.Opacity:
						const oldOpacity = anim.oldValue as number;
						const newOpaciy = anim.newValue as number;
						const diffOpacity = anim.isAbsolute ? newOpaciy - oldOpacity : newOpaciy;
						this.opacity = oldOpacity + diffOpacity * factor;
						break;
					case AnimationType.Position:
						const oldPos = anim.oldValue as ITopLeftPos;
						const newPos = anim.newValue as ITopLeftPos;
						const diffTop = anim.isAbsolute ? newPos.top - oldPos.top : newPos.top;
						const diffLeft = anim.isAbsolute ? newPos.left - oldPos.left : newPos.left;
						const newTop = Math.floor(oldPos.top + diffTop * factor);
						const newLeft = Math.floor(oldPos.left + diffLeft * factor);
						this.setPosition(newTop, newLeft);
						break;
				}

				// Animation has finished
				if (t === 1) {
					anim.callback();
					anim.complete = true; // TODO: actually clean this up
				}
			}
		}
	}
}
