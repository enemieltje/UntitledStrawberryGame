class Strawberry extends GameObject
{

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");

	speed = 2;
	jumpHeight = 6;

	vx = 0;
	vy = 0;

	ax = 0;
	ay = 0;

	// gravity = 0;

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
		this.sprite.x = 96;
		this.sprite.y = 96;
		this.ay = 6;
		this.walkSetup();
	}

	walkSetup ()
	{
		this.walkUp.press = () =>
		{
			let validJump = false;
			const rect = new PIXI.Rectangle(this.sprite.x - this.sprite.width / 2, this.sprite.y + this.sprite.width / 2, this.sprite.width, 1);
			gameObjects["block"].sprite.forEach(block =>
			{
				const blockRect = new PIXI.Rectangle(block.x, block.y, block.width, block.height);
				if (bump.hitTestRectangle(rect, blockRect))
				{
					validJump = true;
				}
			});
			if (validJump) this.vy += -this.jumpHeight;
		};

		this.walkUp.release = () =>
		{
			// this.vy -= -this.speed / 2;

			// this.vy = 0;
			// if (this.walkDown.isDown) this.walkDown.press();
		};

		this.walkLeft.press = () =>
		{
			this.vx += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.vx = 0;
			if (this.walkRight.isDown) this.walkRight.press();
		};

		this.walkDown.press = () =>
		{
			// this.vy += this.speed;
		};

		this.walkDown.release = () =>
		{
			// this.vy = 0;
			// if (this.walkUp.isDown) this.walkUp.press();
		};

		this.walkRight.press = () =>
		{
			this.vx += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.vx = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step ()
	{
		this.vx += this.ax / 60;
		this.vy += this.ay / 60;

		this.sprite.x += this.vx;
		this.sprite.y += this.vy;

		bump.hit(this.sprite, gameObjects["block"].sprite, true, false, false,
			(side, _block) =>
			{
				switch (side)
				{
					case "left":
					case "right":
						this.vx = 0;
						break;
					case "top":
					case "bottom":
						this.vy = 0;
						break;
					default:
				}
			}
		);


	}
}
