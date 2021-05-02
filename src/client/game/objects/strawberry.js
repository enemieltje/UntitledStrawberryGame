class Strawberry extends GameObject
{

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");

	speed = 2;

	vx = 0;
	vy = 0;

	ax = 0;
	ay = 0;

	constructor ()
	{
		// super(app.loader.resources["game/sprites/strawberry.png"].texture);
		super("strawberry");
	}

	onLoad ()
	{
		super.onLoad();
	}

	onCreate ()
	{
		super.onCreate();

		this.sprite.anchor.set(0.5);

		this.ay = 0.1;

		this.sprite.x = 96;
		this.sprite.y = 96;

		this.walkUp.press = () =>
		{
			this.vy += -this.speed;
		};

		this.walkUp.release = () =>
		{
			this.vy -= -this.speed;
		};

		this.walkLeft.press = () =>
		{
			this.vx += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.vx -= -this.speed;
		};

		this.walkDown.press = () =>
		{
			this.vy += this.speed;
		};

		this.walkDown.release = () =>
		{
			this.vy -= this.speed;
		};

		this.walkRight.press = () =>
		{
			this.vx += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.vx -= this.speed;
		};
	}

	step ()
	{
		this.vx += this.ax;
		this.vy += this.ay;

		if (this.collision())
		{
			this.vy = 0;
			this.sprite.y -= 1;
		}

		this.sprite.x += this.vx;
		this.sprite.y += this.vy;
	}

	collision ()
	{
		// gameObjects["block"].sprite.forEach(object =>
		// {
		// 	if (hitTestRectangle(this.sprite, object))
		// 	{
		// 		const side = contain(explorer, {x: object.x, y: object.y, width: object.width, height: object.height});

		// 		console.log(side);
		// 	};
		// });

		if (gameObjects["block"].isAtPos(this.sprite.x, this.sprite.y + this.sprite.height / 2 + 1))
		{
			console.log("yes");
			return true;
		}
		// else console.log("no");
		return false;
	}
}
