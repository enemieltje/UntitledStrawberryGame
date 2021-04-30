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
				console.log('Total ' + progress + ' file(s) loaded.');
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
		strawberry = new Strawberry();
		ready = new PIXI.Sprite(app.loader.resources["game/sprites/ready.png"].texture);
		this.spritesReady = true;
		this.init();
	}

	init ()
	{
		if (!this.spritesReady || !this.soundsReady) return;

		this.ready = true;

	}


}
