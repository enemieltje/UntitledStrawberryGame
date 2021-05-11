class Strawberry extends GameObject
{
	static name = "strawberry";
	static tileset = [];

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");
	toggleGravity = keyboard(" ");

	speed = 0.2;
	jumpHeight = 20;
	gravity = 0.5;
	gravityObjects = {planet: GameData.getObjectFromName("planet")};
	applyGravity = true;

	followerOffset = {x: 0, y: -32};
	rotation = 0;

	disableGravity = false;
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
			radius: 40,
			applyPhisics: true,
			// absorbtion: 100,
			static: false,
			bounce: false,
			drag: 0.01
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
			fill: "white",
		});
		this.debugScreen = new PIXI.Text(
			`\ta: ${this.sprite.ax}, ${this.sprite.ay}\n
			v: ${this.sprite.vx}, ${this.sprite.vy}\n
			d: ${this.sprite.x}, ${this.sprite.y}`
			, style);
		this.debugScreen.x = -window.innerWidth / 2 + 32;
		this.debugScreen.y = -window.innerHeight / 2 - 16;
		viewport.addChild(this.debugScreen);
	}

	static onLoad ()
	{
		Strawberry.soundFiles.push("Boing.mp3");
		super.onLoad(["runningJerry.json", "jerryIdle.json"]);
	}

	static create ()
	{
		GameData.storeObject(new Strawberry(), this.name);
	}

	walkSetup ()
	{
		this.toggleGravity.press = () =>
		{
			if (this.disableGravity) this.disableGravity = false;
			else this.disableGravity = true;
		};

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
				// const rect = new PIXI.Rectangle(this.x, this.y + this.height, this.width, 1);

				const collisionCandidates = [];
				const collisionIds = [];
				this.collisionChunks.forEach((chunkId) =>
				{
					const objects = GameData.getObjectsInChunk(chunkId);

					if (!objects)
					{
						return;
					}

					objects.forEach((objectId) =>
					{
						if (objectId != this.id && !collisionIds.includes(objectId))
						{
							collisionIds.push(objectId);
							collisionCandidates.push(GameData.getObjectFromId(objectId));
						}
					});
				});

				// const hitBox = new PIXI.Circle(Math.round(this.x), Math.round(this.y), this.radius + 3);
				// const hitBox = {x: Math.round(this.x + this.radius), y: Math.round(this.y + this.radius), radius: this.radius + 3};
				const hitBox = {x: this.x, y: this.y + 10, radius: this.radius, isSprite: true, name: "hitBox"};
				// GameData.getObjectArrayFromName("block").forEach(block =>
				collisionCandidates.forEach(object =>
				{
					// if (bump.hitTestRectangle(rect, block.sprite.hitBox))
					const hit = bump.hit(hitBox, object);
					// console.log(hit);
					if (hit)
					{
						validJump = true;
					}
				});
				// if (validJump) this.sprite.vy += -this.jumpHeight;
				if (validJump)
				{
					this.vy += -this.jumpHeight;
					const boing = sounds["game/sounds/Boing.mp3"];
					boing.play();
				}
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
			this.ax += -this.speed * Math.cos(-this.rotation);
			this.ay += -this.speed * Math.sin(-this.rotation);
		};

		this.walkLeft.release = () =>
		{
			this.ax = 0;
			this.ay = 0;
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
			this.ax += this.speed * Math.cos(-this.rotation);
			this.ay += this.speed * Math.sin(-this.rotation);
		};

		this.walkRight.release = () =>
		{
			this.ax = 0;
			this.ay = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step (delta)
	{
		super.step(delta);

		const w = viewport.screenWidth;
		const h = viewport.screenHeight;
		const angle = Math.atan(h / w);
		const rad = Math.sqrt(h * h + w * w) / 2;

		this.followerOffset.x = -Math.cos(-this.rotation + angle) * rad + w / 2;
		this.followerOffset.y = -Math.sin(-this.rotation + angle) * rad + h / 2;

		GameData.getObjectFromName("follower").x = this.x + this.followerOffset.x;
		GameData.getObjectFromName("follower").y = this.y + this.followerOffset.y;

		app.stage.rotation = this.rotation;
		this.sprite.rotation = - this.rotation;

		// hitbox

		// viewport.removeChild(this.rect);
		// this.rect = new PIXI.Graphics();
		// this.rect.lineStyle(2, 0x00FF00, 1);
		// this.rect.drawCircle(this.x + this.radius, this.y + this.radius, this.radius);
		// // this.rect.drawRect(this.x, this.y, this.width, this.height);
		// this.rect.endFill();
		// viewport.addChild(this.rect);

		this.debugScreen.text =
			`a: ${Math.round(this.ax * 100) / 100}, ${Math.round(this.ay * 100) / 100}\n
			v: ${Math.round(this.vx * 100) / 100}, ${Math.round(this.vy * 100) / 100}\n
			d: ${Math.round(this.x * 100) / 100}, ${Math.round(this.y * 100) / 100}`;


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
		this.debugScreen.rotation = -this.rotation;
		// this.debugScreen.scale.x = sign;

		// if (sign == 1)
		// {
		// 	this.debugScreen.scale.x = 1;
		// this.debugScreen.x = -window.innerWidth / 2 + 32;
		// }
		// else if (sign == -1)
		// {
		// 	this.debugScreen.scale.x = -1;
		// this.debugScreen.x = window.innerWidth / 2 - 32;
		// }

		this.debugScreen.x = viewport.corner.x;
		this.debugScreen.y = viewport.corner.y;
		// this.debugScreen.position.set(viewport.corner);

		// collisionChunks

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
					// this.ay = this.gravity;
					return;
				}

				objects.forEach((objectId) =>
				{
					if (objectId != this.id)
					{
						collisionCandidates.push(GameData.getObjectFromId(objectId));
					}
				});
			});

			let isFloating = true;

			// const hitBox = new PIXI.Circle(Math.round(this.x), Math.round(this.y), this.radius + 5);
			const hitBox = {x: this.x, y: this.y, radius: this.radius + 1, isSprite: true, name: "hitBox"};

			collisionCandidates.forEach(object =>
			{
				if (bump.hit(hitBox, object))
				{
					isFloating = false;
				}
			});

			this.applyGravity = isFloating;

			// jump

			// viewport.removeChild(this.rect);
			// this.rect = new PIXI.Graphics();
			// this.rect.lineStyle(4, 0x00FF00, 1);

			// this.rect.drawCircle(Math.round(this.x + this.radius), Math.round(this.y + this.radius), this.radius + 1);

			// this.rect.endFill();
			// viewport.addChild(this.rect);

			this.setGravity();

		} else {this.rotation = 0;}
	}

	setGravity ()
	{
		const relPos = {};

		relPos.x = this.gravityObjects["planet"].centerX - this.centerX;
		relPos.y = this.gravityObjects["planet"].centerY - this.centerY;

		const distance = Math.sqrt(relPos.x * relPos.x + relPos.y * relPos.y);

		const gravityConstant = 10;
		const gravForce = (gravityConstant * this.gravityObjects["planet"].mass * this.mass) / Math.pow(distance, 2);

		const dx = relPos.x / distance;
		const dy = relPos.y / distance;

		const gravX = gravForce * dx;
		const gravY = gravForce * dy;

		if (relPos.y > 0)
			this.rotation = Math.atan(relPos.x / relPos.y);
		else if (relPos.y < 0)
			this.rotation = Math.atan(relPos.x / relPos.y) + Math.PI;

		if (this.applyGravity)
		{
			Object.keys(this.gravityObjects).forEach(objectName =>
			{

				this.forces.x[objectName + "Gravity"] = gravX;
				this.forces.y[objectName + "Gravity"] = gravY;
			});
		} else
		{
			Object.keys(this.gravityObjects).forEach(objectName =>
			{
				this.forces.x[objectName + "Gravity"] = 0;
				this.forces.y[objectName + "Gravity"] = 0;
			});
		}
	}
}

Loader.objectTypes.push(Strawberry);

