export default class TurnMarker {
	constructor() {
		if (canvas.tokens[this.containerName] && !canvas.tokens[this.containerName].container.destroyed)
			canvas.tokens[this.containerName].Destroy(true);
		this.token;
		this.container = new PIXI.Container();
		this.container.filters = [];
		if (this.filter)
			this.container.filters.push(this.filter);
		this.targetAbove = false;
		this.img = this.markerImg;
		this.speed = 0.5; //game.settings.get("space1889", "combatMarkerSpeed") / 10;
		this.alpha = game.settings.get("space1889", "combatMarkerTransparency");
		this.sprite = new PIXI.Sprite.from(this.img);
		this.sprite.alpha = this.alpha;
		this.sprite.width=400
		this.sprite.height=400
		this.baseScale = this.sprite.scale.x
		this.sprite.anchor.set(0.5, 0.5);
		this.container.addChild(this.sprite);
		Object.defineProperty(this.container, "visible", {
			get() {
				return game.combat?.started;
			},
		});
		this.setGlobal();
		this.setAnimation();
		this.MoveToCombatant();
	}

	setAnimation()
	{
		let _this = this;
		function Animate() 
		{
			if (_this.sprite._destroyed || !_this.sprite) 
			{
				canvas.app.ticker.remove(Animate);
				if (!_this.sprite.reallyDestroy) new _this.TM_Class();
			}
			else
			{
				if (_this.container.visible)
					_this.sprite.rotation += 0.01 * _this.speed;
			}
		}
		canvas.app.ticker.add(Animate);
	}

	get filter(){}

	get markerImg()
	{
		return game.settings.get("space1889", "combatMarkerImagePath");
	}

	get TM_Class() 
	{
		return TurnMarker
	}

	get containerName() 
	{
		return "Space1889TurnMarker";
	}

	setGlobal()
	{
		this.container.name = this.containerName;
		canvas.tokens.Space1889TurnMarker = this;
	}

	Move(token) 
	{
		this.token = token;
		if (!token)
			return;
		token.addChildAt(this.container, 0);
		this.Update();
	}

	Destroy(reallyDestroy) 
	{
		if (this.token) 
		{
			let child = this.token.children.find((c) => c.name === this.containerName);
			this.token.removeChild(child);
		}
		this.sprite.reallyDestroy = reallyDestroy;
		this.sprite.destroy();
		this.container.destroy();
		canvas.tokens[this.containerName] = null;
	}

	Update() 
	{
		if (this.container._destroyed) return;
		this.container.x = this.token.w / 2;
		this.container.y = this.token.h / 2;
		this.sprite.width = canvas.dimensions.size * 1.4 * this.tokenScale
		this.sprite.height = canvas.dimensions.size * 1.4 * this.tokenScale
	}

	MoveToCombatant() 
	{
		if (this.container.destroyed)
			return;

		if (!game.combat)
		{
			this.Destroy(true);
			return;
		}

		const combatTokenId = game.combat?.combatant?.token?.id;
		let token = canvas.tokens.get(combatTokenId);
		if (!token && game.combat.scene == null)
		{
			if (game.combat.combatant.token.actorLink)
			{
				for (let canvasToken of canvas.tokens.documentCollection)
				{
					if (canvasToken.actorLink && canvasToken.actorId == game.combat.combatant.token.actorId)
					{
						token = canvas.tokens.get(canvasToken._id)
						break;
					}
				}
			}
			else
			{
				for (let canvasToken of canvas.tokens.documentCollection)
				{
					if (!canvasToken.actorLink && canvasToken.name == game.combat.combatant.token.name)
					{
						token = canvas.tokens.get(canvasToken._id)
						break;
					}
				}
			}
		}
		
		if (token && this.id !== token.id) 
			this.Move(token);
		else if (!token)
			this.Destroy(true);
	}

	get tokenScale() 
	{
		return Math.max(this.token.document.width, this.token.document.height);
	}

	get tokenId()
	{
		return this.token?.id;
	}
}
