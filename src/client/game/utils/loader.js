class Loader
{
	// will be done automatically for each object file
	static objectTypes = [Strawberry, Ready, Background, Block];

	static spritesReady = false;
	static soundsReady = false;
	static ready = false;

	constructor ()
	{
	}

	static load ()
	{
		return new Promise((resolve) =>
		{
			Loader.loadSprites().then(() =>
			{
				if (Loader.soundsReady) resolve();
			});

			Loader.loadSounds().then(() =>
			{
				if (Loader.spritesReady) resolve();
			});
		});
	}

	static loadSounds ()
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
				Loader.soundsReady = true;
				resolve();
				Loader.init();
			};
		});
	}

	static loadSprites ()
	{
		console.log("Loading Sprites");
		return new Promise(resolve =>
		{

			Loader.objectTypes.forEach(object =>
			{
				object.onLoad();
			});

			app.loader
				.load(() =>
				{
					console.log("Sprites finished loading");
					Loader.createSprites();
					resolve();
				});
		});
	}

	static createSprites ()
	{
		console.log("Creating Sprites");

		Loader.objectTypes.forEach(object =>
		{
			object.create();
		});

		console.log("Sprites finished creating");
		Loader.spritesReady = true;
		Loader.init();
	}

	static init ()
	{
		if (!Loader.spritesReady || !Loader.soundsReady) return;

		Loader.ready = true;
	}
}
