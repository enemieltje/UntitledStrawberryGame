/*

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
	rotation = Complex.ONE;
	x = 0;
	y = 0;
	vx = 0;
	vy = 0;
	ax = 0;
	ay = 0;
	relForces = {};
	forces = {};
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

	static create () {}

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

			const absPos = new Complex(
				this.x,
				this.y);

			const anchor = new Complex(
				this.sprite.anchor.x * (this.sprite.radius * 2 || this.sprite.width),
				this.sprite.anchor.y * (this.sprite.radius * 2 || this.sprite.height));

			const offset = new Complex(this.spriteOffset.x, this.spriteOffset.y);

			const center = new Complex(this.centerX - this.x, this.centerY - this.y);

			const spritePos = anchor.add(offset).sub(center).mul(this.rotation).add(center).add(absPos);

			this.sprite.x = spritePos.re;
			this.sprite.y = spritePos.im;

			this.sprite.rotation = this.rotation.arg();
		}
	}

	move (delta)
	{
		if (this.sprite.static) return;

		this.vx -= this.drag * this.vx * delta;
		this.vy -= this.drag * this.vy * delta;

		Object.keys(this.forces).forEach(forceName =>
		{
			this.vx += this.forces[forceName].x * delta;
			this.vy += this.forces[forceName].y * delta;
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			const relF = this.relForces[forceName];
			const absF = new Complex(relF.x, relF.y).mul(this.rotation).div(this.mass);

			this.vx += absF.re * delta;
			this.vy += absF.im * delta;
		});

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
		const absA = new Complex(relAx, this.relAy).mul(this.rotation);
		this.ax = absA.re;
		this.ay = absA.im;
	}

	get relAx ()
	{
		return new Complex(this.ax, this.ay).div(this.rotation).re;
	}

	set relAy (relAy)
	{
		const absA = new Complex(this.relAx, relAy).mul(this.rotation);
		this.ax = absA.re;
		this.ay = absA.im;
	}

	get relAy ()
	{
		return new Complex(this.ax, this.ay).div(this.rotation).im;
	}


	set relVx (relVx)
	{
		const absV = new Complex(relVx, this.relVy).mul(this.rotation);
		this.vx = absV.re;
		this.vy = absV.im;
	}

	get relVx ()
	{
		return new Complex(this.vx, this.vy).div(this.rotation).re;
	}

	set relVy (relVy)
	{
		const absV = new Complex(this.relVx, relVy).mul(this.rotation);
		this.vx = absV.re;
		this.vy = absV.im;
	}

	get relVy ()
	{
		return new Complex(this.vx, this.vy).div(this.rotation).im;
	}

	getAbsA ()
	{
		let a = new Complex(this.ax, this.ay);

		Object.keys(this.forces).forEach(forceName =>
		{
			const absF = this.relForces[forceName];
			const absA = new Complex(absF.x, absF.y);
			a = a.add(absA);
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			const relF = this.relForces[forceName];
			const absA = new Complex(relF.x, relF.y).mul(this.rotation).div(this.mass);

			a = a.add(absA);
		});
		return a;
	}

	getRelA ()
	{
		let a = new Complex(this.ax, this.ay);

		Object.keys(this.forces).forEach(forceName =>
		{
			const absF = this.relForces[forceName];
			const relA = new Complex(absF.x, absF.y).div(this.rotation).div(this.mass);
			a = a.add(relA);
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			const relF = this.relForces[forceName];
			const relA = new Complex(relF.x, relF.y).div(this.mass);

			a = a.add(relA);
		});
		return a;
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
*/
