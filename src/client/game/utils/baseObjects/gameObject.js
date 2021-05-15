class GameObject
{
	sprite;
	id = GameData.genId();

	currentImageName;
	spriteOffset = new Complex(0, 0);

	constructor (textures)
	{
		if (typeof textures == "string")
			textures = GameData.getSprite(textures);
		// console.log(textures);

		this.sprite = new PIXI.AnimatedSprite(textures);

		this.sprite.play();
	}

	addToParent (parent = viewport)
	{
		parent.addChild(this.sprite);
	}

	removeFromParent (parent = viewport)
	{
		parent.removeChild(this.sprite);
	}

	static onLoad (sprites)
	{
		sprites.forEach((sprite) =>
		{
			console.log(`loading sprite: ${sprite}`);
			app.loader.add(`game/sprites/${sprite}`);
		});
	}

	static create () {}

	set image (imageName)
	{
		if (this.currentImageName != imageName)
		{
			const image = GameData.getSprite(imageName);
			if (!image)
			{
				console.log(`${imageName} is not a valid image`);
				return;
			}

			this.spriteOffset = GameData.getSpriteOffset(imageName);

			this.sprite.textures = image;
			this.sprite.play();
			this.currentImageName = imageName;
		}
	}

	get image ()
	{
		return this.currentImageName;
	}
}
