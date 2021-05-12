class Strawberry extends GameObject
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
	gravity = 0.5;
	gravityObjects = {planet: GameData.getObjectFromName("planet")};
	applyGravity = true;
	isFloating = true;

	disableGravity = false;
	fps = [];
	debugShapes = {};
	debugScreen;
	debugText = [];

	constructor ()
	{
		const properties =
		{
			x: 96,
			y: 96,
			radius: 30,
			applyPhisics: true,
			static: false,
			bounce: false,
			drag: 0.01
		};
		super(Strawberry.name, properties, GameData.getSprite(`jerryIdle.json`));

		this.sprite.animationSpeed = 0.2;
		this.sprite.anchor.x = 0.52;
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
				if (this.walkDown.isDown) this.walkDown.press();
			}
		};

		this.walkLeft.press = () =>
		{
			this.relForces.walk.x += -this.speed;
		};

		this.walkLeft.release = () =>
		{
			this.relForces.walk.x = 0;
			if (this.walkRight.isDown) this.walkRight.press();
		};

		this.walkDown.press = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.y += this.speed;
			}
		};

		this.walkDown.release = () =>
		{
			if (this.disableGravity)
			{
				this.relForces.walk.y = 0;
				if (this.walkUp.isDown) this.walkUp.press();
			}
		};

		this.walkRight.press = () =>
		{
			this.relForces.walk.x += this.speed;
		};

		this.walkRight.release = () =>
		{
			this.relForces.walk.x = 0;
			if (this.walkLeft.isDown) this.walkLeft.press();
		};
	}

	step (delta)
	{
		super.step(delta);

		this.deleteDebugShapes();

		this.setRotation();
		this.updateSprite();
		this.updateViewport();

		this.checkFloating();
		this.setGravity();

		this.setDebugScreen(delta);

		this.updateDebugShapes();
		this.drawDebugShapes();
	}

	updateSprite ()
	{
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
			this.debugShapes[name].shape.drawRect(pos.x, pos.y, pos.width, pos.height);

		this.debugShapes[name].shape.endFill();
	}

	updateDebugShapes ()
	{
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
		this.debugShapes.viewport.enabled = true;
		this.debugShapes.spritePos.enabled = true;
		this.debugShapes.isFloating.enabled = true;
		this.debugShapes.collisionChunks.enabled = true;
	}

	setRotation ()
	{
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

	addDebugText (name, ...args)
	{
		function round (number, digits)
		{
			const factor = digits ? Math.pow(10, digits) : 100;
			return Math.round(number * factor) / factor;
		}

		let text = `\n${name}: `;

		args.forEach((element, i) =>
		{
			text += round(element);
			if (args[i + 1] !== undefined)
			{
				text += ", ";
			}
		});

		this.debugText.push(text);
	}

	setDebugScreen (delta)
	{
		this.debugScreen.rotation = this.rotation.arg();

		const offset = new Complex(16, -8);
		const corner = new Complex(viewport.corner.x, viewport.corner.y);
		const debugPos = offset.mul(this.rotation).div(viewport.scale.x).add(corner);

		this.debugScreen.x = debugPos.re;
		this.debugScreen.y = debugPos.im;

		const absA = this.getAbsA();
		const relA = this.getRelA();

		this.addDebugText("fps", this.getFPS(delta));
		this.addDebugText("zoom", viewport.scale.x);
		this.addDebugText("rotation", this.rotation.arg());
		this.addDebugText("");
		this.addDebugText("relA", relA.re, relA.im);
		this.addDebugText("relV", this.relVx, this.relVy);
		this.addDebugText("");
		this.addDebugText("a", absA.re, absA.im);
		this.addDebugText("v", this.vx, this.vy);
		this.addDebugText("d", this.x, this.y);

		this.debugScreen.text = "";

		this.debugText.forEach((element) =>
		{
			this.debugScreen.text += element;
		});

		this.debugScreen.scale.set(1.5 / viewport.scale.x);
		this.debugText = [];
	}

	updateViewport ()
	{
		const pos = new Complex(this.x + this.radius, this.y + this.radius);

		const camCorner = new Complex(
			-viewport.worldScreenWidth / 2,
			-viewport.worldScreenHeight / 2);

		const offset = pos.add(camCorner.mul(this.rotation));

		viewport.corner = {x: offset.re, y: offset.im};

		this.addDebugShape("viewportCenter", "circle", {
			x: viewport.center.x,
			y: viewport.center.y,
			radius: 10
		}, 0xFFAA00);
		this.addDebugShape("viewport", "rectangle", {
			x: viewport.corner.x,
			y: viewport.corner.y,
			width: viewport.worldScreenWidth,
			height: viewport.worldScreenHeight
		}, 0xFFAA00);
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

