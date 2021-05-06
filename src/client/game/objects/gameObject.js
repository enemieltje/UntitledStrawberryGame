class GameObject
{
	vis = [];
	sprite;
	sounds = [];
	name;
	id;
	images = {};

	#applyPhisics = false;

	chunks = [];
	collisionChunks = [];

	constructor (name, initialX = 64, initialY = 64, texture, createSprite)
	{
		texture ? "" : texture = app.loader.resources[`game/sprites/${name}.png`].texture;
		this.name = name;

		createSprite ? this.sprite = createSprite() : this.sprite = new PIXI.Sprite(texture);

		this.sprite.properties = {
			absorbtion: 1,
			static: true,
			drag: 0,
			mass: 1
		};

		// this.sprite.mass = 1;

		this.sprite.ax = 0;
		this.sprite.ay = 0;

		this.sprite.vx = 0;
		this.sprite.vy = 0;

		this.sprite.x = initialX;
		this.sprite.y = initialY;
	}

	addToParent (parent = viewport)
	{
		parent.addChild(this.sprite);
	}

	removeFromParent (parent = viewport)
	{
		parent.removeChild(this.sprite);
	}

	static onLoad (sprites)
	{
		sprites.forEach((sprite) =>
		{
			console.log(`loading sprite: ${sprite}`);
			app.loader.add(`game/sprites/${sprite}.png`);
		});
	}

	static create ()
	{

	}

	set applyPhysics (applyPhysics)
	{
		this.#applyPhisics = applyPhysics;
		this.updateChunk();
	}

	get applyPhysics ()
	{
		return this.#applyPhisics;
	}

	step (delta = 1)
	{
		if (this.applyPhisics)
		{
			this.move(delta);
			this.updateChunk();
			this.fixCollision();
		}
	}

	move (delta)
	{
		if (this.sprite.properties.static) return;
		// console.log(`drag: ${this.sprite.properties.drag}, vx: ${this.sprite.vx}` +
		// 	`drag X: ${this.sprite.properties.drag * this.sprite.vx * delta}`);
		this.sprite.vx -= this.sprite.properties.drag * this.sprite.vx * delta;
		this.sprite.vy -= this.sprite.properties.drag * this.sprite.vy * delta;

		this.sprite.vx += this.sprite.ax * delta;
		this.sprite.vy += this.sprite.ay * delta;

		this.sprite.x += this.sprite.vx * delta;
		this.sprite.y += this.sprite.vy * delta;
	}

	updateChunk ()
	{
		const newChunks = [];

		if (this.applyPhisics)
		{
			const xCoords = new Set();
			const yCoords = new Set();
			xCoords.add(Math.floor(this.absX() / chunksize.x));
			xCoords.add(Math.floor((this.absX() + this.sprite.width) / chunksize.x));
			yCoords.add(Math.floor(this.absY() / chunksize.y));
			yCoords.add(Math.floor((this.absY() + this.sprite.height) / chunksize.y));

			xCoords.forEach((x) =>
			{
				yCoords.forEach((y) =>
				{
					newChunks.push(new Coord(x, y));
				});
			});
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

		const cX = Math.round(this.absX() / chunksize.x);
		const cY = Math.round(this.absY() / chunksize.y);

		this.collisionChunks.push(new Coord(cX, cY));
		this.collisionChunks.push(new Coord(cX - 1, cY));
		this.collisionChunks.push(new Coord(cX, cY - 1));
		this.collisionChunks.push(new Coord(cX - 1, cY - 1));

		this.vis.forEach((rect) =>
		{
			viewport.removeChild(rect);
		});

		this.vis = [];


		// this.chunks.forEach((chunk) =>
		// {
		// 	const rect = new PIXI.Graphics();
		// 	rect.lineStyle(4, 0xFF3300, 1);
		// 	rect.drawRect(0, 0, chunksize.x, chunksize.y);
		// 	rect.endFill();
		// 	rect.x = chunk.x * chunksize.x;
		// 	rect.y = chunk.y * chunksize.y;
		// 	this.vis.push(rect);
		// 	viewport.addChild(rect);
		// });

	}

	fixCollision ()
	{
		const collisionCandidates = new Set();

		this.collisionChunks.forEach((chunkId) =>
		{
			const objects = GameData.getObjectsInChunk(chunkId);

			if (!objects) return;

			objects.forEach((objectId) =>
			{
				if (objectId != this.id)
				{
					collisionCandidates.add(GameData.getObjectFromId(objectId).sprite);
				}
			});
		});

		if (collisionCandidates.size < 1) return;

		const candidateArray = [];
		collisionCandidates.forEach((candidate) =>
		{
			candidateArray.push(candidate);
		});
		bump.hit(this.sprite, candidateArray, true, false, false, (side, otherObject) =>
		{
			if (otherObject.properties.static && this.sprite.properties.static) return;
			let axis;

			switch (side)
			{
				case "left":
				case "right":
					axis = "vx";
					break;
				case "top":
				case "bottom":
					axis = "vy";
					break;
			}
			const v1 = this.sprite[axis];
			const v2 = otherObject[axis];
			const m1 = this.sprite.properties.mass;
			const m2 = otherObject.properties.mass;
			const absorbtion = otherObject.properties.absorbtion * this.sprite.properties.absorbtion;

			if (otherObject.properties.static)
			{
				this.sprite[axis] *= -1;
				this.sprite[axis] /= absorbtion;
			} else if (this.sprite.properties.static)
			{
				otherObject[axis] *= -1;
				otherObject[axis] /= absorbtion;
			} else
			{
				otherObject[axis] = (2 * m1) / (m1 + m2) * v1 - ((m1 - m2) / (m1 + m2)) * v2;
				otherObject[axis] /= absorbtion;

				this.sprite[axis] = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m1) / (m1 + m2) * v2;
				this.sprite[axis] /= absorbtion;
			}
		});
	}

	setImage (imageName)
	{

	}

	absX ()
	{
		return this.sprite.x - this.sprite.anchor.x * this.sprite.width;
	}

	absY ()
	{
		return this.sprite.y - this.sprite.anchor.y * this.sprite.height;
	}
}
