class CamFollower extends PIXI.Sprite
{
	static name = "follower";
	soundFiles = [];
	constructor ()
	{
		const textures = GameData.getSprite(`planet.png`);
		super(textures[0]);
		// this.x = -32;
		// this.y = -32;
	}

	static onLoad ()
	{
		// super.onLoad([`${this.name}.png`]);
	}

	static create ()
	{
		GameData.storeObject(new CamFollower(), this.name);
	}
}

Loader.objectTypes.push(CamFollower);
