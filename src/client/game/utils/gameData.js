class GameData
{
	static gameObjects = {};
	static nameIdMap = {};

	static gameChunks = {};

	static gameSprites = {};
	static spriteOffsets = {};

	static idGeneratorId = 0;

	static genId ()
	{
		this.idGeneratorId++;
		return this.idGeneratorId;
	}

	static storeObject (object, name)
	{
		const id = this.genId();
		object.id = id;
		this.gameObjects[id] = object;

		this.nameIdMap[name] ? this.nameIdMap[name].push(id) : this.nameIdMap[name] = [id];
		return id;
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
			return {x: 0, y: 0};
		}
	}

	static setSpriteOffset (name, x, y)
	{
		this.spriteOffsets[name] = {x: x, y: y};
	}

	static onCreate ()
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
}
