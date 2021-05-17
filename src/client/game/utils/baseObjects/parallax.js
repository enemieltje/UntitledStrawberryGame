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
			layer.addToParent(parent);
		});
	}

	removeFromParent (parent = viewport)
	{
		this.layers.forEach((layer) =>
		{
			layer.removeFromParent(parent);
		});
	}

	step ()
	{
		this.layers.forEach((layer) =>
		{
			// layer.deleteSprites();
			// if (layer.drawShapes)
			layer.updatePostitions();
		});
	}
}
