import { IStringTMap } from './util';

class ImageManager {
	imageMap: IStringTMap<HTMLImageElement>;
	numImages: number;
	numLoaded: number;

	constructor() {
		this.imageMap = {};
		this.numImages = 0;
		this.numLoaded = 0;
	}

	addImage(url: string, name: string) {
		if (url !== "" && !url) {
			console.error("Cannot add image: no name specified");
		}
		if (this.imageMap.hasOwnProperty(name)) {
			console.error("Cannot add image: image with name " + name + " already exists");
			return;
		}
		this.numImages += 1;
		const image = new Image();
		image.onload = () => {
			this.numLoaded += 1;
		}
		image.src = url;
		this.imageMap[name] = image;
	}

	loadImages(callback: Function) {
		if (this.numLoaded === this.numImages) {
			callback();
		}
		const loadCheck = setInterval(function () {
			if (this.numLoaded === this.numImages) {
				clearInterval(loadCheck);
				callback();
			}
		}, 100);
	}
}

export let imageManager = new ImageManager();
