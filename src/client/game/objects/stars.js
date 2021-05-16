class Stars extends LinearParallax
{
	constructor (sprites)
	{
		super(sprites, 0.01, 1);
	}

	static onLoad ()
	{
		super.onLoad(["stars.json"]);
	}

	static create ()
	{
		// for (let i = 0; i < 4; i++)
		// {
		const stars = new Stars(GameData.getSprite(`stars.json`));
		GameData.storeObject(stars, "stars");
		// }
	}
}

Loader.objectTypes.push(Stars);
