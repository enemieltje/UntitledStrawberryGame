class Stars extends GameObject
{
	constructor (sprite)
	{
		super([sprite]);
		this.sprite.x = viewport.x;
		this.sprite.y = viewport.x;
		this.sprite.scale.set(2);
	}

	static onLoad ()
	{
		super.onLoad(["stars.json"]);
	}

	static create ()
	{
		for (let i = 0; i < 4; i++)
		{
			const stars = new Stars(GameData.getSprite(`stars.json`)[i]);
			GameData.storeObject(stars, "stars");
		}
	}

	step (_delta)
	{

	}
}

Loader.objectTypes.push(Stars);
