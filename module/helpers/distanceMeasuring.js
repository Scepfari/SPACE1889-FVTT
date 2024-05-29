export default class DistanceMeasuring
{

static measureDistances(segments, options = {})
{
	if (!options.gridSpaces)
		return BaseGrid.prototype.measureDistances.call(this, segments, options);

	const gridPxSize = canvas.dimensions.size;

	return segments.map(s =>
	{
		let r = s.ray;
		const gridDistance = r.distance / gridPxSize;
		const worldDistance = gridDistance * canvas.dimensions.distance;
		return worldDistance;
	});
}

/**
 * 
 * @param {object} start //start.x, start.y
 * @param {object} end //end.x, end.y
 * @returns {number}
 */
	static getPixelDistance(start, end)
	{
		let ray = new Ray(start, end);
		return ray.distance;
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

	static getDistanceInfo(sourceToken, target, isCloseCombatCheck = true)
	{
		if (sourceToken == undefined || target == undefined)
		{
			return { distance: (isCloseCombatCheck ? this.getCloseCombatRange() : 1.6), unit: canvas.scene.grid.units, xGridDistance: 0, yGridDistance: 0, isCloseCombatRange: isCloseCombatCheck };
		}

		const targetTile = this.getNearestTileInToken(target, sourceToken);
		if (targetTile == undefined)
			return Number.POSITIVE_INFINITY;

		let ray = new Ray(sourceToken, targetTile);
		const deltaXinGridTiles = ray.dx / this.getGridPixelSize();
		const deltaYinGridTiles = ray.dy / this.getGridPixelSize();

		const tileDistance = targetTile.distance / this.getGridPixelSize();
		let distance = tileDistance * this.getGridWorldSize();
		const elevationDifference = Math.abs(sourceToken.elevation - target.elevation);

		const isCloseCombatRange = this.isCloseCombatRange(distance, elevationDifference, deltaXinGridTiles, deltaYinGridTiles, isCloseCombatCheck);

		if (elevationDifference !== 0 && !isCloseCombatRange)
			distance = Math.sqrt(Math.pow(elevationDifference, 2) + Math.pow(distance, 2));

		if (isCloseCombatRange && distance > this.getCloseCombatRange())
			distance = this.getCloseCombatRange();

		return { distance: distance, unit: canvas.scene.grid.units, xGridDistance: Math.abs(deltaXinGridTiles), yGridDistance: Math.abs(deltaYinGridTiles), isCloseCombatRange: isCloseCombatRange }
	}

	static isCloseCombatRange(distance, elevationDifference, xGridTileDistance, yGridTileDistance, isCloseCombat)
	{
		const closeCombatRange = this.getCloseCombatRange();
		let isCloseCombatRange = distance <= closeCombatRange && elevationDifference <= closeCombatRange;
		
		if (!isCloseCombatRange)
		{
			if ((isCloseCombat && elevationDifference <= this.getGridWorldSize()) || //nahkampfcheck
				(this.getGridWorldSize() <= closeCombatRange && elevationDifference <= closeCombatRange)) //fernkampfcheck
				isCloseCombatRange = this.isNeighborTile(xGridTileDistance, yGridTileDistance);
		}

		return isCloseCombatRange;
	}

	static isNeighborTile(xGridTileDistance, yGridTileDistance)
	{
		return Math.abs(xGridTileDistance) <= 1.0 && Math.abs(yGridTileDistance) <= 1.0
	}

	static getCloseCombatRange()
	{
		return 1.5;
	}
}