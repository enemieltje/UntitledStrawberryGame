class LinearParallax extends Parallax
{
	constructor (sprites, movementMultiplier, scale)
	{
		super();

		sprites.forEach((layerSprite, i) =>
		{
			this.layers.push(new LinearParallaxLayer(layerSprite, i * movementMultiplier, scale));
		});
	}
}
