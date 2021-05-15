class Ready extends GameObject
{
	static name = "ready";
	constructor ()
	{
		super("ready.png");
		this.sprite.x = 32;
		this.sprite.y = 96;
	}

	static onLoad ()
	{
		super.onLoad([`${this.name}.png`]);
	}

	static create ()
	{
		GameData.storeObject(new Ready(), this.name);
	}

	onCreate ()
	{
		super.onCreate();

		this.sprite.x = 32;
		this.sprite.y = 96;
	}
}

Loader.objectTypes.push(Ready);
