class Planet extends GameObject
{
	static name = "planet";

	constructor ()
	{
		// super(Planet.name, {x: 1024, y: 1024, height: 128, width: 128});
		super(Planet.name, {x: 1024, y: 1024, radius: 32});
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

