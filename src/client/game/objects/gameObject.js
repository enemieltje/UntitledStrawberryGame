class GameObject
{
	static soundFiles = [];

	sprite;
	name;
	id;
	currentImageName;

	applyPhisics = false;

	chunks = [];
	collisionChunks = [];

	spriteOffset = {x: 0, y: 0};
	rotation = 0;
	x = 0;
	y = 0;
	vx = 0;
	vy = 0;
	ax = 0;
	ay = 0;
	forces = {x: {}, y: {}};
	absorbtion = 1;
	bounce = true;
	static = true;
	drag = 0;
	mass = 1;
	width;
	height;
	radius;
	centerX;
	centerY;
	isSprite = true;

	constructor (name, properties, textures)
	{
		textures ? "" : textures = GameData.getSprite(`${name}.png`);

		this.name = name;

		this.sprite = new PIXI.AnimatedSprite(textures);

		this.sprite.play();

		Object.keys(properties).forEach((property) =>
		{
			this[property] = properties[property];
		});

		this.sprite.x = this.x;
		this.sprite.y = this.y;

		if (this.radius)
		{
			this.centerX = this.x + this.radius;
			this.centerY = this.y + this.radius;
		} else
		{
			this.centerX = this.x + this.width / 2;
			this.centerY = this.y + this.height / 2;
		}
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
			app.loader.add(`game/sprites/${sprite}`);
		});
	}

	static create ()
	{
		// const tileset = app.loader.resources[`game/sprites/background.json`].textures;
	}

	set applyPhysics (applyPhysics)
	{
		this.applyPhisics = applyPhysics;
		this.updateChunk();
	}

	get applyPhysics ()
	{
		return this.applyPhisics;
	}

	step (delta = 1)
	{
		if (this.applyPhisics)
		{
			this.move(delta);
			this.updateChunk();
			this.fixCollision();

			if (this.radius)
			{
				this.centerX = this.x + this.radius;
				this.centerY = this.y + this.radius;
			} else
			{
				this.centerX = this.x + this.width / 2;
				this.centerY = this.y + this.height / 2;
			}

			this.sprite.x = this.x + this.sprite.anchor.x * this.sprite.width + this.spriteOffset.x;
			this.sprite.y = this.y + this.sprite.anchor.y * this.sprite.height + this.spriteOffset.y;
			this.sprite.rotation = this.rotation;
		}
	}

	move (delta)
	{
		if (this.sprite.static) return;

		this.vx -= this.drag * this.vx * delta;
		this.vy -= this.drag * this.vy * delta;

		Object.keys(this.forces.x).forEach(forceXName =>
		{
			this.vx += this.forces.x[forceXName] * delta;
		});

		Object.keys(this.forces.y).forEach(forceYName =>
		{
			this.vy += this.forces.y[forceYName] * delta;
		});

		let resultAx = 0, resultAy = 0;

		// resultAx += this.relAx * Math.cos(this.rotation);
		// resultAx += this.relAy * Math.sin(this.rotation);
		// resultAy += this.relAx * Math.sin(this.rotation);
		// resultAy += this.relAy * Math.cos(this.rotation);

		this.vx += (this.ax + resultAx) * delta;
		this.vy += (this.ay + resultAy) * delta;

		this.x += this.vx * delta;
		this.y += this.vy * delta;
	}

	updateChunk ()
	{
		const newChunks = [];

		if (this.applyPhisics)
		{
			let xMin, xMax, yMin, yMax;

			if (this.radius)
			{
				xMin = Math.floor((this.x) / chunksize.x);
				xMax = Math.floor((this.x + this.radius * 2) / chunksize.x);
				yMin = Math.floor((this.y) / chunksize.y);
				yMax = Math.floor((this.y + this.radius * 2) / chunksize.y);
			} else
			{
				xMin = Math.floor(this.absX() / chunksize.x);
				xMax = Math.floor((this.absX() + this.width) / chunksize.x);
				yMin = Math.floor(this.absY() / chunksize.y);
				yMax = Math.floor((this.absY() + this.height) / chunksize.y);
			}

			for (let x = xMin; x <= xMax; x++)
			{
				for (let y = yMin; y <= yMax; y++)
				{
					newChunks.push(new Coord(x, y));
				}
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

		const cX = Math.round(this.x / chunksize.x);
		const cY = Math.round(this.y / chunksize.y);

		this.collisionChunks.push(new Coord(cX, cY));
		this.collisionChunks.push(new Coord(cX - 1, cY));
		this.collisionChunks.push(new Coord(cX, cY - 1));
		this.collisionChunks.push(new Coord(cX - 1, cY - 1));
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
					const candidate = GameData.getObjectFromId(objectId);
					collisionCandidates.add(candidate);
				}
			});
		});

		if (collisionCandidates.size < 1) return;

		collisionCandidates.forEach((candidate) =>
		{
			bump.hit(this, candidate, true, this.bounce);
		});
	}

	set image (imageName)
	{
		if (this.currentImageName != imageName)
		{
			const image = GameData.getSprite(imageName);
			if (!image)
			{
				console.log(`${imageName} is not a valid image`);
				return;
			}

			this.spriteOffset = GameData.getSpriteOffset(imageName);

			this.sprite.textures = image;
			this.sprite.play();
			this.currentImageName = imageName;
		}
	}

	get image ()
	{
		return this.currentImageName;
	}

	set relAx (relAx)
	{
		this.ax = relAx * Math.cos(this.rotation) + this.relAx * Math.sin(this.rotation);
		this.ay = relAx * Math.sin(this.rotation) + this.relAy * Math.cos(this.rotation);
	}

	get relAx ()
	{
		return this.ax * Math.cos(this.rotation) + this.ay * Math.sin(this.rotation);
	}

	set relAy (relAy)
	{
		this.ax = relAy * Math.sin(this.rotation) + this.relAx * Math.cos(this.rotation);
		this.ay = relAy * Math.cos(this.rotation) + this.relAy * Math.sin(this.rotation);
	}

	get relAy ()
	{
		return this.ax * Math.sin(this.rotation) + this.ay * Math.cos(this.rotation);
	}




	set relVx (relVx)
	{
		this.vx = relVx * Math.cos(this.rotation) + this.relVx * Math.sin(this.rotation);
		this.vy = relVx * Math.sin(this.rotation) + this.relVx * Math.cos(this.rotation);
	}

	get relVx ()
	{
		return this.vx * Math.cos(this.rotation) + this.vy * Math.sin(this.rotation);
	}

	set relVy (relVy)
	{
		this.vx = relVy * Math.sin(this.rotation) + this.relVx * Math.cos(this.rotation);
		this.vy = relVy * Math.cos(this.rotation) + this.relVx * Math.sin(this.rotation);
	}

	get relVy ()
	{
		return this.vx * Math.sin(this.rotation) + this.vy * Math.cos(this.rotation);
	}

	absX ()
	{
		const returnValue = this.width || this.radius;
		return this.x - this.sprite.anchor.x * returnValue;
	}

	absY ()
	{
		const returnValue = this.height || this.radius;
		return this.y - this.sprite.anchor.y * returnValue;
	}
}
