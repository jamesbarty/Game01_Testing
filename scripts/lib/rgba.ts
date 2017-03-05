export default class RGBA {
	r: number;
	g: number;
	b: number;
	a: number;

	constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 255) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

export let red = new RGBA(255, 0, 0);
export let blue = new RGBA(0, 0, 255);
export let green = new RGBA(0, 255, 0);
