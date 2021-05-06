class GameObject
{
	vis = [];
	sprite;
	sounds = [];
	name;
	id;
	currentImageName;
	#imageObject = {};

	#applyPhisics = false;

	chunks = [];
	collisionChunks = [];

	constructor (name, initialX = 64, initialY = 64, textures, hitBox)
	{
		// textures ? "" : textures = [app.loader.resources[`game/sprites/${name}.png`].texture];
		textures ? "" : textures = GameData.getSprite(`${name}.png`);

		this.name = name;

		this.sprite = new PIXI.AnimatedSprite(textures);

		hitBox ? "" : hitBox = new PIXI.Rectangle(0, 0, this.sprite.width, this.sprite.height);
		this.sprite.hitBox = hitBox;

		this.sprite.play();

		this.sprite.properties = {
			absorbtion: 1,
			static: true,
			drag: 0,
			mass: 1
		};

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

			const hitBox = GameData.getSpriteOffset(this.currentImageName);
			this.sprite.hitBox.x = -hitBox.x - this.sprite.anchor.x * this.sprite.width + this.sprite.x;
			this.sprite.hitBox.y = -hitBox.y - this.sprite.anchor.y * this.sprite.height + this.sprite.y;
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

		const cX = Math.round(this.sprite.hitBox.x / chunksize.x);
		const cY = Math.round(this.sprite.hitBox.y / chunksize.y);

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

		const candidateArray = [];
		collisionCandidates.forEach((candidate) =>
		{
			// candidateArray.push(candidate);

			// console.log(JSON.stringify(this.sprite.hitBox));

			const collision = bump.rectangleCollision(this.sprite.hitBox, candidate.sprite.hitBox, false, false);
			if (!collision.side || candidate.sprite.properties.static && this.sprite.properties.static) return;
			// console.log(`${this.name} ${candidate.name}`);
			let axis;

			// switch (collision.side)
			// {
			// 	case "left":
			// 	case "right":
			// 		axis = "vx";
			// 		break;
			// 	case "top":
			// 	case "bottom":
			// 		axis = "vy";
			// 		break;
			// }
			const v1 = this.sprite[axis];
			const v2 = candidate.sprite[axis];
			const m1 = this.sprite.properties.mass;
			const m2 = candidate.sprite.properties.mass;
			const absorbtion = candidate.sprite.properties.absorbtion * this.sprite.properties.absorbtion;

			if (candidate.sprite.properties.static)
			{
				switch (collision.side)
				{
					case "left":
						this.sprite.x = this.sprite.x + collision.overlapX;
						break;
					case "right":
						this.sprite.x = this.sprite.x - collision.overlapX;
						break;
					case "top":
						this.sprite.y = this.sprite.y + collision.overlapY;
						break;
					case "bottom":
						this.sprite.y = this.sprite.y - collision.overlapY;
						break;
				}
				this.sprite[collision.axis] *= -1;
				this.sprite[collision.axis] /= absorbtion;
			} else if (this.sprite.properties.static)
			{
				candidate.sprite[collision.axis] *= -1;
				candidate.sprite[collision.axis] /= absorbtion;
			} else
			{
				candidate.sprite[collision.axis] = (2 * m1) / (m1 + m2) * v1 - ((m1 - m2) / (m1 + m2)) * v2;
				candidate.sprite[collision.axis] /= absorbtion;

				this.sprite[collision.axis] = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m1) / (m1 + m2) * v2;
				this.sprite[collision.axis] /= absorbtion;
			}
		});
		// bump.hit(this.sprite, candidateArray, true, false, false, (side, otherObject) =>
		// {
		// 	if (otherObject.properties.static && this.sprite.properties.static) return;
		// 	let axis;

		// 	switch (side)
		// 	{
		// 		case "left":
		// 		case "right":
		// 			axis = "vx";
		// 			break;
		// 		case "top":
		// 		case "bottom":
		// 			axis = "vy";
		// 			break;
		// 	}
		// 	const v1 = this.sprite[axis];
		// 	const v2 = otherObject[axis];
		// 	const m1 = this.sprite.properties.mass;
		// 	const m2 = otherObject.properties.mass;
		// 	const absorbtion = otherObject.properties.absorbtion * this.sprite.properties.absorbtion;

		// 	if (otherObject.properties.static)
		// 	{
		// 		this.sprite[axis] *= -1;
		// 		this.sprite[axis] /= absorbtion;
		// 	} else if (this.sprite.properties.static)
		// 	{
		// 		otherObject[axis] *= -1;
		// 		otherObject[axis] /= absorbtion;
		// 	} else
		// 	{
		// 		otherObject[axis] = (2 * m1) / (m1 + m2) * v1 - ((m1 - m2) / (m1 + m2)) * v2;
		// 		otherObject[axis] /= absorbtion;

		// 		this.sprite[axis] = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m1) / (m1 + m2) * v2;
		// 		this.sprite[axis] /= absorbtion;
		// 	}
		// });
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
			this.sprite.x -= oldHitBox.x;
			this.sprite.y -= oldHitBox.y;
			this.sprite.x += hitBox.x;
			this.sprite.y += hitBox.y;
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
		return this.sprite.x - this.sprite.anchor.x * this.sprite.width;
	}

	absY ()
	{
		return this.sprite.y - this.sprite.anchor.y * this.sprite.height;
	}
}
