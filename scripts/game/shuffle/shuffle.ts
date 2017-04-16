import RGBA from '../../lib/rgba';
import * as Constants from '../../lib/constants';

class CellData
{
	id: number;
}

class ShuffleGameEng
{
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
	private height: number;
	private width: number;
	private depth: number;

	private cells: CellData[][][];
}
