class Strawberry extends MovingObject
{
	static name = "strawberry";
	static tileset = [];
	static soundFiles = [];

	walkUp = keyboard("w");
	walkLeft = keyboard("a");
	walkDown = keyboard("s");
	walkRight = keyboard("d");
	toggleGravity = keyboard(" ");

	speed = 0.2;
	jumpHeight = 10;
	applyGravity = true;
	canJump = false;
	lastCanJump = false;

	disableGravity = false;
	fps = [];

	constructor ()
	{
		const properties =
		{
			pos: new Complex(96, 96),
			radius: 30
		};
		super(properties, "jerryIdle.json");

		this.sprite.animationSpeed = 0.2;
		this.sprite.anchor.x = 0.52;
		this.walkSetup();
	}

	static onLoad ()
	{
		Strawberry.soundFiles.push("Boing.mp3");
		super.onLoad(["jerryIdle.json", "runningJerry.json"]);
	}

	static create ()
	{
		GameData.storeObject(new Strawberry(), this.name);
	}

	walkSetup ()
	{
		this.relForces.walk = new Complex(0, 0);
		// this.isWalking = true;
		const decelleration = 0.15;

		this.toggleGravity.press = () =>
		{
			this.disableGravity = !this.disableGravity;
		};

		this.walkUp.press = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.im += -this.speed;
			} else
			{
				if (this.canJump)
				{
					this.relVy += -this.jumpHeight;
					// this.v = this.v.add(new Complex(0, -this.jumpHeight).mul(this.rotation));
					sounds["game/sounds/Boing.mp3"].play();
				}
			}
		};

		this.walkUp.release = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.im = 0;
				this.relVy *= decelleration;
				if (this.walkDown.isDown) this.walkDown.press();
			}
		};

		this.walkLeft.press = () =>
		{
			if (this.disableGravity || this.canJump) this.relForces.walk.re += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			if (this.disableGravity || this.canJump)
			{
				this.relForces.walk.re = 0;
				this.relVx *= decelleration;
				if (this.walkRight.isDown) this.walkRight.press();
			}
		};

		this.walkDown.press = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.im += this.speed;
			}
		};

		this.walkDown.release = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.im = 0;
				this.relVy *= decelleration;
				if (this.walkUp.isDown) this.walkUp.press();
			}
		};

		this.walkRight.press = () =>
		{
			if (this.disableGravity || this.canJump) this.relForces.walk.re += this.speed;
		};

		this.walkRight.release = () =>
		{
			if (this.disableGravity || this.canJump)
			{
				this.relForces.walk.re = 0;
				this.relVx *= decelleration;
				if (this.walkLeft.isDown) this.walkLeft.press();
			}
		};
	}

	step (delta)
	{

		super.step(delta);
		this.checkJump();
		this.correctMovement();

		this.setRotation();
		this.setSprite();
		this.updateViewport();

		this.setDebugScreen(delta);

		this.updateDebugShapes();
	}

	checkJump ()
	{
		const collisionCandidates = [];
		this.collisionChunks.forEach((chunkId) =>
		{
			const objects = GameData.getObjectsInChunk(chunkId);

			if (!objects)
			{
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

		this.canJump = false;

		const hitBox = {x: this.x - 4, y: this.y - 4, radius: this.radius + 4, isSprite: true, name: "hitBox"};

		collisionCandidates.forEach(object =>
		{
			if (bump.hit(hitBox, object))
			{
				this.canJump = true;
			}
		});

		GameData.addDebugShape("canJump", "circle", {
			x: hitBox.x + hitBox.radius,
			y: hitBox.y + hitBox.radius,
			radius: hitBox.radius
		}, 0x00FFFF);
	}

	correctMovement ()
	{
		if (this.lastCanJump && !this.canJump)
		{
			this.relForces.walk.re = 0;
		}

		if (!this.lastCanJump && this.canJump)
		{
			if (this.walkLeft.isDown) this.walkLeft.press();
			if (this.walkRight.isDown) this.walkRight.press();
		}
		this.lastCanJump = this.canJump;
	}

	setSprite ()
	{
		const relVx = this.v.div(this.rotation).re;
		if (Math.abs(relVx) < 0.5)
		{
			this.sprite.animationSpeed = 0.1;
			this.image = "jerryIdle.json";
		} else
		{
			this.sprite.animationSpeed = Math.abs(relVx) / 16;
			this.image = "runningJerry.json";
		}

		let sign = Math.sign(relVx);
		sign == 0 ? sign = 1 : "";

		this.sprite.scale.x = sign;
	}

	updateDebugShapes ()
	{
		GameData.addDebugShape("hitbox", "circle", {
			x: this.x + this.radius,
			y: this.y + this.radius,
			radius: this.radius
		}, 0x00FF00);

		GameData.addDebugShape("coords", "circle", {
			x: this.x,
			y: this.y,
			radius: 3
		}, 0x00FF00);

		GameData.addDebugShape("spritePos", "circle", {
			x: this.sprite.x,
			y: this.sprite.y,
			radius: 3
		}, 0x00FFFF);

		GameData.debugShapes.collisionChunks = {};
		GameData.debugShapes.collisionChunks.shape = new PIXI.Graphics();
		GameData.debugShapes.collisionChunks.shape.lineStyle(4, 0xFF33FF, 1);
		this.collisionChunks.forEach((chunk) =>
		{
			GameData.debugShapes.collisionChunks.shape.drawRect(
				chunk.x * chunksize.x,
				chunk.y * chunksize.y,
				chunksize.x,
				chunksize.y);
		});
		GameData.debugShapes.collisionChunks.shape.endFill();

		GameData.debugShapes.coords.enabled = true;
		GameData.debugShapes.hitbox.enabled = true;
		GameData.debugShapes.canJump.enabled = false;
		GameData.debugShapes.viewport.enabled = false;
		GameData.debugShapes.spritePos.enabled = false;
		GameData.debugShapes.isFloating.enabled = false;
		GameData.debugShapes.collisionChunks.enabled = true;
	}

	setRotation ()
	{
		if (!this.disableGravity)
		{
			const closestPlanet = this.getClosestGravityObject();
			const relPos = closestPlanet.center.sub(this.center);

			this.rotation = new Complex({arg: relPos.arg(), abs: 1}).div(new Complex(0, 1));
		}
		else this.rotation = new Complex(1, 0);

		app.stage.rotation = -this.rotation.arg();
	}

	getFPS (delta)
	{
		const avgAmount = 10;
		if (this.fps.length >= avgAmount)
			this.fps.shift();
		this.fps.push(60 * delta);

		let total = 0;
		this.fps.forEach((value) =>
		{
			total += value;
		});
		return total / avgAmount;
	}

	setDebugScreen (delta)
	{
		GameData.debugScreen.rotation = this.rotation.arg();

		const offset = new Complex(16, -8);
		const corner = new Complex(viewport.corner.x, viewport.corner.y);
		const debugPos = offset.mul(this.rotation).div(viewport.scale.x).add(corner);

		GameData.debugScreen.x = debugPos.re;
		GameData.debugScreen.y = debugPos.im;

		const absA = this.getAbsA();
		const relA = this.getRelA();
		const relV = this.v.div(this.rotation);

		GameData.addDebugText("fps", this.getFPS(delta));
		GameData.addDebugText("zoom", viewport.scale.x);
		GameData.addDebugText("rotation", this.rotation.arg());
		GameData.addDebugText("");
		GameData.addDebugText("relA", relA.re, relA.im);
		GameData.addDebugText("relV", relV.re, relV.im);
		GameData.addDebugText("");
		GameData.addDebugText("a", absA.re, absA.im);
		GameData.addDebugText("v", this.v.re, this.v.im);
		GameData.addDebugText("d", this.x, this.y);

		GameData.debugScreen.text = "";

		GameData.debugText.forEach((element) =>
		{
			GameData.debugScreen.text += element;
		});

		GameData.debugScreen.scale.set(1.5 / viewport.scale.x);
		GameData.debugText = [];
	}

	updateViewport ()
	{
		const pos = new Complex(this.x + this.radius, this.y + this.radius);

		const camCorner = new Complex(
			-viewport.worldScreenWidth / 2,
			-viewport.worldScreenHeight / 2);

		const offset = pos.add(camCorner.mul(this.rotation));

		viewport.corner = {x: offset.re, y: offset.im};

		GameData.addDebugShape("viewportCenter", "circle", {
			x: viewport.center.x,
			y: viewport.center.y,
			radius: 10
		}, 0xFFAA00);
		GameData.addDebugShape("viewport", "rectangle", {
			x: viewport.corner.x,
			y: viewport.corner.y,
			width: viewport.worldScreenWidth,
			height: viewport.worldScreenHeight
		}, 0xFFAA00);
	}
}

Loader.objectTypes.push(Strawberry);

