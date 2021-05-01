const backgroundObjects = [];
let strawberry;
let loading;
let ready;

// sounds
// deno-lint-ignore no-unused-vars
let beepBox;

// vars
let stateTick = (_delta) => {};

// keys
let walkUp;
let walkDown;
let walkLeft;
let walkRight;

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

	const loaderInstance = new Loader(app);
	loaderInstance.load().then(() =>
	{
		console.log("ready!");

		onReady();
	});
}

function onReady ()
{
	strawberry.anchor.set(0.5);

	strawberry.x = 96;
	strawberry.y = 96;

	strawberry.vx = 0;
	strawberry.vy = 0;

	ready.x = 32;
	ready.y = 96;


	app.stage.removeChild(loading);
	app.stage.addChild(ready);

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

	app.stage.removeChild(ready);

	backgroundObjects.forEach(object =>
	{
		viewport.addChild(object);
	});

	viewport.addChild(strawberry);
	viewport.follow(strawberry, {radius: 192});

	BeepBox = sounds["game/sounds/BeepBox-Song.mp3"];
	BeepBox.play();

	strawberry.setup();

}

function tick (delta)
{
	stateTick(delta);
}

function walkTick (_delta)
{
	strawberry.walk();
}
