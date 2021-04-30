class Loader
{
	spritesReady = false;
	soundsReady = false;
	ready = false;

	app;

	constructor (app)
	{
		this.app = app;
	}

	load ()
	{
		return new Promise((resolve) =>
		{
			this.loadSprites().then(() =>
			{
				if (this.soundsReady) resolve();
			});

			this.loadSounds().then(() =>
			{
				if (this.spritesReady) resolve();
			});
		});
	}

	loadSprites ()
	{
		console.log("Loading Sprites");
		return new Promise(resolve =>
		{
			this.app.loader
				.add("game/sprites/strawberry.png")
				.add("game/sprites/ready.png")
				.add("game/sprites/tileset.png")
				.load(() =>
				{
					this.createSprites();
					resolve();
				});
		});
	}

	loadSounds ()
	{
		return new Promise(resolve =>
		{
			sounds.load([
				"game/sounds/BeepBox-Song.mp3"
			]);

			sounds.onProgress = (progress, res) =>
			{
				console.log(progress + '% done');
				console.log('File ' + res.url + ' just finished loading.');
			};

			sounds.whenLoaded = () =>
			{
				this.spritesReady = true;
				resolve();
				this.init();
			};
		});
	}

	createSprites ()
	{
		console.log("Sprites finished loading");
		this.placeBackground(this.getTextureArray(3, 3, 64, 64));
		strawberry = new Strawberry();
		ready = new PIXI.Sprite(app.loader.resources["game/sprites/ready.png"].texture);
		this.spritesReady = true;
		this.init();
	}

	getTextureArray (setWidth, setHeight, imageWidth, imageHeight)
	{
		const textureArray = [];

		for (let y = 0; y < setHeight; y++)
		{
			textureArray.push([]);
			for (let x = 0; x < setWidth; x++)
			{
				textureArray[y].push(new PIXI.Rectangle(x * imageWidth, y * imageHeight, imageWidth, imageHeight));
			}
		}

		return textureArray;
	}

	placeBackground (backgroundArray)
	{
		const tileset = PIXI.utils.TextureCache["game/sprites/tileset.png"];

		const width = viewport.worldWidth / 64;
		const height = viewport.worldHeight / 64;

		backgroundObjects = [];

		for (let y = 0; y < height; y++)
		{
			for (let x = 0; x < width; x++)
			{
				const index = backgroundObjects.length;

				let indexX;
				let indexY;

				if (x == 0) indexX = 0;
				else if (x == width - 1) indexX = 2;
				else indexX = 1;

				if (y == 0) indexY = 0;
				else if (y == height - 1) indexY = 2;
				else indexY = 1;

				tileset.frame = backgroundArray[indexY][indexX];
				// const sprite = new PIXI.Sprite(tileset);
				backgroundObjects.push(new PIXI.Sprite(tileset));

				backgroundObjects[index].x = x * 64;
				backgroundObjects[index].y = y * 64;


				// viewport.addChild(backgroundObjects[index]);
			}
		}
		// tileset.frame = backgroundArray[0][0];
	}

	init ()
	{
		if (!this.spritesReady || !this.soundsReady) return;

		this.ready = true;

	}


}
