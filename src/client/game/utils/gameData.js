class GameData
{
	static gameObjects = {};
	static nameIdMap = {};
	static planetIdArray = [];

	static gameChunks = {};

	static gameSprites = {};
	static spriteOffsets = {};

	static idGeneratorId = 0;

	static frame = 0;

	static debugShapes = {};
	static debugScreen;
	static debugText = [];


	static drawDebugScreen ()
	{
		viewport.addChild(this.debugScreen);
	}

	static addDebugText (name, ...args)
	{
		function round (number, digits)
		{
			if (typeof number == "string") return number;
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

	static deleteDebugShapes ()
	{

		Object.keys(this.debugShapes).forEach((shapeName) =>
		{
			viewport.removeChild(this.debugShapes[shapeName].shape);
			this.debugShapes[shapeName].shape.destroy();
			delete this.debugShapes[shapeName];
		});
	}

	static drawDebugShapes ()
	{
		Object.keys(this.debugShapes).forEach((shapeName) =>
		{
			if (this.debugShapes[shapeName].enabled)
			{
				viewport.addChild(this.debugShapes[shapeName].shape);
			}
		});
	}

	static addDebugShape (name, type, data, colour, rotation = 0)
	{
		this.debugShapes[name] = {};

		switch (type)
		{
			case "circle":
				this.debugShapes[name].shape = new PIXI.Graphics();
				this.debugShapes[name].shape.lineStyle(2, colour, 1);

				this.debugShapes[name].shape.drawCircle(0, 0,
					data.radius);
				this.debugShapes[name].shape.endFill();
				break;

			case "rectangle":
				this.debugShapes[name].shape = new PIXI.Graphics();
				this.debugShapes[name].shape.lineStyle(2, colour, 1);

				this.debugShapes[name].shape.drawRect(0, 0,
					data.width,
					data.height);
				this.debugShapes[name].shape.endFill();
				break;

			// deno-lint-ignore no-case-declarations
			case "text":
				const style = new PIXI.TextStyle({
					fontSize: 12,
					fill: colour,
				});
				this.debugShapes[name].shape = new PIXI.Text(
					data.text
					, style);
				break;
		}
		this.debugShapes[name].shape.x = data.x;
		this.debugShapes[name].shape.y = data.y;

		this.debugShapes[name].shape.rotation = rotation;
	}

	static genId ()
	{
		this.idGeneratorId++;
		return this.idGeneratorId;
	}

	static storeObject (object, name)
	{
		// const id = this.genId();
		// object.id = id;
		this.gameObjects[object.id] = object;

		this.nameIdMap[name] ? this.nameIdMap[name].push(object.id) : this.nameIdMap[name] = [object.id];
		return object.id;
	}

	static getObjectFromId (id)
	{
		return this.gameObjects[id];
	}

	static getObjectFromName (name, index = 0)
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);

		return this.getObjectFromId(this.nameIdMap[name][index]);
	}

	static getObjectArrayFromName (name)
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);

		const objectArray = [];
		this.nameIdMap[name].forEach((id) =>
		{
			objectArray.push(this.getObjectFromId(id));
		});
		return objectArray;
	}

	static putObjectInChunk (id, coord)
	{
		const chunk = this.gameChunks[coord.str()];
		chunk ? chunk.add(id) : this.gameChunks[coord.str()] = new Set([id]);
	}

	static removeObjectFromChunk (id, coord)
	{
		if (this.gameChunks[coord.str()])
			delete this.gameChunks[coord.str()][id];
	}

	static getObjectsInChunk (coord)
	{
		return this.gameChunks[coord.str()];
	}

	static getSprite (name)
	{
		return this.gameSprites[`game/sprites/${name}`];
	}

	static getSpriteOffset (name)
	{
		const offset = this.spriteOffsets[name];
		if (offset)
		{
			return offset;
		} else
		{
			return Complex.ZERO;
		}
	}

	static setSpriteOffset (name, x, y)
	{
		this.spriteOffsets[name] = new Complex(x, y);
	}

	static loadSprites ()
	{
		Object.keys(app.loader.resources).forEach(spritePath =>
		{
			const type = spritePath.split(".")[1];
			if (type == "json")
			{
				this.gameSprites[spritePath] = [];
				const tilesetObject = app.loader.resources[spritePath].textures;

				Object.keys(tilesetObject).forEach(image =>
				{
					this.gameSprites[spritePath].push(tilesetObject[image]);
				});
			}
			else
				this.gameSprites[spritePath] = [app.loader.resources[spritePath].texture];
		});
	}

	static updateAllChunks ()
	{
		Object.keys(this.gameObjects).forEach(id =>
		{
			if (!this.gameObjects[id].updateChunk) return;
			this.gameObjects[id].updateChunk();
		});
	}

	static setGravityObject (id)
	{
		this.planetIdArray.push(id);
	}

	static forEachGravityObject (func)
	{
		this.planetIdArray.forEach((id) =>
		{
			func(this.getObjectFromId(id));
		});
	}
}
