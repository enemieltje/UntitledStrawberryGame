class GravityObject extends StaticObject
{
	mass;
	atmosphereRadius;
	atmosphereDensity;
	parentBody;

	constructor (properties, textures)
	{
		super(properties, textures);
		this.mass = properties.mass || 1;
		this.atmosphereRadius = properties.atmosphereRadius || 0;
		this.atmosphereDensity = properties.atmosphereDensity || 0;
		this.parentBody = properties.parentBody;
		GameData.setGravityObject(this.id);
	}
}
