class Block extends StaticObject
{
	static name = "block";

	constructor (x, y)
	{
		// super(Block.name, {x: x, y: y, height: 64, width: 64});
		super({pos: new Complex(x, y), height: 64, width: 64}, "block.png");
		// this.applyPhisics = true;
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

Loader.objectTypes.push(Block);
