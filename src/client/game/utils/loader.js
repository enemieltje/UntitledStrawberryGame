class Loader
{
	// will be done automatically for each object file
	// static objectTypes = [Strawberry, Ready, Background, Block, Planet];
	static objectTypes = [];

	static spritesReady = false;
	static soundsReady = false;
	static ready = false;

	static load ()
	{
		const style = new PIXI.TextStyle({
			fontSize: 12,
			fill: "white",
		});
		GameData.debugScreen = new PIXI.Text("", style);

		GameData.setSpriteOffset("jerryIdle.json", -23, -35);
		GameData.setSpriteOffset("runningJerry.json", -23, -46);
		// GameData.setSpriteOffset("runningJerry.json", {x: 0, y: 0});
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
			const path = "game/sounds";
			soundArray.push(`${path}/BeepBox-Song.mp3`);

			Loader.objectTypes.forEach(object =>
			{
				if (!object.soundFiles) return;
				object.soundFiles.forEach(sound =>
				{
					soundArray.push(`${path}/${sound}`);
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

			console.log(`loading sprite: empty.png`);
			app.loader.add(`game/sprites/empty.png`);
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

		GameData.loadSprites();
		Loader.objectTypes.forEach(object =>
		{
			console.log(`creating ${object.name}`);
			object.create();
		});
		GameData.updateAllChunks();

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
