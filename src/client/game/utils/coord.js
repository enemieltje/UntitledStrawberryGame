class Coord
{
	x;
	y;

	constructor (x, y)
	{
		this.x = x;
		this.y = y;
	}

	str ()
	{
		return `${this.x};${this.y}`;
	}

	static fromString (string)
	{
		const coord = string.split(";");
		return new Coord(coord[0], coord[1]);
	}
}
