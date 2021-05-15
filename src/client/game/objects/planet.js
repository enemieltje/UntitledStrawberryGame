class Melon extends GravityObject
{
	static name = "planet";
	gravityProperties;

	constructor ()
	{
		const properties = {
			pos: new Complex(1024, 1024),
			radius: 8000,
			mass: 10000000,
			atmosphereRadius: 9000,
			atmosphereDensity: 1
		};
		super(properties, `planet.png`);
		// this.applyPhisics = true;
	}

	drawShape ()
	{
		const circle = new PIXI.Graphics();
		circle.beginFill(0x9966FF);
		circle.drawCircle(this.center.re, this.center.im, this.radius);
		circle.endFill();
		viewport.addChild(circle);
	}

	static onLoad ()
	{
		super.onLoad([`${this.name}.png`]);
	}

	static create ()
	{
		GameData.storeObject(new Melon(), this.name);
	}
}

Loader.objectTypes.push(Melon);

