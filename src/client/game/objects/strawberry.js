class Strawberry extends GameObject
{
	static name = "strawberry";
	static tileset = [];

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");

	speed = 0.2;
	jumpHeight = 20;
	gravity = 0.5;
	// texture = "running";

	disableGravity = true;
	rect = {};
	debugScreen;
	constructor ()
	{
		// TODO: make collision box
		// super(Strawberry.name, 96, 96, GameData.getSprite(`jerryIdle.json`));
		const properties =
		{
			x: 96,
			y: 96,
			height: 80,
			width: 80,
			applyPhisics: true,
			absorbtion: 100,
			static: false,
			drag: 0.05
		};
		super(Strawberry.name, properties, GameData.getSprite(`jerryIdle.json`));

		// this.sprite.hitBox.height = 80;
		this.sprite.animationSpeed = 0.2;
		this.sprite.anchor.set(0.5);
		// this.applyPhisics = true;
		// this.sprite.properties.absorbtion = 100;
		// this.sprite.properties.static = false;
		// this.sprite.properties.drag = 0.05;
		this.walkSetup();

		const style = new PIXI.TextStyle({
			fontSize: 12,
		});
		this.debugScreen = new PIXI.Text(
			`\ta: ${this.sprite.ax}, ${this.sprite.ay}\n
			v: ${this.sprite.vx}, ${this.sprite.vy}\n
			d: ${this.sprite.x}, ${this.sprite.y}`
			, style);
		this.debugScreen.anchor.y = 1;
		this.debugScreen.x = 8;
		this.debugScreen.y = window.innerHeight - 8;
		app.stage.addChild(this.debugScreen);
	}

	static onLoad ()
	{
		super.onLoad(["runningJerry.json", "jerryIdle.json"]);
	}

	static create ()
	{
		GameData.storeObject(new Strawberry(), this.name);
	}

	walkSetup ()
	{
		this.walkUp.press = () =>
		{
			if (this.disableGravity)
			{
				// this.sprite.ay += -this.speed;
				this.ay += -this.speed;
			} else
			{
				let validJump = false;
				// const rect = new PIXI.Rectangle(this.sprite.hitBox.x, this.sprite.hitBox.y + this.sprite.hitBox.height, this.sprite.hitBox.width, 1);
				const rect = new PIXI.Rectangle(this.x, this.y + this.height, this.width, 1);

				GameData.getObjectArrayFromName("block").forEach(block =>
				{
					// if (bump.hitTestRectangle(rect, block.sprite.hitBox))
					if (bump.hitTestRectangle(rect, block))
					{
						validJump = true;
					}
				});
				// if (validJump) this.sprite.vy += -this.jumpHeight;
				if (validJump) this.vy += -this.jumpHeight;
			}
		};

		this.walkUp.release = () =>
		{
			if (this.disableGravity)
			{
				this.ay = 0;
				if (this.walkDown.isDown) this.walkDown.press();
			}
		};

		this.walkLeft.press = () =>
		{
			this.ax += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.ax = 0;
			if (this.walkRight.isDown) this.walkRight.press();
		};

		this.walkDown.press = () =>
		{
			if (this.disableGravity)
			{
				this.ay += this.speed;
			}
		};

		this.walkDown.release = () =>
		{
			if (this.disableGravity)
			{
				this.ay = 0;
				if (this.walkUp.isDown) this.walkUp.press();
			}
		};

		this.walkRight.press = () =>
		{
			this.ax += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.ax = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step (delta)
	{
		viewport.removeChild(this.rect);
		this.rect = new PIXI.Graphics();
		this.rect.lineStyle(2, 0x00FF00, 1);
		this.rect.drawRect(this.x, this.y, this.width, this.height);
		this.rect.endFill();
		// this.rect.x = this.sprite.x;
		// this.rect.y = this.sprite.y;
		viewport.addChild(this.rect);

		// this.debugScreen.text =
		// `a: ${Math.round(this.sprite.ax * 100) / 100}, ${Math.round(this.sprite.ay * 100) / 100}\n
		// v: ${Math.round(this.sprite.vx * 100) / 100}, ${Math.round(this.sprite.vy * 100) / 100}\n
		// d: ${Math.round(this.sprite.x * 100) / 100}, ${Math.round(this.sprite.y * 100) / 100}`;
		this.debugScreen.text =
			`a: ${Math.round(this.ax * 100) / 100}, ${Math.round(this.ay * 100) / 100}\n
			v: ${Math.round(this.vx * 100) / 100}, ${Math.round(this.vy * 100) / 100}\n
			d: ${Math.round(this.x * 100) / 100}, ${Math.round(this.y * 100) / 100}`;

		super.step(delta);

		let sign = Math.sign(this.vx);
		sign == 0 ? sign = 1 : "";

		if (this.vx * sign < 0.5)
		{
			this.sprite.animationSpeed = 0.1;
			this.image = "jerryIdle.json";
		} else
		{
			this.sprite.animationSpeed = this.vx / 16 * sign;
			this.image = "runningJerry.json";
		}
		this.sprite.scale.x = sign;

		// this.collisionChunks.forEach((chunk) =>
		// {
		// 	const rect = new PIXI.Graphics();
		// 	rect.lineStyle(4, 0xFF33FF, 1);
		// 	rect.drawRect(0, 0, chunksize.x, chunksize.y);
		// 	rect.endFill();
		// 	rect.x = chunk.x * chunksize.x;
		// 	rect.y = chunk.y * chunksize.y;
		// 	this.vis.push(rect);
		// 	viewport.addChild(rect);
		// });

		if (!this.disableGravity)
		{
			const collisionCandidates = [];
			this.collisionChunks.forEach((chunkId) =>
			{
				const objects = GameData.getObjectsInChunk(chunkId);

				if (!objects)
				{
					this.ay = this.gravity;
					return;
				}

				objects.forEach((objectId) =>
				{
					if (objectId != this.id)
					{
						collisionCandidates.push(GameData.getObjectFromId(objectId).sprite);
					}
				});
			});

			let isFloating = true;

			const hitBox = new PIXI.Rectangle(Math.round(this.x), Math.round(this.y + this.height), this.width, 1);
			// const hitBox = new PIXI.Rectangle(Math.round(this.sprite.hitBox.x), Math.round(this.sprite.hitBox.y + this.sprite.hitBox.height), this.sprite.hitBox.width, 1);

			collisionCandidates.forEach(object =>
			{
				if (bump.hitTestRectangle(hitBox, object))
				{
					isFloating = false;
				}
			});

			// viewport.removeChild(this.rect);
			// this.rect = new PIXI.Graphics();
			// this.rect.beginFill(0x00FF00);
			// this.rect.drawRect(0, 0, this.sprite.width, 1);
			// this.rect.endFill();
			// this.rect.x = Math.round(this.absX());
			// this.rect.y = Math.round(this.absY() + this.sprite.height);
			// viewport.addChild(this.rect);
			// console.log(collisionCandidates.length);

			this.ay = this.gravity * isFloating;
		}
	}
}

Loader.objectTypes.push(Strawberry);

