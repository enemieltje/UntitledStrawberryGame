class GameObject
{
	vis = [];
	sprite;
	sounds = [];
	name;
	id;
	currentImageName;

	#applyPhisics = false;

	chunks = [];
	collisionChunks = [];

	spriteOffset = {x: 0, y: 0};
	x = 0;
	y = 0;
	vx = 0;
	vy = 0;
	ax = 0;
	ay = 0;
	absorbtion = 1;
	static = true;
	drag = 0;
	mass = 1;
	width;
	height;
	radius;
	isSprite = true;

	constructor (name, properties, textures)
	{
		// textures ? "" : textures = [app.loader.resources[`game/sprites/${name}.png`].texture];
		textures ? "" : textures = GameData.getSprite(`${name}.png`);

		this.name = name;

		this.sprite = new PIXI.AnimatedSprite(textures);

		// hitBox ? "" : hitBox = new PIXI.Rectangle(0, 0, this.sprite.width, this.sprite.height);
		// this.sprite.hitBox = hitBox;

		this.sprite.play();

		Object.keys(properties).forEach((property) =>
		{
			this[property] = properties[property];
		});

		this.sprite.x = this.x;
		this.sprite.y = this.y;

		// this.sprite.properties = {
		// 	absorbtion: 1,
		// 	static: true,
		// 	drag: 0,
		// 	mass: 1
		// };

		// this.sprite.ax = 0;
		// this.sprite.ay = 0;

		// this.sprite.vx = 0;
		// this.sprite.vy = 0;

		// this.sprite.x = initialX;
		// this.sprite.y = initialY;
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
			// GameData.addSpriteName(sprite)
		});
	}

	static create ()
	{
		// const tileset = app.loader.resources[`game/sprites/background.json`].textures;
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

			// const hitBox = GameData.getSpriteOffset(this.currentImageName);
			// this.sprite.hitBox.x = -hitBox.x - this.sprite.anchor.x * this.sprite.width + this.sprite.x;
			// this.sprite.hitBox.y = -hitBox.y - this.sprite.anchor.y * this.sprite.height + this.sprite.y;

			this.sprite.x = this.x + this.sprite.anchor.x * this.sprite.width + this.spriteOffset.x;
			this.sprite.y = this.y + this.sprite.anchor.y * this.sprite.height + this.spriteOffset.y;
		}
	}

	move (delta)
	{
		if (this.sprite.static) return;

		// this.sprite.vx -= this.sprite.properties.drag * this.sprite.vx * delta;
		// this.sprite.vy -= this.sprite.properties.drag * this.sprite.vy * delta;

		// this.sprite.vx += this.sprite.ax * delta;
		// this.sprite.vy += this.sprite.ay * delta;

		// this.sprite.x += this.sprite.vx * delta;
		// this.sprite.y += this.sprite.vy * delta;

		this.vx -= this.drag * this.vx * delta;
		this.vy -= this.drag * this.vy * delta;

		this.vx += this.ax * delta;
		this.vy += this.ay * delta;

		this.x += this.vx * delta;
		this.y += this.vy * delta;
	}

	updateChunk ()
	{
		const newChunks = [];

		if (this.applyPhisics)
		{
			const xCoords = new Set();
			const yCoords = new Set();
			// xCoords.add(Math.floor(this.absX() / chunksize.x));
			// xCoords.add(Math.floor((this.absX() + this.sprite.width) / chunksize.x));
			// yCoords.add(Math.floor(this.absY() / chunksize.y));
			// yCoords.add(Math.floor((this.absY() + this.sprite.height) / chunksize.y));
			xCoords.add(Math.floor(this.absX() / chunksize.x));
			xCoords.add(Math.floor((this.absX() + this.width) / chunksize.x));
			yCoords.add(Math.floor(this.absY() / chunksize.y));
			yCoords.add(Math.floor((this.absY() + this.height) / chunksize.y));

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

		// const cX = Math.round(this.sprite.hitBox.x / chunksize.x);
		// const cY = Math.round(this.sprite.hitBox.y / chunksize.y);
		const cX = Math.round(this.x / chunksize.x);
		const cY = Math.round(this.y / chunksize.y);

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
					collisionCandidates.add(GameData.getObjectFromId(objectId));
				}
			});
		});

		if (collisionCandidates.size < 1) return;

		collisionCandidates.forEach((candidate) =>
		{
			// candidateArray.push(candidate);

			bump.hit(this, candidate, true, true);
			// const collision = bump.hit(this.sprite.hitBox, candidate.sprite.hitBox, true, false);
			// if (!(collision.side || collision.region) || candidate.sprite.properties.static && this.sprite.properties.static) return;
			// // console.log(`${this.name} ${candidate.name}`);
			// // console.log(collision);
			// let axis;

			// const v1 = this.sprite[axis];
			// const v2 = candidate.sprite[axis];
			// const m1 = this.sprite.properties.mass;
			// const m2 = candidate.sprite.properties.mass;
			// const absorbtion = candidate.sprite.properties.absorbtion * this.sprite.properties.absorbtion;

			// if (candidate.sprite.properties.static)
			// {
			// 	if (collision.side)
			// 	{
			// 		switch (collision.side)
			// 		{
			// 			case "left":
			// 				this.sprite.x = this.sprite.x + collision.overlapX;
			// 				break;
			// 			case "right":
			// 				this.sprite.x = this.sprite.x - collision.overlapX;
			// 				break;
			// 			case "top":
			// 				this.sprite.y = this.sprite.y + collision.overlapY;
			// 				break;
			// 			case "bottom":
			// 				this.sprite.y = this.sprite.y - collision.overlapY;
			// 				break;
			// 		}
			// 		this.sprite[collision.axis] *= -1;
			// 		this.sprite[collision.axis] /= absorbtion;
			// 	} else if (collision.region)
			// 	{
			// 		switch (collision.region)
			// 		{
			// 			case "topLeft":
			// 				this.sprite.x = collision.r1x;
			// 				this.sprite.y = collision.r1y;
			// 				break;

			// 			case "topRight":
			// 				point.x = collision.r1x + r1.width;
			// 				point.y = collision.r1y;
			// 				break;

			// 			case "bottomLeft":
			// 				point.x = collision.r1x;
			// 				point.y = collision.r1y + r1.height;
			// 				break;

			// 			case "bottomRight":
			// 				point.x = collision.r1x + r1.width;
			// 				point.y = collision.r1y + r1.height;
			// 		}
			// 	}
			// } else if (this.sprite.properties.static)
			// {
			// 	candidate.sprite[collision.axis] *= -1;
			// 	candidate.sprite[collision.axis] /= absorbtion;
			// } else
			// {
			// 	candidate.sprite[collision.axis] = (2 * m1) / (m1 + m2) * v1 - ((m1 - m2) / (m1 + m2)) * v2;
			// 	candidate.sprite[collision.axis] /= absorbtion;

			// 	this.sprite[collision.axis] = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m1) / (m1 + m2) * v2;
			// 	this.sprite[collision.axis] /= absorbtion;
			// }
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
			const oldHitBox = GameData.getSpriteOffset(this.currentImageName);
			const hitBox = GameData.getSpriteOffset(imageName);

			this.spriteOffset = GameData.getSpriteOffset(imageName);
			// this.sprite.x -= oldHitBox.x;
			// this.sprite.y -= oldHitBox.y;
			// this.sprite.x += hitBox.x;
			// this.sprite.y += hitBox.y;
			// this.x -= oldHitBox.x;
			// this.y -= oldHitBox.y;
			// this.x += hitBox.x;
			// this.y += hitBox.y;
			this.sprite.textures = image;
			this.sprite.play();
			this.currentImageName = imageName;
		}
	}

	get image ()
	{
		return this.currentImageName;
	}

	absX ()
	{
		// return this.sprite.x - this.sprite.anchor.x * this.sprite.width;
		return this.x - this.sprite.anchor.x * this.width;
	}

	absY ()
	{
		// return this.sprite.y - this.sprite.anchor.y * this.sprite.height;
		return this.y - this.sprite.anchor.y * this.height;
	}
}
