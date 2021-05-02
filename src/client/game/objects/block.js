class Block extends GameObject
{
	constructor ()
	{
		super("block");
		this.sprite = [];
	}

	onLoad ()
	{
		const rectangle = new PIXI.Graphics();
		// rectangle.lineStyle(4, 0x000000, 1);
		rectangle.beginFill(0x000000);
		rectangle.wth = 512;
		rectangle.hgt = 16;
		rectangle.drawRect(0, 0, rectangle.wth, rectangle.hgt);
		rectangle.endFill();
		rectangle.x = 32;
		rectangle.y = 256;

		this.sprite.push(rectangle);
	}

	onCreate () {}

	isAtPos (x, y)
	{
		let col = false;
		this.sprite.forEach(shape =>
		{
			const xCol = x >= shape.x && x < shape.x + shape.wth;
			const yCol = y >= shape.y && y < shape.y + shape.hgt;
			if (xCol && yCol) col = true;
			// console.log(`x: ${x}, y: ${y}, shape.x: ${shape.x}, shape.y: ${shape.y}, width: ${shape.wth}, height: ${shape.hgt}`);
		});
		return col;
	}
}
