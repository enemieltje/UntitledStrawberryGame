class Parallax
{
	layers = [];

	constructor ()
	{
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

	addToParent (parent = viewport)
	{
		this.layers.forEach((layer) =>
		{
			layer.sprites.forEach((sprite) =>
			{
				parent.addChild(sprite);
			});
		});
	}

	removeFromParent (parent = viewport)
	{
		this.layers.forEach((layer) =>
		{
			layer.sprites.forEach((sprite) =>
			{
				parent.removeChild(sprite);
			});
		});
	}

	step ()
	{
		this.layers.forEach((layer) =>
		{
			layer.updatePostitions();
		});
	}
}
