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
	jumpHeight = 10;
	gravity = 0.5;
	gravityObjects = {planet: GameData.getObjectFromName("planet")};
	applyGravity = true;
	isFloating = true;

	followerOffset = {x: 0, y: -32};

	disableGravity = false;
	fps = [];
	debugShapes = {};
	debugScreen;
	constructor ()
	{
		const properties =
		{
			x: 96,
			y: 96,
			radius: 40,
			applyPhisics: true,
			static: false,
			bounce: false,
			drag: 0.01
		};
		super(Strawberry.name, properties, GameData.getSprite(`jerryIdle.json`));

		this.sprite.animationSpeed = 0.2;
		this.sprite.anchor.x = 0.52;
		// this.sprite.anchor.set(0.5);
		this.walkSetup();

		const style = new PIXI.TextStyle({
			fontSize: 12,
			fill: "white",
		});
		this.debugScreen = new PIXI.Text("", style);
	}

	drawDebugScreen ()
	{
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
		this.relForces.walk = {x: 0, y: 0};
		this.toggleGravity.press = () =>
		{
			if (this.disableGravity) this.disableGravity = false;
			else this.disableGravity = true;
		};

		this.walkUp.press = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.y += -this.speed;
				// this.relAy += -this.speed;
			} else
			{
				if (!this.isFloating)
				{
					this.relVy += -this.jumpHeight;
					sounds["game/sounds/Boing.mp3"].play();
				}
			}
		};

		this.walkUp.release = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.y = 0;
				// this.relAy = 0;
				if (this.walkDown.isDown) this.walkDown.press();
			}
		};

		this.walkLeft.press = () =>
		{
			this.relForces.walk.x += -this.speed;
			// this.relAx += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.relForces.walk.x = 0;
			// this.relAx = 0;
			if (this.walkRight.isDown) this.walkRight.press();
		};

		this.walkDown.press = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.y += this.speed;
				// this.relAy += this.speed;
			}
		};

		this.walkDown.release = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.y = 0;
				// this.relAy = 0;
				if (this.walkUp.isDown) this.walkUp.press();
			}
		};

		this.walkRight.press = () =>
		{
			this.relForces.walk.x += this.speed;
			// this.relAx += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.relForces.walk.x = 0;
			// this.relAx = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step (delta)
	{
		this.deleteDebugShapes();
		super.step(delta);
		this.checkFloating();

		const pos = new Complex(this.x, this.y);

		const camCenter = new Complex(
			viewport.screenWidthInWorldPixels / 2,
			viewport.screenHeightInWorldPixels / 2);

		this.followerOffset = pos.add(camCenter.neg().mul(this.rotation).add(camCenter));

		GameData.getObjectFromName("follower").x = this.followerOffset.re;
		GameData.getObjectFromName("follower").y = this.followerOffset.im;

		// const w = viewport.screenWidthInWorldPixels;
		// const h = viewport.screenHeightInWorldPixels;

		// const angle = Math.atan(h / w);
		// const rad = Math.sqrt(h * h + w * w) / 2;

		// this.followerOffset.x = -Math.cos(this.rotation + angle) * rad + w / 2;
		// this.followerOffset.y = -Math.sin(this.rotation + angle) * rad + h / 2;

		// GameData.getObjectFromName("follower").x = this.x + this.followerOffset.x;
		// GameData.getObjectFromName("follower").y = this.y + this.followerOffset.y;

		if (!this.disableGravity)
		{
			const relPos = new Complex(
				this.gravityObjects["planet"].centerX - this.centerX,
				this.gravityObjects["planet"].centerY - this.centerY);

			this.rotation = new Complex({arg: relPos.arg(), abs: 1})
				.mul(Complex.I.neg());

			// const relPos = {};

			// relPos.x = this.gravityObjects["planet"].centerX - this.centerX;
			// relPos.y = this.gravityObjects["planet"].centerY - this.centerY;

			// if (relPos.y > 0)
			// {
			// 	this.rotation = -Math.atan(relPos.x / relPos.y);
			// }
			// else if (relPos.y < 0)
			// 	this.rotation = -Math.atan(relPos.x / relPos.y) + Math.PI;

		} else this.rotation = Complex.ONE;

		app.stage.rotation = -this.rotation.arg();

		function round (number)
		{
			return Math.round(number * 100) / 100;
		}

		let resultAx = 0, resultAy = 0;

		// resultAx += this.relAx * Math.cos(this.rotation);
		// resultAx += this.relAy * Math.sin(this.rotation);
		// resultAy += this.relAx * Math.sin(this.rotation);
		// resultAy += this.relAy * Math.cos(this.rotation);

		const avgAmount = 10;
		if (this.fps.length >= avgAmount)
			this.fps.shift();
		this.fps.push(60 * delta);

		let total = 0;
		this.fps.forEach((value) =>
		{
			total += value;
		});

		const absA = this.getAbsA();
		const relA = this.getRelA();

		this.debugScreen.text = `
			fps: ${round(total / avgAmount)}\n
			relA: ${round(relA.re)}, ${round(relA.im)}\n
			relV: ${round(this.relVx)}, ${round(this.relVy)}\n
			a: ${round(absA.re)}, ${round(absA.im)} \n
			v: ${round(this.vx)}, ${round(this.vy)}\n
			d: ${round(this.x)}, ${round(this.y)}`;



		if (Math.abs(this.relVx) < 0.5)
		{
			this.sprite.animationSpeed = 0.1;
			this.image = "jerryIdle.json";
		} else
		{
			this.sprite.animationSpeed = Math.abs(this.relVx) / 16;
			this.image = "runningJerry.json";
		}

		let sign = Math.sign(this.relVx);
		sign == 0 ? sign = 1 : "";

		this.sprite.scale.x = sign;

		this.debugScreen.rotation = this.rotation.arg();
		this.debugScreen.x = viewport.corner.x;
		this.debugScreen.y = viewport.corner.y;

		// if (!this.disableGravity)
		// {
		this.setGravity();
		// } else
		// {
		// 	Object.keys(this.gravityObjects).forEach(objectName =>
		// 	{
		// 		this.forces.x[objectName + "Gravity"] = 0;
		// 		this.forces.y[objectName + "Gravity"] = 0;
		// 	});
		// 	this.rotation = Complex.ONE;
		// }

		const follower = GameData.getObjectFromName("follower");
		this.addDebugShape("follower", "circle", {
			x: follower.x + this.radius,
			y: follower.y + this.radius,
			radius: this.radius / 2
		}, 0xFFAA00);

		this.addDebugShape("hitbox", "circle", {
			x: this.x + this.radius,
			y: this.y + this.radius,
			radius: this.radius
		}, 0x00FF00);

		this.addDebugShape("coords", "circle", {
			x: this.x,
			y: this.y,
			radius: 3
		}, 0x00FF00);

		this.addDebugShape("spritePos", "circle", {
			x: this.sprite.x,
			y: this.sprite.y,
			radius: 3
		}, 0x00FFFF);

		this.debugShapes.collisionChunks = {};
		this.debugShapes.collisionChunks.shape = new PIXI.Graphics();
		this.debugShapes.collisionChunks.shape.lineStyle(4, 0xFF33FF, 1);
		this.collisionChunks.forEach((chunk) =>
		{
			this.debugShapes.collisionChunks.shape.drawRect(
				chunk.x * chunksize.x,
				chunk.y * chunksize.y,
				chunksize.x,
				chunksize.y);
		});
		this.debugShapes.collisionChunks.shape.endFill();

		this.debugShapes.coords.enabled = true;
		this.debugShapes.hitbox.enabled = true;
		this.debugShapes.spritePos.enabled = true;
		this.debugShapes.follower.enabled = true;
		this.debugShapes.isFloating.enabled = true;
		this.debugShapes.collisionChunks.enabled = true;

		this.drawDebugShapes();
	}

	addDebugShape (name, shape, pos, colour)
	{
		this.debugShapes[name] = {};
		this.debugShapes[name].shape = new PIXI.Graphics();
		this.debugShapes[name].shape.lineStyle(2, colour, 1);

		if (shape == "circle")
			this.debugShapes[name].shape.drawCircle(
				pos.x,
				pos.y,
				pos.radius);

		else if (shape == "rectangle")
			rect.drawRect(pos.x, pos.y, pos.width, pos.height);

		this.debugShapes[name].shape.endFill();
	}

	checkFloating ()
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

		this.isFloating = true;

		const hitBox = {x: this.x - 2, y: this.y - 2, radius: this.radius + 2, isSprite: true, name: "hitBox"};

		collisionCandidates.forEach(object =>
		{
			if (bump.hit(hitBox, object))
			{
				this.isFloating = false;
			}
		});

		this.addDebugShape("isFloating", "circle", {
			x: hitBox.x + hitBox.radius,
			y: hitBox.y + hitBox.radius,
			radius: hitBox.radius
		}, 0x0000FF);
	}

	setGravity ()
	{
		if (this.isFloating && !this.disableGravity)
		{
			Object.keys(this.gravityObjects).forEach(objectName =>
			{
				const thisCenter = new Complex(this.centerX, this.centerY);
				const gravityCenter = new Complex(
					this.gravityObjects[objectName].centerX,
					this.gravityObjects[objectName].centerY);

				const distance = gravityCenter.sub(thisCenter).abs();
				const gravForce = (this.gravityObjects["planet"].mass * this.mass) / Math.pow(distance, 2);

				this.relForces[objectName + "Gravity"] = {x: 0, y: gravForce};

				// const relPos = {};

				// relPos.x = this.gravityObjects[objectName].centerX - this.centerX;
				// relPos.y = this.gravityObjects[objectName].centerY - this.centerY;

				// const distance = Math.sqrt(relPos.x * relPos.x + relPos.y * relPos.y);

				// const gravityConstant = 1;
				// const gravForce = (gravityConstant * this.gravityObjects["planet"].mass * this.mass) / Math.pow(distance, 2);

				// const dx = relPos.x / distance;
				// const dy = relPos.y / distance;

				// const gravX = gravForce * dx;
				// const gravY = gravForce * dy;

				// this.forces.x[objectName + "Gravity"] = gravX;
				// this.forces.y[objectName + "Gravity"] = gravY;
			});
		} else
		{
			Object.keys(this.gravityObjects).forEach(objectName =>
			{
				this.relForces[objectName + "Gravity"] = {x: 0, y: 0};

				// this.forces.x[objectName + "Gravity"] = 0;
				// this.forces.y[objectName + "Gravity"] = 0;
			});
		}
	}

	deleteDebugShapes ()
	{

		Object.keys(this.debugShapes).forEach((shapeName) =>
		{
			viewport.removeChild(this.debugShapes[shapeName].shape);
			// this.debugShapes[shapeName].shapes.forEach((shape) =>
			// {
			// 	viewport.removeChild(shape);
			// });
		});
	}

	drawDebugShapes ()
	{
		Object.keys(this.debugShapes).forEach((shapeName) =>
		{
			if (this.debugShapes[shapeName].enabled)
			{
				viewport.addChild(this.debugShapes[shapeName].shape);
				// this.debugShapes[shapeName].shapes.forEach((shape) =>
				// {
				// 	viewport.addChild(shape);
				// });
			}
		});
	}
}

Loader.objectTypes.push(Strawberry);

