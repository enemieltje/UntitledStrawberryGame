class Planet extends GameObject
{
	static name = "planet";

	constructor ()
	{
		super(Planet.name, 1024, 1024, false, new PIXI.Circle(0, 0, 256));
		this.applyPhisics = true;
	}

	static onLoad ()
	{
		super.onLoad([`${this.name}.png`]);
	}

	static create ()
	{
		GameData.storeObject(new Planet(), this.name);
	}
}

Loader.objectTypes.push(Planet);

