class Block extends GameObject
{
	constructor ()
	{
		super("block");
		this.sprite = [];
	}

	onLoad ()
	{
		super.onLoad();
	}

	onCreate ()
	{
		const coords = [];
		for (let i = 0; i < 10; i++)
		{
			coords.push([i + 1, 4]);
			// this.createBlock(64 * i + 64, 256);
		}

		coords.push(
			[12, 6],
			[13, 6],
			[15, 3],
			[15, 4],
			[15, 5],
			[15, 6],
			[16, 6],
		);
		this.createBlockArray(coords);
	}

	createBlock (x, y)
	{
		const pixiSprite = new PIXI.Sprite(app.loader.resources[`game/sprites/${this.name}.png`].texture);
		pixiSprite.x = x * pixiSprite.width;
		pixiSprite.y = y * pixiSprite.height;
		this.sprite.push(pixiSprite);
	}

	createBlockArray (coords)
	{
		coords.forEach(coord =>
		{
			this.createBlock(coord[0], coord[1]);
		});
	}
}
