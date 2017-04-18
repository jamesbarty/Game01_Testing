import MouseInteractive, { IMouseInteractiveParams } from '../../lib/mouseInteractive';
import Bitmap from '../../lib/bitmap';
import SpriteSheetManager from '../../lib/spriteSheetManager';
import Unit from './unit';

export enum TileOverlay {
	None,
	Spawn,
	MoveTarget,
	MoveUp,
	MoveDown,
	MoveLeft,
	MoveRight,
	Target
}

interface ITileParams extends IMouseInteractiveParams {
	spriteSheetManager: SpriteSheetManager;
	x: number;
	y: number;
}

export default class Tile extends MouseInteractive {
	private background: Bitmap;
	occupant: Unit;
	private overlay: Bitmap;
	overlayType: TileOverlay;
	private spriteSheetManager: SpriteSheetManager;
	x: number;
	y: number;

	constructor(params: ITileParams) {
		super(params);
		
		this.occupant = null;
		this.x = params.x;
		this.y = params.y;
		this.spriteSheetManager = params.spriteSheetManager;
		this.background = new Bitmap({
			spriteSheetManager: this.spriteSheetManager,
			namespace: "tiles",
			frameKey: "black",
			size: {
				width: this.size.width,
				height: this.size.height
			}
		});
		this.overlay = new Bitmap({
			spriteSheetManager: this.spriteSheetManager,
			namespace: "tactics",
			frameKey: "spawn",
			size: {
				width: this.size.width,
				height: this.size.height
			},
			visible: false
		});
		this.overlayType = TileOverlay.None;

		this.addChild(this.background);
		this.addChild(this.overlay);
	}

	setBackground(bg: Bitmap) {
		if (this.background != null) {
			this.removeChild(this.background);
		}
		this.background = bg;
		this.addChild(bg);
	}

	setBackgroundFrame(frame: string) {
		this.background.setFrame("tiles", frame);
	}

	setOverlay(overlayType: TileOverlay) {
		switch (overlayType) {
			case TileOverlay.None:
				this.overlay.show(false);
				break;
			case TileOverlay.Spawn:
				this.overlay.setFrame("tactics", "spawn");
				this.overlay.show(true);
				break;
			case TileOverlay.MoveTarget:
				this.overlay.setFrame("tactics", "target");
				this.overlay.show(true);
				break;
			case TileOverlay.MoveUp:
				this.overlay.setFrame("tactics", "moveUp");
				this.overlay.show(true);
				break;
			case TileOverlay.MoveDown:
				this.overlay.setFrame("tactics", "moveDown");
				this.overlay.show(true);
				break;
			case TileOverlay.MoveLeft:
				this.overlay.setFrame("tactics", "moveLeft");
				this.overlay.show(true);
				break;
			case TileOverlay.MoveRight:
				this.overlay.setFrame("tactics", "moveRight");
				this.overlay.show(true);
				break;
			case TileOverlay.Target:
				this.overlay.setFrame("tactics", "target");
				this.overlay.show(true);
				break;
		}
		this.overlayType = overlayType;
	}

	select() {
		switch (this.overlayType) {
			case TileOverlay.Spawn:
				if (this.isOccupied()) {
					this.overlay.setFrame("tactics", "spawnHighlightSelected");
				}
				else {
					this.overlay.setFrame("tactics", "spawnHighlight");
				}
				this.overlay.show(true);
				break;
		}
	}

	deselect() {
		switch (this.overlayType) {
			case TileOverlay.Spawn:
				if (this.isOccupied()) {
					this.overlay.show(false);
				}
				else {
					this.overlay.setFrame("tactics", "spawn");
				}
				break;
		}
	}

	isOccupied() {
		return this.occupant != null;
	}

	occupy(unit: Unit) {
		if (this.isOccupied()) {
			console.error(`Cannot occupy tile[${this.y}][${this.y}](x, y) : already occupied`);
			return;
		}
		this.occupant = unit;
		this.removeChild(this.overlay);
		this.addChild(unit);
		this.addChild(this.overlay);
	}

	vacate(): Unit {
		let ret = null;
		if (this.occupant != null) {
			ret = this.occupant;
			this.removeChild(this.occupant);
		}
		this.occupant = null;
		return ret;
	}
}