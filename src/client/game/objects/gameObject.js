class GameObject
{
	vis = [];
	sprite;
	sounds = [];
	name;
	id;

	#applyPhisics = false;

	chunks = [];


	constructor (name, initialX = 64, initialY = 64, sprite)
	{
		sprite ? "" : sprite = app.loader.resources[`game/sprites/${name}.png`].texture;
		this.name = name;
		this.sprite = new PIXI.Sprite(sprite);

		this.sprite.mass = 1;

		this.sprite.ax = 0;
		this.sprite.ay = 0;

		this.sprite.vx = 0;
		this.sprite.vy = 0;

		this.sprite.x = initialX;
		this.sprite.y = initialY;
		// this.id = genId();
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

	// onCreate (name = this.name)
	// {
	// 	this.sprite = new PIXI.Sprite(app.loader.resources[`game/sprites/${name}.png`].texture);
	// }

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
			xCoords.add(Math.floor((this.absX()) / chunksize.x));
			xCoords.add(Math.floor((this.absX() + this.sprite.width) / chunksize.x));
			yCoords.add(Math.floor((this.absY()) / chunksize.y));
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
				// delete gameChunks[chunk.str()][this.id];
			});
			newChunks.forEach((newChunk) =>
			{
				GameData.putObjectInChunk(this.id, newChunk);
				// const chunk = gameChunks[newChunk.str()];
				// chunk ? chunk.add(this.id) : gameChunks[newChunk.str()] = new Set([this.id]);
			});
		}

		this.chunks = newChunks;

		this.vis.forEach((rect) =>
		{
			viewport.removeChild(rect);
		});

		this.vis = [];

		this.chunks.forEach((chunk) =>
		{
			const rect = new PIXI.Graphics();
			rect.lineStyle(4, 0xFF3300, 1);
			// rect.beginFill(0x66CCFF);
			rect.drawRect(0, 0, chunksize.x, chunksize.y);
			rect.endFill();
			rect.x = chunk.x * chunksize.x;
			rect.y = chunk.y * chunksize.y;
			this.vis.push(rect);
			viewport.addChild(rect);
		});
	}

	fixCollision ()
	{
		const collisionCandidates = new Set();

		this.chunks.forEach((chunkId) =>
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

			let v1 = 0;
			let v2 = 0;
			const m1 = this.sprite.mass;
			const m2 = otherObject.mass;

			switch (side)
			{
				case "left":
				case "right":
					v1 = this.sprite.vx;
					v2 = otherObject.vx;
					otherObject.vx = (2 * m1) / (m1 + m2) * v1 - ((m1 - m2) / (m1 + m2)) * v2;
					// otherObject.vx = ((m1 - m2) / (m1 + m2)) * v2 + (2 * m1) / (m1 + m2) * v1;

					this.sprite.vx = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m1) / (m1 + m2) * v2;

					// this.sprite.vx *= -1;
					// otherObject.vx *= -1;
					break;
				case "top":
				case "bottom":
					v1 = this.sprite.vy;
					v2 = otherObject.vy;
					otherObject.vy = (2 * m1) / (m1 + m2) * v1 - ((m1 - m2) / (m1 + m2)) * v2;

					console.log(`old vy: ${this.sprite.vy}`);
					this.sprite.vy = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m1) / (m1 + m2) * v2;
					console.log(`new vy: ${this.sprite.vy}`);
					// this.sprite.vy *= -1;
					// otherObject.vy *= -1;
					break;
			}
		});
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
