const app = new PIXI.Application({
	width: 256,
	height: 256,
	antialiasing: true,
	transparent: false,
	resolution: 1
});

document.body.appendChild(app.view);

app.loader
	.add("game/sprites/loading.png")
	.load(loadingScreen);


// sprites
let strawberry;
let loading;
let ready;

// sounds
let BeepBox;

// vars
let state = isLoading;

function loadingScreen(){
	loading = new PIXI.Sprite(app.loader.resources["game/sprites/loading.png"].texture);

	loading.x = 32;
	loading.y = 96;

	//Add the sprite to the stage
	app.stage.addChild(loading);

	loadSprites();
}

function loadSprites()
{
	app.loader
		.add("game/sprites/strawberry.png")
		.add("game/sprites/ready.png")
		.load(loadSounds);
}

function loadSounds()
{
	sounds.load([
		"game/sounds/BeepBox-Song.mp3"
	]);

	sounds.onProgress = function (progress, res) {
		console.log('Total ' + progress + ' file(s) loaded.');
		console.log('File ' + res.url + ' just finished loading.');
	};
	sounds.whenLoaded = onLoading;

}

function onLoading()
{
	//Create the sprites
	strawberry = new PIXI.Sprite(app.loader.resources["game/sprites/strawberry.png"].texture);
	ready = new PIXI.Sprite(app.loader.resources["game/sprites/ready.png"].texture);

	//Change the sprite's position
	strawberry.x = 96;
	strawberry.y = 96;
	strawberry.vx = 0;
	strawberry.vy = 0;

	ready.x = 32;
	ready.y = 96;

	// add ticker
	app.ticker.add(delta => gameLoop(delta));

	onReady();
}

function onReady(){
	state = isReady;

	app.stage.removeChild(loading);
	app.stage.addChild(ready);

	window.addEventListener(
		"keydown", onStart, false
	);

}

function onStart(){
	window.removeEventListener("keydown", onStart);
	state = isStart;

	app.stage.removeChild(ready);
	app.stage.addChild(strawberry);

	BeepBox = sounds["game/sounds/BeepBox-Song.mp3"];
	BeepBox.play();

	// init keys
	const w = keyboard("w"),
		a = keyboard("a"),
		s = keyboard("s"),
		d = keyboard("d")

	w.press = () => {
		strawberry.vy = -1;
	};
	w.release = () => {
		if(s.isUp) strawberry.vy = 0;
		else strawberry.vy = 1;
	};

	a.press = () => {
		strawberry.vx = -1;
	};
	a.release = () => {
		if (d.isUp) strawberry.vx = 0;
		else strawberry.vx = 1;
	};

	s.press = () => {
		strawberry.vy = 1;
	};
	s.release = () => {
		if (w.isUp) strawberry.vy = 0;
		else strawberry.vy = -1;
	};

	d.press = () => {
		strawberry.vx = 1;
	};
	d.release = () => {
		if (a.isUp) strawberry.vx = 0;
		else strawberry.vx = -1;
	};

}

function gameLoop(delta)
{
	state(delta)
}

function isLoading(_delta){

}

function isReady(_delta){

}

function isStart(_delta)
{
	strawberry.x += strawberry.vx;
	strawberry.y += strawberry.vy;
}

