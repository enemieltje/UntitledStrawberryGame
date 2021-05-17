class StaticObject extends GameObject
{
	pos = new Complex(0, 0);
	center = new Complex(0, 0);
	rotation = new Complex(1, 0);

	chunks = [];
	collisionChunks = [];

	width;
	height;
	radius;
	_distance;
	parentBody;
	isSprite = true;

	constructor (properties, textures)
	{
		super(textures);

		Object.keys(properties).forEach((property) =>
		{
			this[property] = properties[property];
		});

		let center;
		if (this.radius)
		{
			center = new Complex(this.radius, this.radius);
		} else
		{
			center = new Complex(this.width / 2, this.height / 2);
		}
		this.center = this.pos.add(center);

		this.updateChunk();
		this.updateSprite();
	}

	get x ()
	{
		return this.pos.re;
	}

	set x (x)
	{
		this.pos.re = x;
	}

	get y ()
	{
		return this.pos.im;
	}

	set y (y)
	{
		this.pos.im = y;
	}

	get vx ()
	{
		return 0;
	}

	get vy ()
	{
		return 0;
	}

	get altitude ()
	{
		return this.distance - this.parentBody.radius;
	}

	set altitude (altitude)
	{
		this.distance = altitude + this.parentBody.radius;
	}

	get distance ()
	{
		return this._distance;
	}

	set distance (distance)
	{
		if (!this.parentBody) return;

		// get a vector from the parent Body to this
		const relPos = this.pos.sub(this.parentBody.center);

		// create a new vector in the same direction, but with length distance
		const newPos = new Complex({abs: distance, arg: relPos.arg()});

		// add the parent body again to make it absolute coords and set the position
		this.pos = newPos.add(this.parentBody.center);
	}

	updateSprite ()
	{
		let center;
		if (this.radius)
		{
			center = new Complex(this.radius, this.radius);
		} else
		{
			center = new Complex(this.width / 2, this.height / 2);
		}
		this.center = this.pos.add(center);

		const anchor = new Complex(
			this.sprite.anchor.x * (this.sprite.radius * 2 || this.sprite.width),
			this.sprite.anchor.y * (this.sprite.radius * 2 || this.sprite.height));

		const spritePos = anchor.add(this.spriteOffset).sub(center).mul(this.rotation).add(center).add(this.pos);

		this.sprite.x = spritePos.re;
		this.sprite.y = spritePos.im;

		this.sprite.rotation = this.rotation.arg();
	}

	updateChunk ()
	{
		if (!this.id) return;
		const newChunks = [];

		const diagonal = this.center.sub(this.pos).mul(2);
		const max = this.pos.add(diagonal);
		const min = this.pos;



		for (let x = Math.floor(min.re / chunksize.x); x <= Math.floor(max.re / chunksize.x); x++)
		{
			for (let y = Math.floor(min.im / chunksize.y); y <= Math.floor(max.im / chunksize.y); y++)
			{
				newChunks.push(new Coord(x, y));
			}
		}


		if (newChunks.toString() != this.chunks.toString())
		{
			this.chunks.forEach((chunk) =>
			{
				GameData.removeObjectFromChunk(this.id, chunk);
			});
			newChunks.forEach((newChunk) =>
			{
				GameData.putObjectInChunk(this.id, newChunk);
			});
		}

		this.chunks = newChunks;
		this.collisionChunks = [];

		const cX = Math.round(this.pos.re / chunksize.x);
		const cY = Math.round(this.pos.im / chunksize.y);

		this.collisionChunks.push(new Coord(cX, cY));
		this.collisionChunks.push(new Coord(cX - 1, cY));
		this.collisionChunks.push(new Coord(cX, cY - 1));
		this.collisionChunks.push(new Coord(cX - 1, cY - 1));
	}

}
