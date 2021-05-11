class Planet extends GameObject
{
	static name = "planet";
	gravityProperties;

	constructor ()
	{
		// const properties = {x: 1024, y: 1024, height: 128, width: 128};
		const properties = {x: 1024, y: 1024, radius: 8000, mass: 1000000};
		super(Planet.name, properties);
		this.applyPhisics = true;
		// this.x = 1024 - this.radius;
	}

	drawShape ()
	{
		const circle = new PIXI.Graphics();
		circle.beginFill(0x9966FF);
		circle.drawCircle(this.x + this.radius, this.y + this.radius, this.radius);
		circle.endFill();
		viewport.addChild(circle);
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

