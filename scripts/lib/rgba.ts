export default class RGBA {

	static blank = new RGBA(0, 0, 0, 0);
	static red = new RGBA(255, 0, 0);
	static green = new RGBA(0, 255, 0);
	static blue = new RGBA(0, 0, 255);

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
