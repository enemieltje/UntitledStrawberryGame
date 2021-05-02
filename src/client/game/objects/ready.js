class Ready extends GameObject
{
	constructor ()
	{
		super("ready");
	}

	onLoad ()
	{
		super.onLoad();
	}

	onCreate ()
	{
		super.onCreate();

		this.sprite.x = 32;
		this.sprite.y = 96;
	}
}
