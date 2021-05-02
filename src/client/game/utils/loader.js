class Loader
{
	spritesReady = false;
	soundsReady = false;
	ready = false;

	constructor ()
	{
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
			gameObjects["strawberry"] = new Strawberry();
			gameObjects["ready"] = new Ready();
			gameObjects["background"] = new Background();

			Object.keys(gameObjects).forEach(objectName =>
			{
				gameObjects[objectName].onLoad();
			});

			app.loader
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
			const soundArray = [];
			soundArray.push("game/sounds/BeepBox-Song.mp3");

			Object.keys(gameObjects).forEach(objectName =>
			{
				gameObjects[objectName].sounds.forEach(sound =>
				{
					soundArray.push(sound);
				});
			});

			sounds.load(soundArray);

			sounds.onProgress = (progress, res) =>
			{
				console.log('File ' + res.url + ' just finished loading.');
				console.log(progress + '% done');
			};

			sounds.whenLoaded = () =>
			{
				this.soundsReady = true;
				resolve();
				this.init();
			};
		});
	}

	createSprites ()
	{
		console.log("Sprites finished loading");
		Object.keys(gameObjects).forEach(objectName =>
		{
			gameObjects[objectName].onCreate();
		});
		this.spritesReady = true;
		this.init();
	}

	init ()
	{
		if (!this.spritesReady || !this.soundsReady) return;

		this.ready = true;

	}


}
