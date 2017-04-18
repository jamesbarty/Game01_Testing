import RGBA from '../../lib/rgba';
import * as Constants from '../../lib/constants';

class CellData
{
	// id 0 is reserved for the empty cell
	readonly id: number;
	constructor(id_new: number)
	{
		this.id = id_new;
	}
};

export default class ShuffleGameEng
{
	private static readonly DEBUGGING: boolean = true;

	// Defines a cuboid, subdivided into height*width*depth unit cubes.
	//
	// The ``origin'' vertex of the cuboid is (0,0,0).
	//  One edge goes from origin to (width, 0, 0)
	//  One edge goes from origin to (0, height, 0)
	//  One edge goes from origin to (0, 0, depth)
	// A sub-cube is identified by its vertex which has the minimal sum of coordinates
	//
	// The default view orientation: you are standing at (width/2, height/2, -1) facing
	//  toward the (0,0,1) direction. ``up'' is (0,-1,0). You see a face which is <width>
	//  wide and <height> tall. Behind this face are <depth>-1 more faces which are
	//  identical and currently invisible (assuming the cuboid is opaque).
	private readonly height: number;
	private readonly width: number;
	private readonly depth: number;

	// First subscript is x coordinate, then y, then z
	// i.e. first subscript (a) represents the plane of subcubes whose identifing vertex's x value == a
	//      second subscript (b) represents the line of subcubes whose identifying vertex's y value == b
	//      third subscript (c) represents the cube whose identifing vertex's z value == c
	private cells: CellData[][][];
	private emptyLoc: [number, number, number]; // x,y,z

	// returns true iff this is in a valid state
	private consistencyCheck()
	{
		if(this.emptyLoc[0] < 0 || this.emptyLoc[1] < 0 || this.emptyLoc[2] < 0)
		{ console.error("ERROR"); return false; }

		if(this.emptyLoc[0] >= this.width)
		{ console.error("ERROR"); return false; }

		if(this.emptyLoc[1] >= this.height)
		{ console.error("ERROR"); return false; }

		if(this.emptyLoc[2] >= this.depth)
		{ console.error("ERROR"); return false; }

		if(this.cells[this.emptyLoc[0]][this.emptyLoc[1]][this.emptyLoc[2]].id != 0)
		{ console.error("ERROR"); return false; }

		return true;
	}

	constructor(h: number, w: number, d: number)
	{
		if (!h || !w || !d || h < 1 || w < 1 || d < 1)
		{
			throw "Invalid construction parameters";
		}

		this.height = h;
		this.width = w;
		this.depth = d;

		this.cells = [];
		for(let x = 0; x < w; ++x)
		{
			this.cells.push([]);
			for(let y = 0; y < h; ++y)
			{
				this.cells[x].push([]);
				for(let z = 0; z < d; ++z)
				{
					this.cells[x][y].push(new CellData(x + y*w + z*w*h + 1001));
				}
			}
		}
		this.emptyLoc = [w-1, h-1, d-1];
		this.cells[w-1][h-1][d-1] = new CellData(0);
	}

	shuffle()
	{

	}

	////////////////////////////////////////////////////////////////////////////////////
	//
	// Movement methods. The direction represents the direction a block is to move.
	//   i.e. the opposite direction the empty cube is to move
	//
	////////////////////////////////////////////////////////////////////////////////////

	private reportMoveViolation()
	{
		console.warn("Illegal move");
	}

	/**
	 * Moves a block into the empty cell. Specify the direction the block is to move.
	 * i.e. The opposite direction the empty cell is to move
	 * @param axis 0=x axis, 1=y axis, 2=z axis
	 * @param dir -1=closer to the origin; +1=farther from the origin
	 * @returns @c true iff the move was completed successfully
	 */
	move(axis: number, dir: number): boolean
	{
		if(ShuffleGameEng.DEBUGGING)
		{
			let error = false;
			console.log("moveLeft");
			if(!(Number.isInteger(axis) && Number.isInteger(dir)))
			{
				console.error("Invalid movement parameters");
				error = true;
			}
			if(axis > 2 || axis < 0 || dir > 1 || dir < -1 || dir == 0)
			{
				console.error("Invalid axis");
				error = true;
			}
			if(!this.consistencyCheck())
			{
				console.error("!!! INTERNAL STATE ERROR !!!");
				error = true;
			}
			if(error)
			{
				return false;
			}
		}

		// check move validity
		const critCoord = this.emptyLoc[axis] - dir;
		let bound: number;
		if(axis == 0)
		{
			bound = this.width;
		}
		else if(axis == 1)
		{
			bound = this.height;
		}
		else if(axis == 2)
		{
			bound = this.depth;
		}

		if(critCoord < 0 || critCoord >= bound)
		{
			this.reportMoveViolation();
			return false;
		}

		// perform move
		const oldEmptyLoc = [this.emptyLoc[0], this.emptyLoc[1], this.emptyLoc[2]];
		this.emptyLoc[axis] -= dir;
		let tmp = this.cells[oldEmptyLoc[0]][oldEmptyLoc[1]][oldEmptyLoc[2]];
		this.cells[oldEmptyLoc[0]][oldEmptyLoc[1]][oldEmptyLoc[2]] = this.cells[this.emptyLoc[0]][this.emptyLoc[1]][this.emptyLoc[2]];
		this.cells[this.emptyLoc[0]][this.emptyLoc[1]][this.emptyLoc[2]] = tmp;
		return true;
	}

	toString()
	{
		this.consistencyCheck();

		let ret: String = "";
		for (let z = 0; z < this.depth; ++z)
		{
			ret += "Plane " + z.toString() + "\n";
			for (let y = 0; y < this.height; ++y)
			{
				for(let x = 0; x < this.width; ++x)
				{
					ret += this.cells[x][y][z].id.toString() + " ";
				}
				ret += "\n";
			}
		}
		ret += "emptyloc: " + this.emptyLoc.toString();
		return ret;
	}
}
