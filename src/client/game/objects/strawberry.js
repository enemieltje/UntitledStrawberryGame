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

	disableGravity = false;
	rect = {};
	debugScreen;
	constructor ()
	{
		// TODO: make collision box
		super(Strawberry.name, 96, 96, GameData.getSprite(`jerryIdle.json`));

		this.sprite.animationSpeed = 0.2;
		this.sprite.anchor.set(0.5);
		this.applyPhisics = true;
		this.sprite.properties.absorbtion = 100;
		this.sprite.properties.static = false;
		this.sprite.properties.drag = 0.05;
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
				this.sprite.ay += -this.speed;
			} else
			{
				let validJump = false;
				const rect = new PIXI.Rectangle(this.sprite.x - this.sprite.width / 2, this.sprite.y + this.sprite.height / 2, this.sprite.width, 1);
				GameData.getObjectArrayFromName("block").forEach(block =>
				{
					const blockRect = new PIXI.Rectangle(block.sprite.x, block.sprite.y, block.sprite.width, block.sprite.height);
					if (bump.hitTestRectangle(rect, blockRect))
					{
						validJump = true;
					}
				});
				if (validJump) this.sprite.vy += -this.jumpHeight;
			}
		};

		this.walkUp.release = () =>
		{
			if (this.disableGravity)
			{
				this.sprite.ay = 0;
				if (this.walkDown.isDown) this.walkDown.press();
			}
		};

		this.walkLeft.press = () =>
		{
			this.sprite.ax += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.sprite.ax = 0;
			if (this.walkRight.isDown) this.walkRight.press();
		};

		this.walkDown.press = () =>
		{
			if (this.disableGravity)
			{
				this.sprite.ay += this.speed;
			}
		};

		this.walkDown.release = () =>
		{
			if (this.disableGravity)
			{
				this.sprite.ay = 0;
				if (this.walkUp.isDown) this.walkUp.press();
			}
		};

		this.walkRight.press = () =>
		{
			this.sprite.ax += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.sprite.ax = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step (delta)
	{

		this.debugScreen.text =
			`a: ${Math.round(this.sprite.ax * 100) / 100}, ${Math.round(this.sprite.ay * 100) / 100}\n
			v: ${Math.round(this.sprite.vx * 100) / 100}, ${Math.round(this.sprite.vy * 100) / 100}\n
			d: ${Math.round(this.sprite.x * 100) / 100}, ${Math.round(this.sprite.y * 100) / 100}`;

		super.step(delta);

		let sign = Math.sign(this.sprite.vx);
		sign == 0 ? sign = 1 : "";

		if (this.sprite.vx * sign < 0.5)
		{
			// if (this.currentImageName != "idle" && this.sprite.currentFrame == 0)
			// {
			// 	this.sprite.stop();

			// 	this.currentImageName = "idle";
			// }
			this.image = "jerryIdle.json";
		} else
		{
			this.image = "runningJerry.json";
			// if (this.texture != "running")
			// {
			// 	// const image = GameData.getSprite(imageName);
			// 	this.sprite.textures = Strawberry.tileset;
			// 	this.sprite.play();
			// 	this.texture = "running";
			// }
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
					this.sprite.ay = this.gravity;
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

			const hitBox = new PIXI.Rectangle(Math.round(this.absX()), Math.round(this.absY() + this.sprite.height), this.sprite.width, 1);
			// viewport.removeChild(this.rect);
			// this.rect = new PIXI.Graphics();
			// this.rect.beginFill(0x00FF00);
			// this.rect.drawRect(0, 0, this.sprite.width, 1);
			// this.rect.endFill();
			// this.rect.x = Math.round(this.absX());
			// this.rect.y = Math.round(this.absY() + this.sprite.height);
			// viewport.addChild(this.rect);
			// console.log(collisionCandidates.length);

			collisionCandidates.forEach(object =>
			{
				// console.log(`${object.x}, ${object.y}, ${object.width}, ${object.height}`);
				const blockRect = new PIXI.Rectangle(object.x, object.y, object.width, object.height);
				if (bump.hitTestRectangle(hitBox, blockRect))
				{
					// console.log("hit!");
					isFloating = false;
				}
			});


			this.sprite.ay = this.gravity * isFloating;
		}
	}
}
