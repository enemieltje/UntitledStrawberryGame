class GameObject
{
	name;
	sprite;
	sounds = [];

	constructor (name)
	{
		this.name = name;
	}

	onLoad ()
	{
		app.loader.add(`game/sprites/${this.name}.png`);
	}

	onCreate ()
	{
		this.sprite = new PIXI.Sprite(app.loader.resources[`game/sprites/${this.name}.png`].texture);
	}

	step ()
	{

	}

}
