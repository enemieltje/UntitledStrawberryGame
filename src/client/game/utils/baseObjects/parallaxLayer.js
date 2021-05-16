class LinearParallaxLayer
{
	movement = 1;
	sprites = [];

	constructor (texture, movement, scale = 1)
	{
		console.log(texture);
		this.movement = movement;

		// create enough sprites to fill the screen
		const width = Math.ceil(viewport.worldScreenWidth / texture.width / scale) + 1;
		const height = Math.ceil(viewport.worldScreenHeight / texture.height / scale) + 1;
		for (let y = 0; y < height; y++)
		{
			for (let x = 0; x < width; x++)
			{
				const sprite = new PIXI.Sprite(texture);
				sprite.scale.set(scale);

				// store their position in the grid, so we know where to put it later
				sprite.xPos = x;
				sprite.yPos = y;

				this.sprites.push(sprite);
			}
		}
	}

	updatePostitions ()
	{
		this.sprites.forEach((sprite) =>
		{
			// set a position in a grid
			const xPos = sprite.xPos * sprite.width;
			const yPos = sprite.yPos * sprite.height;

			// get the viewport offset from the grid and multiply the movement with it
			const xViewOffset = (viewport.corner.x * -this.movement) % sprite.width;
			const yViewOffset = (viewport.corner.y * -this.movement) % sprite.height;

			// set the spritePostition
			sprite.x = xPos + viewport.corner.x + xViewOffset;
			sprite.y = yPos + viewport.corner.y + yViewOffset;
		});
	}
}
