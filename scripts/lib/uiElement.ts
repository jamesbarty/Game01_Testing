//import DrawThroughContext from './drawThroughContext';
import { isFunction, randBetween, vAlign, hAlign } from './util';

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
	position?: {
		left: number;
		top: number;
	}
}

let uniqueId = 0;

export default class UiElement {
	protected position: {
		left: number;
		top: number;
	}
	protected _size: {
		width: number;
		height: number;
	};
	private _truePosition: {
		left: number;
		top: number;
	};
	protected children: UiElement[];
	protected hAlign: hAlign;
	protected id: number;
	protected name: string;
	protected parent: UiElement;
	protected vAlign: vAlign;
	protected visible: boolean;
	r: number;
	g: number;
	b: number;

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
		this.visible = params.visible || true;
		this.children = [];
		this.parent = params.parent || null;
		this.vAlign = params.vAlign || 'top';
		this.hAlign = params.hAlign || 'left';
		this.position = params.position || { left: 0, top: 0 };

		this.r = randBetween(0, 255);
		this.g = randBetween(0, 255);
		this.b = randBetween(0, 255);

		this.calculateTruePosition();
	}

	show(show: boolean) {
		console.log('UiElement ' + this.id + ' shown');
		this.visible = show;
	}

	setPosition(top: number, left: number) {
		console.log('UiElement ' + this.id + ' position set');
		this.position.top = top;
		this.position.left = left;
		this.calculateTruePosition();
	}

	setWidth(width: number) {
		this._size.width = width;
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].parentDimensionsChanged();
		}
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
				this.truePosition.top = this.position.top;
				break;
			case "center":
				this.truePosition.top = Math.floor((this.parent._size.height - this._size.height) / 2) + this.position.top;
				break;
			case "bottom":
				this.truePosition.top = this.parent._size.height - this._size.height + this.position.top;
				break;
			default:
				console.error("Cannot calculate true position: invalid vertical alignment " + this.vAlign)
		}

		switch (this.hAlign) {
			case "left":
				this.truePosition.left = this.position.left;
				break;
			case "center":
				this.truePosition.left = Math.floor((this.parent._size.width - this._size.width) / 2) + this.position.left;
				break;
			case "right":
				this.truePosition.left = this.parent._size.width - this._size.width + this.position.left;
				break;
			default:
				console.error("Cannot calculate true position: invalid horizontal alignment " + this.hAlign)
		}
	}

	addChild(child: UiElement) {
		console.log('UiElement ' + this.id + ' got child ' + child.id);
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
			this.children.splice(i, 1);
		}
		else {
			console.warn("Failed to remove child: child not found");
		}
	}

	_draw(drawTarget: any) {
		this.draw(drawTarget);
		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			//child._draw(new drawThroughContext(drawTarget, child.truePosition.left, child.truePosition.top, child.size.width, child.size.height));
		}
	}

	draw(drawTarget: any) {
		drawTarget.fillStyle = '#000';
		drawTarget.fillRect(0, 0, 20, 20);
		//drawTarget.pushDrawFillRect(0, 0, this.size.width / 2, this.size.height, this.r, this.g, this.b, 128);
		//drawTarget.pushDrawFillRect(this.size.width / 2, 0, this.size.width / 2, this.size.height, this.r, this.g, this.b, 255);
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

	}
}
