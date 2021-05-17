class MovingObject extends StaticObject
{
	v = new Complex(0, 0);
	a = new Complex(0, 0);

	mass;

	absForces = {};
	relForces = {};

	// isWalking = false;
	isFloating = true;
	lastCollisionObject;

	constructor (properties, textures)
	{
		super(properties, textures);
		this.mass = properties.mass || 1;
	}

	get relVx ()
	{
		return this.v.div(this.rotation).re;
	}

	set relVx (vx)
	{
		this.v = new Complex(vx, this.relVy).mul(this.rotation);
	}

	get relVy ()
	{
		return this.v.div(this.rotation).im;
	}

	set relVy (vy)
	{
		this.v = new Complex(this.relVx, vy).mul(this.rotation);
	}

	get vx ()
	{
		return this.v.re;
	}

	set vx (vx)
	{
		this.v.re = vx;
	}

	get vy ()
	{
		return this.v.im;
	}

	set vy (vy)
	{
		this.v.im = vy;
	}


	get ax ()
	{
		return this.a.re;
	}

	set ax (ax)
	{
		this.a.re = ax;
	}

	get ay ()
	{
		return this.a.im;
	}

	set ay (ay)
	{
		this.a.im = ay;
	}

	step (delta)
	{
		this.move(delta);

		this.checkFloating();
		this.setDrag();
		this.setGravity();
		this.applyFriction();

		this.updateChunk();
		this.fixCollision();
		this.updateSprite();
		this.setParentBody();

		this.drawDebugArrows();
	}

	applyFriction ()
	{
		// using Coulomb friction model
		if (!this.isFloating)
		{
			// 90 degrees to normal force; aka along the surface
			let angle = this.absForces.normal.arg() + Math.PI / 2;

			// length of the normal force
			const fNormal = this.absForces.normal.abs();

			// v and a component in this direction
			let vAngle = this.v.div(new Complex({arg: angle, abs: 1}));
			let aAngle = this.getAbsA().sub(this.absForces.friction).div(new Complex({arg: angle, abs: 1}));

			// flip angle to be in the direction we're moving
			if (vAngle.re < 0)
			{
				angle += Math.PI;
				vAngle = vAngle.neg();
				aAngle = aAngle.neg();
			}

			// static/kinetic friction depending on vAngle
			if (vAngle.re < 0.5 && aAngle.re < fNormal)
			{
				// static friction, this can never be greater than normal force

				// add a force that cancels all accaleration and thus movement
				this.absForces.friction = new Complex({arg: angle, abs: -aAngle.re * this.mass});

				// set v in this direction to zero, because we are not moving
				const rotation = new Complex({arg: angle, abs: 1});
				this.v = new Complex(0, this.v.div(rotation).im).mul(rotation);

				GameData.addDebugText("friction", "static");
			}
			else
			{
				//kinetic friction, this is less than the maximum static friction and somewhat constant

				this.absForces.friction = new Complex({arg: angle, abs: -fNormal * 0.5 * this.mass});
				GameData.addDebugText("friction", "kinetic");
			}
		} else
		{
			// reset friction when we're no longer touching the surface
			this.absForces.friction = new Complex(0, 0);
		}
	}

	drawDebugArrows ()
	{
		Object.keys(this.absForces).forEach(forceName =>
		{
			const force = this.absForces[forceName].mul(1000);
			GameData.addDebugShape(`${forceName}Arrow`, "rectangle", {
				x: this.center.re,
				y: this.center.im,
				height: 1,
				width: force.abs()
			}, 0xFF0000, force.arg());

			const textPos = this.center.add(force);
			GameData.addDebugShape(`${forceName}Text`, "text", {
				x: textPos.re,
				y: textPos.im,
				text: forceName
			}, 0xFF0000, this.rotation.arg());

			if (force.abs() > 1)
			{
				GameData.debugShapes[`${forceName}Arrow`].enabled = true;
				GameData.debugShapes[`${forceName}Text`].enabled = true;
			} else
			{
				GameData.debugShapes[`${forceName}Arrow`].enabled = false;
				GameData.debugShapes[`${forceName}Text`].enabled = false;
			}
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			const force = this.relForces[forceName].mul(1000).mul(this.rotation);
			GameData.addDebugShape(`${forceName}Arrow`, "rectangle", {
				x: this.center.re,
				y: this.center.im,
				height: 1,
				width: force.abs()
			}, 0xFF0000, force.arg());

			const textPos = this.center.add(force);
			GameData.addDebugShape(`${forceName}Text`, "text", {
				x: textPos.re,
				y: textPos.im,
				text: forceName
			}, 0xFF0000, this.rotation.arg());

			if (force.abs() > 1)
			{
				GameData.debugShapes[`${forceName}Arrow`].enabled = true;
				GameData.debugShapes[`${forceName}Text`].enabled = true;
			} else
			{
				GameData.debugShapes[`${forceName}Arrow`].enabled = false;
				GameData.debugShapes[`${forceName}Text`].enabled = false;
			}

		});

		const force = this.getAbsA().mul(1000);
		GameData.addDebugShape(`ResultingArrow`, "rectangle", {
			x: this.center.re,
			y: this.center.im,
			height: 1,
			width: force.abs()
		}, 0x0000FF, force.arg());

		const textPos = this.center.add(force);
		GameData.addDebugShape(`ResultingText`, "text", {
			x: textPos.re,
			y: textPos.im,
			text: "Result"
		}, 0x0000FF, this.rotation.arg());
		GameData.debugShapes.ResultingArrow.enabled = true;
		GameData.debugShapes.ResultingText.enabled = true;
	}

	move (delta)
	{
		Object.keys(this.absForces).forEach(forceName =>
		{
			this.v = this.v.add(this.absForces[forceName].mul(delta / this.mass));
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			this.v = this.v.add(this.relForces[forceName].mul(this.rotation).mul(delta / this.mass));
		});

		this.v = this.v.add(this.a.mul(delta));

		this.pos = this.pos.add(this.v.mul(delta));
	}

	fixCollision ()
	{
		const collisionCandidates = new Set();

		this.collisionChunks.forEach((chunkId) =>
		{
			const objects = GameData.getObjectsInChunk(chunkId);

			if (!objects) return;

			objects.forEach((objectId) =>
			{
				if (objectId != this.id)
				{
					const candidate = GameData.getObjectFromId(objectId);
					collisionCandidates.add(candidate);
				}
			});
		});

		if (collisionCandidates.size < 1) return;

		collisionCandidates.forEach((candidate) =>
		{
			bump.hit(this, candidate, true, false);
		});
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
				this.lastCollisionObject = object;
				this.isFloating = false;
			}
		});

		GameData.addDebugShape("isFloating", "circle", {
			x: hitBox.x + hitBox.radius,
			y: hitBox.y + hitBox.radius,
			radius: hitBox.radius
		}, 0x0000FF);
	}

	setDrag ()
	{
		if (!this.disableGravity)
		{
			GameData.forEachGravityObject(object =>
			{
				const distance = object.center.sub(this.center).abs();
				if (distance < object.atmosphereRadius)
				{
					const A = (this.radius * 2) || ((this.width + this.height) / 2);
					const d = object.atmosphereDensity;
					const v = this.v.abs();
					const force = d * v * v * A / 100000;

					this.absForces[object.constructor.name + "Atmosphere"] = new Complex({arg: this.v.arg(), abs: -force});
				} else
					this.absForces[object.constructor.name + "Atmosphere"] = new Complex(0, 0);
			});
		} else
		{
			GameData.forEachGravityObject(object =>
			{
				this.absForces[object.constructor.name + "Atmosphere"] = new Complex(0, 0);
			});
		}
	}

	setGravity ()
	{
		if (!this.disableGravity)
		{
			GameData.forEachGravityObject(object =>
			{
				const distance = object.center.sub(this.center).abs();
				const gravForce = (object.mass * this.mass) / Math.pow(distance, 2);

				this.relForces[object.constructor.name + "Gravity"] = new Complex(0, gravForce);
				if (!this.isFloating)
				{
					// const arg = this.center.sub(this.lastCollisionObject.center).arg();
					// this.absForces[object.constructor.name + "Normal"] = new Complex({arg: arg, abs: gravForce});
				}
				else
					this.absForces.normal = new Complex(0, 0);
			});
		} else
		{
			GameData.forEachGravityObject(object =>
			{
				this.relForces[object.constructor.name + "Gravity"] = new Complex(0, 0);
				this.absForces.normal = new Complex(0, 0);
			});
		}
	}

	getAbsA ()
	{
		let a = this.a;

		Object.keys(this.absForces).forEach(forceName =>
		{
			const absA = this.absForces[forceName].div(this.mass);
			a = a.add(absA);
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			const relA = this.relForces[forceName].div(this.mass);
			const absA = relA.mul(this.rotation);

			a = a.add(absA);
		});
		return a;
	}

	getRelA ()
	{
		let a = this.a;

		Object.keys(this.absForces).forEach(forceName =>
		{
			const absA = this.absForces[forceName].div(this.mass);
			const relA = absA.div(this.rotation);
			a = a.add(relA);
		});

		Object.keys(this.relForces).forEach(forceName =>
		{
			const relA = this.relForces[forceName].div(this.mass);

			a = a.add(relA);
		});
		return a;
	}

	setParentBody ()
	{
		let leastDistance;
		let id;
		GameData.forEachGravityObject((gravityObject) =>
		{
			const distance = gravityObject.center.sub(this.center).abs();

			if (!leastDistance || distance < leastDistance)
			{
				leastDistance = distance;
				id = gravityObject.id;
			}
		});

		this._distance = leastDistance;
		this.parentBody = id ? GameData.getObjectFromId(id) : undefined;
	}
}
