export default class DistanceMeasuring
{

/**
 * 
 * @param {object} start //start.x, start.y
 * @param {object} end //end.x, end.y
 * @returns {number}
 */
	static getPixelDistance(start, end)
	{
		let ray = new Ray(start, end);
		return ray.distance
	}

	
	static getNearestTileInToken(token, target)
	{
		if (token.width <= 1 && token.height <= 1)
			return { x: token.x, y: token.y, distance: this.getPixelDistance(target, {x:token.x, y: token.y}) };

		const gridSize = canvas.scene.grid.size;

		const width = Math.ceil(token.width);
		const widthDelta = (token.width - width) * canvas.scene.grid.size;
		const height = Math.ceil(token.height);
		const heigthDelta = (token.height - height) * canvas.scene.grid.size;

		let tiles = [];
		for (let i = 0; i < width; ++i)
		{
			for (let j = 0; j < height; ++j)
			{
				const deltaX = (i == width - 1) ? widthDelta : 0;
				const deltaY = (j == height - 1) ? heigthDelta : 0;
				let tile = { x: token.x + (gridSize * i) + deltaX, y: token.y + (gridSize * j) + deltaY, distance: Number.POSITIVE_INFINITY };
				tile.distance = this.getPixelDistance(target, tile);
				tiles.push(tile);
			}
		}

		let wantedTile = { x: token.x, y: token.y, distance: Number.POSITIVE_INFINITY };
		for (const tile of tiles)
		{
			if (tile.distance < wantedTile.distance)
				wantedTile = tile;
		}
		return wantedTile;
	}

	static getGridPixelSize()
	{
		return canvas.scene.grid.size;
	}

	static getGridWorldSize()
	{
		return canvas.scene.grid.distance;
	}

	static getWorldDistance(source, target)
	{
		const targetTile = this.getNearestTileInToken(target, source);
		if (targetTile == undefined)
			return Number.POSITIVE_INFINITY;

		const tileDistance = targetTile.distance / this.getGridPixelSize();
		const distance = tileDistance * this.getGridWorldSize();
		return distance;
	}

	static getDistanceInfo(sourceToken, target)
	{
		const targetTile = this.getNearestTileInToken(target, sourceToken);
		if (targetTile == undefined)
			return Number.POSITIVE_INFINITY;

		let ray = new Ray(sourceToken, targetTile);
		const deltaXinGridTiles = ray.dx / this.getGridPixelSize();
		const deltaYinGridTiles = ray.dy / this.getGridPixelSize();

		const tileDistance = targetTile.distance / this.getGridPixelSize();
		const distance = tileDistance * this.getGridWorldSize();
		
		return { distance: distance, unit: canvas.scene.grid.units, xGridDistance: Math.abs(deltaXinGridTiles), yGridDistance: Math.abs(deltaYinGridTiles) }
	}
}