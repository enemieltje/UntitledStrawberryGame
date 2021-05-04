let loading;
const gameObjects = {};
const physicsObjects = {};
const gameChunks = {};
const chunksize = {
	x: 256,
	y: 256
};

// sounds
// deno-lint-ignore no-unused-vars
let beepBox;

// vars
let stateTick = (_delta) => {};
const bump = new Bump(PIXI);

const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight - 4,
	antialiasing: true,
	transparent: false,
	resolution: 1
});
document.body.appendChild(app.view);

const viewport = new pixi_viewport.Viewport({
	screenWidth: window.innerWidth,
	screenHeight: window.innerHeight - 4,
	worldWidth: 2048,
	worldHeight: 2048,
	interaction: app.renderer.plugins.interaction
});
app.stage.addChild(viewport);

viewport
	.drag()
	.wheel()
	.clamp({direction: 'all'});

loadLoadingScreen();


function loadLoadingScreen ()
{
	app.loader
		.add("game/sprites/loading.png")
		.load(() =>
		{
			loadingScreen();
		});
}

function loadingScreen ()
{
	loading = new PIXI.Sprite(app.loader.resources["game/sprites/loading.png"].texture);

	loading.x = 32;
	loading.y = 96;

	app.stage.addChild(loading);

	// const loaderInstance = new Loader();
	Loader.load().then(() =>
	{
		console.log("ready!");

		onReady();
	});
}

function onReady ()
{
	app.stage.removeChild(loading);

	// gameObjects.ready = new Ready();
	GameData.getObjectFromName("ready").addToParent(app.stage);
	// app.stage.addChild(gameObjects["ready"].sprite);

	window.addEventListener(
		"keydown",
		onStart, false
	);

}

function onStart ()
{
	window.removeEventListener("keydown", onStart);

	stateTick = walkTick;

	app.ticker.add(delta => tick(delta));

	GameData.getObjectFromName("ready").removeFromParent(app.stage);
	// app.stage.removeChild(gameObjects["ready"].sprite);

	GameData.getObjectArrayFromName("background").forEach(object =>
	{
		object.addToParent();
		// viewport.addChild(object);
	});

	GameData.getObjectArrayFromName("block").forEach(object =>
	{
		object.addToParent();
		// viewport.addChild(object);
	});

	GameData.getObjectFromName("strawberry").addToParent();
	// viewport.addChild(gameObjects["strawberry"].sprite);
	viewport.follow(GameData.getObjectFromName("strawberry").sprite, {radius: 192});

	BeepBox = sounds["game/sounds/BeepBox-Song.mp3"];
	BeepBox.play();
}

function tick (delta)
{
	stateTick(delta);
}

function walkTick (delta)
{
	GameData.getObjectFromName("strawberry").step(delta);
	GameData.getObjectArrayFromName("block").forEach((block) =>
	{
		block.step(delta);
	});


	// .step(delta);
}

