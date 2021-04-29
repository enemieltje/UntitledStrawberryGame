

//Create a Pixi Application
let app = new PIXI.Application({
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

PIXI.loader
	.add("images/strawberry.png")
	.load(setup);

function setup() {

	//Create the cat sprite
	let strawberry = new PIXI.Sprite(PIXI.loader.resources["images/strawberry.png"].texture);

	//You can also create the `cat` sprite from the texture, like this:
	//let strawberry = new PIXI.Sprite(PIXI.TextureCache["images/strawberry.png"]);

	//Add the cat to the stage
	app.stage.addChild(strawberry);
}
