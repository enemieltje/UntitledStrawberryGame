class Block extends GameObject
{
	static name = "block";

	constructor (x, y)
	{
		super(Block.name, x, y);
		this.applyPhisics = true;
		// this.sprite.properties.mass = Math.pow(10, 100);
		// this.sprite.properties.mass = 0.001;
		// this.sprite.properties.static = false;
		// this.sprite = [];
	}

	static onLoad ()
	{
		super.onLoad([`${this.name}.png`]);
	}

	static create ()
	{
		gameObjects.block = [];

		const coords = [];
		for (let i = 0; i < 10; i++)
		{
			coords.push([i + 1, 4]);
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

		coords.forEach(coord =>
		{
			GameData.storeObject(new Block(coord[0] * 64, coord[1] * 64), this.name);
		});
	}
}
