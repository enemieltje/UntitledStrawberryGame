class Strawberry extends PIXI.Sprite
{

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");

	speed = 2;

	constructor ()
	{
		super(app.loader.resources["game/sprites/strawberry.png"].texture);
	}

	walk ()
	{
		this.x += this.vx;
		this.y += this.vy;
	}

	setup ()
	{

		this.walkUp.press = () =>
		{
			this.vy = -this.speed;
		};

		this.walkUp.release = () =>
		{
			if (this.walkDown.isUp) this.vy = 0;
			else this.vy = this.speed;
		};


		this.walkLeft.press = () =>
		{
			this.vx = -this.speed;
		};

		this.walkLeft.release = () =>
		{
			if (this.walkRight.isUp) this.vx = 0;
			else this.vx = this.speed;
		};

		this.walkDown.press = () =>
		{
			this.vy = this.speed;
		};

		this.walkDown.release = () =>
		{
			if (this.walkUp.isUp) this.vy = 0;
			else this.vy = -this.speed;
		};

		this.walkRight.press = () =>
		{
			this.vx = this.speed;
		};

		this.walkRight.release = () =>
		{
			if (this.walkLeft.isUp) this.vx = 0;
			else this.vx = -this.speed;
		};

	}
}
