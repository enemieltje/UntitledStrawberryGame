
let strawberry;
let loading;
let ready;

// sounds
let beepBox;

// vars
let stateTick = (_delta) => {};
let viewportX = 0;
let viewportY = 0;

// keys
let walkUp;
let walkDown;
let walkLeft;
let walkRight;

const app = new PIXI.Application({
	width: 256,
	height: 256,
	antialiasing: true,
	transparent: false,
	resolution: 1
});

init();

function init ()
{
	document.body.appendChild(app.view);

	loadLoadingScreen();
}

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


	app.stage.addChild(
		loading);

	const loaderInstance = new Loader(app);
	loaderInstance.load().then(() =>
	{
		console.log("ready!");

		onReady();
	});
}

function onReady ()
{

	strawberry.x = 96;
	strawberry.y = 96;

	strawberry.vx = 0;
	strawberry.vy = 0;

	ready.x = 32;
	ready.y = 96;


	app.stage.removeChild(loading);
	app.stage.addChild(ready);

	// init keys
	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");

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
	app.stage.addChild(strawberry);

	BeepBox = sounds["game/sounds/BeepBox-Song.mp3"];
	BeepBox.play();

	walkUp.press = () =>
	{
		strawberry.vy = -1;
	};

	walkUp.release = () =>
	{
		if (walkDown.isUp) strawberry.vy = 0;
		else strawberry.vy = 1;
	};


	walkLeft.press = () =>
	{
		strawberry.vx = -1;
	};

	walkLeft.release = () =>
	{
		if (walkRight.isUp) strawberry.vx = 0;
		else strawberry.vx = 1;
	};

	walkDown.press = () =>
	{
		strawberry.vy = 1;
	};

	walkDown.release = () =>
	{
		if (walkUp.isUp) strawberry.vy = 0;
		else strawberry.vy = -1;
	};

	walkRight.press = () =>
	{
		strawberry.vx = 1;
	};

	walkRight.release = () =>
	{
		if (walkLeft.isUp) strawberry.vx = 0;
		else strawberry.vx = -1;
	};
}

function tick (delta)
{
	stateTick(delta);
}

function walkTick (_delta)
{
	strawberry.walk();
}
