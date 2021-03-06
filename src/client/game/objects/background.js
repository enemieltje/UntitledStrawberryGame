class Background extends GameObject
{
	static name = "background";
	constructor (x, y, sprite)
	{
		super([sprite]);
		this.sprite.x = x;
		this.sprite.y = y;
	}

	static onLoad ()
	{
		super.onLoad(["background.json"]);
	}

	static create ()
	{
		gameObjects.background = [];

		// const width = viewport.worldWidth / 64;
		// const height = viewport.worldHeight / 64;
		const width = 4;
		const height = 4;

		for (let y = 0; y < height; y++)
		{
			for (let x = 0; x < width; x++)
			{
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

				const bg = new Background(x * 64, y * 64, GameData.getSprite(`background.json`)[bgIndex]);
				GameData.storeObject(bg, this.name);
			}
		}
	}
}

Loader.objectTypes.push(Background);
