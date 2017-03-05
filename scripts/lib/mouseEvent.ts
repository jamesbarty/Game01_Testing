import { LOGICAL_PIXEL_EDGE } from './constants';

export default class MouseEvt {
	offsetX: number;
	offsetY: number;
	stopped: boolean;
	x: number;
	y: number;

	constructor(e: MouseEvt | MouseEvent, offsetLeft: number, offsetTop: number) {
		if (e instanceof MouseEvt) {
			this.x = e.x;
			this.y = e.y;
			this.offsetX = e.offsetX - offsetLeft;
			this.offsetY = e.offsetY - offsetTop;
		}
		else if (e instanceof MouseEvent) {
			const crect = document.getElementById('mainCanvas').getBoundingClientRect();
			let x = e.offsetX ? e.offsetX : e.pageX - crect.left;
			let y = e.offsetY ? e.offsetY : e.pageY - crect.top;
			x = Math.floor(x / LOGICAL_PIXEL_EDGE);
			y = Math.floor(y / LOGICAL_PIXEL_EDGE);
			this.x = x;
			this.y = y;
			this.offsetX = x;
			this.offsetY = y;
		}
		this.stopped = false;
	}

	stopPropagation() {
		this.stopped = true;
	}
}
