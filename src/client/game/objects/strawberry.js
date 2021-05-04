class Strawberry extends GameObject
{
	static name = "strawberry";

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");

	speed = 2;
	jumpHeight = 6;

	// vx = 0;
	// vy = 0;

	// ax = 0;
	// ay = 0;

	// gravity = 0;

	constructor ()
	{
		super(Strawberry.name, 96, 96);
		this.sprite.anchor.set(0.5);
		this.sprite.ay = 0.1;
		this.applyPhisics = true;
		this.walkSetup();
	}

	static onLoad ()
	{
		super.onLoad([this.name]);
	}

	static create ()
	{
		GameData.storeObject(new Strawberry(), this.name);
		// gameObjects["strawberry"] = new Strawberry();
	}

	onCreate ()
	{
		super.onCreate();
		this.sprite.anchor.set(0.5);
		this.sprite.x = 96;
		this.sprite.y = 96;
		this.ay = 0.1;
		this.applyPhisics = true;
		this.walkSetup();
	}

	walkSetup ()
	{
		this.walkUp.press = () =>
		{
			let validJump = false;
			const rect = new PIXI.Rectangle(this.sprite.x - this.sprite.width / 2, this.sprite.y + this.sprite.width / 2, this.sprite.width, 1);
			GameData.getObjectArrayFromName("block").forEach(block =>
			{
				const blockRect = new PIXI.Rectangle(block.sprite.x, block.sprite.y, block.sprite.width, block.sprite.height);
				if (bump.hitTestRectangle(rect, blockRect))
				{
					validJump = true;
				}
			});
			if (validJump) this.sprite.vy += -this.jumpHeight;

			// this.sprite.vy += -this.speed;

		};

		this.walkUp.release = () =>
		{
			// this.sprite.vy -= -this.speed / 2;

			// this.sprite.vy = 0;
			// if (this.walkDown.isDown) this.walkDown.press();
		};

		this.walkLeft.press = () =>
		{
			this.sprite.vx += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.sprite.vx = 0;
			if (this.walkRight.isDown) this.walkRight.press();
		};

		this.walkDown.press = () =>
		{
			// this.sprite.vy += this.speed;
		};

		this.walkDown.release = () =>
		{
			// this.sprite.vy = 0;
			// if (this.walkUp.isDown) this.walkUp.press();
		};

		this.walkRight.press = () =>
		{
			this.sprite.vx += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.sprite.vx = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step (delta)
	{
		super.step(delta);

		// this.vx += this.ax / 60;
		// this.vy += this.ay / 60;

		// this.sprite.x += this.vx;
		// this.sprite.y += this.vy;

		// bump.hit(this.sprite, gameObjects["block"].sprite, true, false, false,
		// 	(side, _block) =>
		// 	{
		// 		switch (side)
		// 		{
		// 			case "left":
		// 			case "right":
		// 				this.vx = 0;
		// 				break;
		// 			case "top":
		// 			case "bottom":
		// 				this.vy = 0;
		// 				break;
		// 			default:
		// 		}
		// 	}
		// );


	}
}
