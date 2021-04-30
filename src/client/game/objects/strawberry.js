class Strawberry extends PIXI.Sprite
{
	constructor(){
		super(app.loader.resources["game/sprites/strawberry.png"].texture)
	}

	walk()
	{
		this.x += this.vx;
		this.y += this.vy;
	}
}
