class Background extends GameObject
{
	constructor ()
	{
		super("background");
		this.sprite = [];
	}

	onLoad ()
	{
		app.loader.add(`game/sprites/${this.name}.json`);
	}

	onCreate ()
	{
		const tileset = app.loader.resources[`game/sprites/${this.name}.json`].textures;

		const width = viewport.worldWidth / 64;
		const height = viewport.worldHeight / 64;

		for (let y = 0; y < height; y++)
		{
			for (let x = 0; x < width; x++)
			{
				const index = this.sprite.length;
				let bgIndex = 0;

				if (x == 0)
				{
					if (y == 0) bgIndex = 0;
					else if (y == height - 1) bgIndex = 6;
					else bgIndex = 3;
				}
				else if (x == width - 1)
				{
					if (y == 0) bgIndex = 2;
					else if (y == height - 1) bgIndex = 8;
					else bgIndex = 5;
				}
				else
				{
					if (y == 0) bgIndex = 1;
					else if (y == height - 1) bgIndex = 7;
					else bgIndex = 4;
				}
				this.sprite.push(new PIXI.Sprite(tileset[`bg${bgIndex}.png`]));

				this.sprite[index].x = x * 64;
				this.sprite[index].y = y * 64;

			}
		}
	}
}
