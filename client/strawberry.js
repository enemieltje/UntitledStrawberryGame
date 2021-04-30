// import "./utils.js"

//Create a Pixi Application
const app = new PIXI.Application({
	width: 256,
	height: 256,
	antialiasing: true,
	transparent: false,
	resolution: 1
});

// app.renderer.backgroundColor = 0xe500c6;
// app.renderer.autoResize = true;
// app.renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.loader
	.add("game/sprites/strawberry.png")
	.load(setup);


let strawberry;
let state = walk;
let BeepBox;

function loadSounds() {


	sounds.load([
		"game/sounds/BeepBox-Song.mp3"
	]);

	sounds.onProgress = function (progress, res) {
		console.log('Total ' + progress + ' file(s) loaded.');
		console.log('File ' + res.url + ' just finished loading.');
	};
	sounds.whenLoaded = playBeep;

}

function playBeep() {
	BeepBox = sounds["game/sounds/BeepBox-Song.mp3"];
	BeepBox.play();
}

function setup() {

	loadSounds();

	//Create the cat sprite
	strawberry = new PIXI.Sprite(app.loader.resources["game/sprites/strawberry.png"].texture);

	//Change the sprite's position
	strawberry.x = 96;
	strawberry.y = 96;
	strawberry.vx = 0;
	strawberry.vy = 0;


	const w = keyboard("w"),
		a = keyboard("a"),
		s = keyboard("s"),
		d = keyboard("d")
		space = keyboard(" ")

	space.press = () => {
		// actx = new AudioContext();
		// loadSounds();
	}

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

	//Add the cat to the stage
	app.stage.addChild(strawberry);

	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {

	//Move the cat 1 pixel
	state(delta)
}

function walk(_delta) {


	strawberry.x += strawberry.vx;
	strawberry.y += strawberry.vy;


}

