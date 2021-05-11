let loading;
const gameObjects = {};
const physicsObjects = {};
const gameChunks = {};
const chunksize = {
	x: 256,
	y: 256
};

let frame = 0;

// sounds
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
	// worldWidth: 2048,
	// worldHeight: 2048,
	interaction: app.renderer.plugins.interaction
});
app.stage.addChild(viewport);

viewport
	.drag()
	.wheel();
// .clamp({direction: 'all'});

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

	const scaleX = window.innerWidth / loading.width;
	const scaleY = window.innerHeight - 4 / loading.height;

	const scale = Math.min(scaleX, scaleY);

	loading.scale.set(scale, scale);

	// loading.x = 32;
	// loading.y = 96;

	app.stage.addChild(loading);

	Loader.load().then(onReady);
}

function onReady ()
{
	console.log("ready!");
	app.stage.removeChild(loading);

	GameData.getObjectFromName("ready").addToParent(app.stage);

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

	GameData.getObjectArrayFromName("background").forEach(object =>
	{
		object.addToParent();
	});

	GameData.getObjectArrayFromName("block").forEach(object =>
	{
		object.addToParent();
	});

	GameData.getObjectFromName("planet").addToParent();
	GameData.getObjectFromName("strawberry").addToParent();
	viewport.addChild(GameData.getObjectFromName("follower"));
	viewport.follow(GameData.getObjectFromName("follower"), {radius: 192});

	BeepBox = sounds["game/sounds/BeepBox-Song.mp3"];
	BeepBox.play();
	BeepBox.volume = 0.25;
	sounds["game/sounds/Boing.mp3"].volume = 0.5;
	GameData.getObjectFromName("planet").drawShape();
}

function tick (delta)
{
	stateTick(delta);
}

function walkTick (delta)
{
	GameData.frame++;
	if (GameData.frame >= 60) GameData.frame = 0;

	GameData.getObjectFromName("strawberry").step(delta);
	GameData.getObjectFromName("planet").step(delta);
	GameData.getObjectArrayFromName("block").forEach((block) =>
	{
		block.step(delta);
	});
}

