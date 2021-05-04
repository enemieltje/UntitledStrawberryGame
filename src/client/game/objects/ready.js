class Ready extends GameObject
{
	static name = "ready";
	constructor ()
	{
		super(Ready.name, 32, 96);
	}

	static onLoad ()
	{
		super.onLoad([this.name]);
	}

	static create ()
	{
		GameData.storeObject(new Ready(), this.name);
		// gameObjects.ready = new Ready();
	}

	onCreate ()
	{
		super.onCreate();

		this.sprite.x = 32;
		this.sprite.y = 96;
	}
}
