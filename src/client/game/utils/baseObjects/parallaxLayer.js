class LinearParallaxLayer
{
	texture;
	movement = 1;
	scale = 1;
	sprites = [];

	drawShapes = false;

	constructor (texture, movement, scale)
	{
		this.texture = texture;
		this.movement = movement;
		this.scale = scale;

		// create enough sprites to fill the screen
		const width = Math.ceil(viewport.worldScreenWidth / texture.width / scale) + 1;
		const height = Math.ceil(viewport.worldScreenHeight / texture.height / scale) + 1;
		for (let y = -height; y < height; y++)
		{
			for (let x = -width; x < width; x++)
			{
				const sprite = new PIXI.Sprite(texture);

				// store their position in the grid, so we know where to put it later
				sprite.xPos = x;
				sprite.yPos = y;

				this.sprites.push(sprite);
			}
		}
	}

	addToParent (parent = viewport)
	{
		this.sprites.forEach((sprite) =>
		{
			parent.addChild(sprite);
		});
	}

	removeFromParent (parent = viewport)
	{
		this.sprites.forEach((sprite) =>
		{
			parent.removeChild(sprite);
			sprite.destroy();
		});
	}

	deleteSprites ()
	{
		// this.sprites.forEach((sprite) =>
		// {
		// 	viewport.removeChild(sprite);
		// 	sprite.destroy();
		// });
		// this.sprites = [];
	}

	updatePostitions ()
	{
		// this.sprites.forEach((sprite) =>
		// {
		// 	// set a position in a grid
		// 	const xPos = sprite.xPos * sprite.width;
		// 	const yPos = sprite.yPos * sprite.height;

		// 	// get the viewport offset from the grid and multiply the movement with it
		// 	const xViewOffset = (viewport.corner.x * -this.movement) % sprite.width;
		// 	const yViewOffset = (viewport.corner.y * -this.movement) % sprite.height;

		// 	// set the spritePostition
		// 	sprite.x = xPos + viewport.corner.x + xViewOffset;
		// 	sprite.y = yPos + viewport.corner.y + yViewOffset;
		// });

		/*
		// get size of the grid squares
		const size = {
			x: this.texture.width * this.scale / viewport.scale.x,
			y: this.texture.height * this.scale / viewport.scale.y
		};

		// get properties of the rectangle that we need to draw squares for
		const r = {
			x: viewport.x / size.x,
			y: viewport.y / size.y,
			width: viewport.worldScreenWidth / size.x,
			height: viewport.worldScreenHeight / size.y,
			rotation: new Complex({arg: app.stage.rotation, abs: 1})
		};

		// get the four corners of this rectangle
		const rectPoints = [
			new Complex(r.x - 1, r.y - 1).div(r.rotation),
			new Complex(r.x + r.width, r.y - 1).div(r.rotation),
			new Complex(r.x - 1, r.y + r.height).div(r.rotation),
			new Complex(r.x + r.width, r.y + r.height).div(r.rotation)
		];

		// store their x and y components in a seperate array
		let xPoints = [];
		let yPoints = [];

		rectPoints.forEach(point =>
		{
			xPoints.push(point.re);
		});

		rectPoints.forEach(point =>
		{
			yPoints.push(point.im);
		});

		// get the min and max values
		const xMin = Math.floor(Math.min(...xPoints));
		const xMax = Math.floor(Math.max(...xPoints));
		const yMin = Math.floor(Math.min(...yPoints));
		const yMax = Math.floor(Math.max(...yPoints));

		// get the offset for this layer
		const offset = {
			x: (viewport.corner.x * this.movement) % size.x,
			y: (viewport.corner.y * this.movement) % size.y
		};

		// create all the sprites in that square
		for (let x = xMin - offset.x; x < xMax; x++)
		{
			for (let y = yMin - offset.y; y < yMax; y++)
			{
				const sprite = new PIXI.Sprite(this.texture);

				sprite.x = (x + offset.x) * size.x;
				sprite.y = (y + offset.y) * size.y;
				sprite.scale.set(this.scale);

				if (this.drawShapes) viewport.addChild(sprite);
				this.sprites.push(sprite);
			}
		}
		*/

		// get size of the images
		const size = {
			x: this.texture.width * this.scale / viewport.scale.x,
			y: this.texture.height * this.scale / viewport.scale.y
		};

		// place one at the viewport
		let x = 0, y = 0;

		// move it a bit depending on camera movement
		x += viewport.center.x * -this.movement / viewport.scale.x;
		y += viewport.center.y * -this.movement / viewport.scale.y;

		// move it back by whole imagesizes so it stays near the origin
		x = x % size.x;
		y = y % size.y;

		// move it to the viewport
		x += viewport.corner.x;
		y += viewport.corner.y;

		// set the positions of the sprites
		this.sprites.forEach((sprite) =>
		{
			sprite.x = x + sprite.xPos * size.x;
			sprite.y = y + sprite.yPos * size.y;
			sprite.scale.set(this.scale / viewport.scale.x);
		});
	}
}
