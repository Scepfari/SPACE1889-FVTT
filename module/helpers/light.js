import SPACE1889Time from "./time.js";
import SPACE1889Helper from "./helper.js";

export default class SPACE1889Light
{
	static timePasses()
	{
		if (!game.user.isGM || !SPACE1889Time.isSimpleCalendarEnabled())
			return;

		const currentTimeStamp = SPACE1889Time.getCurrentTimestamp();
		const list = game.actors.filter(e => e.type === "character");
		for (const actor of list)
		{
			for (const lightSource of actor.system.lightSources)
			{
				this._refreshLightSourceByTime(currentTimeStamp, lightSource, actor, undefined);
			}
		}

		for (const token of game.scenes.viewed.tokens)
		{
			if (token.actorLink && token.actor.type === "character")
				continue;

			for (const lightSource of token.actor.system.lightSources)
			{
				this._refreshLightSourceByTime(currentTimeStamp, lightSource, token.actor, token);
			}
		}

		for (const light of game.scenes.viewed.lights)
		{
			if (!light.flags.space1889?.timestamp || !light.flags.space1889?.remainingTime)
				continue;

			const timeDeltaInMinutes = Math.max(0, Number(SPACE1889Time.getTimeDifInSeconds(currentTimeStamp, light.flags.space1889?.timestamp))) / 60;
			if (light.flags.space1889.remainingTime < timeDeltaInMinutes)
			{
				// Licht ausschalten
				this._hideSceneLightAndRemoveFlag(light);
			}
		}
	}

	static _refreshLightSourceByTime(timeStamp, lightSource, actor, token)
	{
		if (!lightSource.system.isActive || lightSource.system.emissionStartTimestamp === 0 || this.isPermanentlyUsable(lightSource))
			return false;

		const timeDelta = Number(SPACE1889Time.getTimeDifInSeconds(timeStamp, lightSource.system.emissionStartTimestamp));
		const usedDuration = Number(lightSource.system.usedDuration) + (timeDelta / 60.0);
		if (usedDuration >= lightSource.system.duration)
		{
			this._deactivateLightSourceByTime(lightSource, actor, token);
			return true;
		}
		return false;
	}

	static async _hideSceneLightAndRemoveFlag(light)
	{
		if (!light)
			return;

		await light.update({
			"hidden": true
		});
		await light.unsetFlag("space1889", "timestamp");
	}

	static async _deactivateLightSourceByTime(lightSource, actor, token)
	{
		let newQuantity = lightSource.system.quantity;
		const isConsumables = lightSource.system.itemUseType === "consumables";
		const usedDuration = isConsumables? 0 : lightSource.system.duration;
		let startTimestamp = lightSource.system.emissionStartTimestamp;
		if (isConsumables)
		{
			newQuantity = Math.max(0, newQuantity - 1);
			startTimestamp = 0;
		}

		const delta = Math.max(0, lightSource.system.duration - lightSource.system.usedDuration) * 60;
		let emissionEndTimeStamp = lightSource.system.emissionStartTimestamp + delta;

		await lightSource.update({
			"system.isActive": false,
			"system.usedDuration": usedDuration,
			"system.emissionStartTimestamp": startTimestamp,
			"system.quantity": newQuantity,
			"system.usedHands": isConsumables ? "none" : lightSource.system.usedHands
		});

		let tokens = game.scenes.active.tokens.filter(e => e.actorId === actor.id);
		if (token)
			this._resetTokenLight(token, actor?.prototypeToken);
		else
		{
			for (let tok of tokens)
			{
				this._resetTokenLight(tok, actor?.prototypeToken);
			}
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.formatTimeDate(SPACE1889Time.getTimeAndDate(emissionEndTimeStamp)) : "";
		const messageContent = game.i18n.format("SPACE1889.LightGoesOut", { "lightSource": lightSource.system.label, "name": token ? token.name : actor.name, "time": timeAsString });
		let chatData =
		{
			user: game.user.id,
			//speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static async deactivateLightSource(lightSource, actor)
	{
		if (SPACE1889Time.isSimpleCalendarEnabled() && !lightSource.system.interruptible)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotDeActivateLightSource", { "name": lightSource.system.label }));
			return;
		}

		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		const usedDuration = this.calcUsedDuration(lightSource);

		await lightSource.update({
			"system.isActive": false,
			"system.usedDuration": usedDuration,
			"system.emissionStartTimestamp": 0
		});

		let tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			if (token)
				this._resetTokenLight(token, game.actors.get(actor._id)?.prototypeToken);
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.getCurrentTimeDateString() : "";
		const messageContent = game.i18n.format("SPACE1889.LightSwitchOff", { "lightSource": lightSource.system.label, "name": actor.name, "time": timeAsString });
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static getEnergySymbol(lightSource)
	{
		if (this.isPermanentlyUsable(lightSource))
			return "fa fa-battery-full";

		const fillLevel = this.calcAndGetRemainingTime(lightSource) / lightSource.system.duration;
		if (fillLevel <= 0)
			return "fa fa-battery-empty";
		if (fillLevel <=0.25)
			return "fa fa-battery-quarter";
		if (fillLevel <= 0.5)
			return "fa fa-battery-half";
		if (fillLevel <= 0.75)
			return "fa fa-battery-three-quarters";
		return "fa fa-battery-full";
	}

	static isPermanentlyUsable(item)
	{
		return item?.system?.itemUseType === "permanentlyUsable";
	}

	static calcAndGetRemainingTime(lightSource)
	{
		if (this.isPermanentlyUsable(lightSource))
			return lightSource.system.duration;

		return Math.max(0, lightSource.system.duration - this.calcUsedDuration(lightSource));
	}

	static calcUsedDuration(item)
	{
		if (!item || (item.type !== "lightSource" && item.type !== "vision") )
			return 0;

		let timeDelta = 0.0;
		if (SPACE1889Time.isSimpleCalendarEnabled() && item.system.emissionStartTimestamp !== 0)
			timeDelta = Number(SPACE1889Time.getTimeDifInSeconds(SPACE1889Time.getCurrentTimestamp(), item.system.emissionStartTimestamp));

		return Number(item.system.usedDuration) + (timeDelta / 60.0);
	}

	static async _resetTokenLight(token, prototypeToken)
	{
		if (token && SPACE1889Helper.hasTokenConfigurePermission(false))
		{
			let light = prototypeToken?.light;
			if (light)
			{
				await token.update({
					"light.dim": light.dim,
					"light.bright": light.bright,
					"light.angle": light.angle,
					"light.color": light.color,
					"light.alpha": light.alpha,
					"light.animation.type": light.animation.type,
					"light.animation.speed": light.animation.speed,
					"light.animation.intensity": light.animation.intensity,
					"light.animation.reverse": light.animation.reverse,
					"light.coloration": light.coloration,
					"light.luminosity": light.luminosity,
					"light.attenuation": light.attenuation,
					"light.saturation": light.saturation,
					"light.contrast": light.contrast,
					"light.shadows": light.shadows
				});
			}
			else
			{
				await token.update({
					"light.dim": 0,
					"light.bright": 0,
					"light.angle": 360,
					"light.color": null,
					"light.alpha": 0.5,
					"light.animation.type": null,
					"light.animation.speed": 5,
					"light.animation.intensity": 5,
					"light.animation.reverse": false,
					"light.coloration": 1,
					"light.luminosity": 0.5,
					"light.attenuation": 0.5,
					"light.saturation": 0,
					"light.contrast": 0,
					"light.shadows": 0
				});
			}
		}
	}

	static async activateLightSource(lightSource, actor)
	{
		if (lightSource.system.quantity < 1)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotActivateLightNoItem", { "name": lightSource.system.label }));
			return;
		}
		if (lightSource.system.requiredHands > 0 && lightSource.system.usedHands === "none")
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.CanNotActivateLightNoHand"));
			return;
		}
		if (lightSource.system.usedDuration >= lightSource.system.duration)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.CanNotActivateLightNoEnergy"));
			return;
		}
		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		if (SPACE1889Time.isSimpleCalendarEnabled())
			await lightSource.update({ "system.isActive": true, "system.emissionStartTimestamp": SPACE1889Time.getCurrentTimestamp() });
		else
			await lightSource.update({ "system.isActive": true });

		let tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			await this._setTokenLight(lightSource, token);
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.getCurrentTimeDateString() : "";
		const messageContent = game.i18n.format("SPACE1889.LightGoesOn", { "lightSource": lightSource.system.label, "name": actor.name, "time": timeAsString });
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});

	}

	static async _setTokenLight(lightSource, token)
	{
		if (token && lightSource)
		{
			await token.update({
				"light.dim": lightSource.system.dimRadius,
				"light.bright": lightSource.system.brightRadius,
				"light.angle": lightSource.system.angle,
				"light.color": lightSource.system.color,
				"light.alpha": lightSource.system.alpha,
				"light.animation.type": lightSource.system.animationType === "none" ? null : lightSource.system.animationType,
				"light.animation.speed": lightSource.system.animationSpeed,
				"light.animation.intensity": lightSource.system.animationIntensity,
				"light.animation.reverse": lightSource.system.reverseDirection,
				"light.coloration": lightSource.system.coloration,
				"light.luminosity": lightSource.system.luminosity,
				"light.attenuation": lightSource.system.attenuation,
				"light.saturation": lightSource.system.saturation,
				"light.contrast": lightSource.system.contrast,
				"light.shadows": lightSource.system.shadows
			});
		}
	}

	static blockedHandsFromLightSources(actor)
	{
		if (!actor)
			return { primary: false, off: false };

		let primaryUsed = false;
		let primaryId = undefined;
		let offUsed = false;
		let offId = undefined;

		for (let ls of actor.system.lightSources)
		{
			if (ls.type === "lightSource" && ls.system.requiredHands > 0)
			{
				if (ls.system.usedHands === "primaryHand" || ls.system.usedHands === "bothHands")
				{
					primaryUsed = true;
					primaryId = ls.id;
				}
				if (ls.system.usedHands === "offHand" || ls.system.usedHands === "bothHands")
				{
					offUsed = true;
					offId = ls.id;
				}
			}
		}

		return { primary: primaryUsed, primaryId: primaryId, off: offUsed, offId: offId };
	}

	static getNextLightSourceHand(backwardDirection, currentHand, isTwoHanded = false)
	{
		if (isTwoHanded)
			return currentHand === "none" ? "bothHands" : "none";

		const n = 'none';
		const o = 'offHand';
		const p = 'primaryHand';

		if (currentHand === n)
			return backwardDirection ? p : o;
		else if (currentHand === o)
			return backwardDirection ? n : p;
		else
			return backwardDirection ? o : n;
	}

	static async setLightSourceHand(lightSource, actor, backward)
	{
		const newHand = this.getNextValidLightSourceHandPosition(lightSource, actor, backward);

		if (newHand === lightSource.system.usedHands)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.LightSourceCanNotReady", { lightSourceName: lightSource.name, handCount: lightSource.system.requiredHands }));
			return;
		}

		await actor.updateEmbeddedDocuments("Item", [{ _id: lightSource._id, "system.usedHands": newHand }]);
	}

	static getNextValidLightSourceHandPosition(lightSource, actor, backwardDirection)
	{
		if (!lightSource || lightSource.system.requiredHands === 0)
			return "none";

		let fallback = "none";
		if (lightSource.system.isActive)
			fallback = lightSource.system.usedHands;

		const weaponInHands = SPACE1889Helper.getWeaponIdsInHands(actor);
		const lsBlocked = this.blockedHandsFromLightSources(actor);

		const isPrimaryPossible = weaponInHands.primary.length === 0 && !lsBlocked.primary;
		const isOffPossible = weaponInHands.off.length === 0 && !lsBlocked.off;
		const isNonePossible = !lightSource.system.isActive;

		let wanted = this.getNextLightSourceHand(backwardDirection, lightSource.system.usedHands, lightSource.system.requiredHands > 1);
		if (SPACE1889Helper.isWeaponHandPossible(wanted, isPrimaryPossible, isOffPossible, isNonePossible))
			return wanted;

		let secondTry = this.getNextLightSourceHand(backwardDirection, wanted, false);
		if (SPACE1889Helper.isWeaponHandPossible(secondTry, isPrimaryPossible, isOffPossible, isNonePossible))
			return secondTry;

		return fallback;
	}

	static async refillLightSource(lightSource, actor)
	{
		if (!lightSource || !actor || lightSource.type !== "lightSource")
			return;

		if (lightSource.system.itemUseType === "consumables" || this.isPermanentlyUsable(lightSource))
		{
			ui.notifications.info(game.i18n.format("SPACE1889.LightCanNotRecharge", { "name": lightSource.system.label }));
			return;
		}

		if (lightSource.system.isActive)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.LightCanNotRechargeDuringOperation", { "name": lightSource.system.label }));
			return;
		}

		if (lightSource.system.usedDuration === 0)
			return;

		await lightSource.update({
			"system.usedDuration": 0,
			"system.emissionStartTimestamp": 0
		});

		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			whisper: [],
			content: game.i18n.format("SPACE1889.LightRecharge", { "name": lightSource.system.label })
		};
		await ChatMessage.create(chatData, {});
	}

	static async rollDrop(tokenDocument, actor, item, showDialog)
	{
		if (!actor || !item || item.type !== "lightSource")
			return;

		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		const gravityFactor = SPACE1889Helper.getGravity().gravityFactor;

		const breakingLimit = Math.min(Math.max(0, Math.round(gravityFactor * Number(item.system.probabilityOfBreaking))), 100);
		const failingLimit = Math.min(Math.max(0, Math.round(gravityFactor * Number(item.system.probabilityOfFailing))), 100);

		const titelInfo = game.i18n.localize("SPACE1889.DropEffect");
		const tooltipInfo = game.i18n.format("SPACE1889.LightDropLimits", { break: breakingLimit, failing: failingLimit });

		const rollWithHtml = await this.createFreeInlineRollWithHtml("1d100", titelInfo, tooltipInfo);

		let messageContent = "";
		const speaker = ChatMessage.getSpeaker({ actor: actor });

		const titel = game.i18n.format("SPACE1889.DropItem", { name: item.name });
		messageContent = `<h3>${titel}</h3>`;
		messageContent += SPACE1889Time.isSimpleCalendarEnabled() ? `<p>${SPACE1889Time.getCurrentTimeDateString()}</p>` : "";
		messageContent += `${rollWithHtml.html} <br>`;

		const remainingTime = Math.max(0, item.system.duration - this.calcUsedDuration(item));
		let addLightSource = false;

		if (rollWithHtml.roll.total <= breakingLimit)
		{
			messageContent += game.i18n.format("SPACE1889.LightDropBreakingInfo", { name: item.name });
		}
		else if (rollWithHtml.roll.total <= failingLimit)
		{
			messageContent += game.i18n.format("SPACE1889.LightDropFailingInfo", { remainingTime: remainingTime });
		}
		else
		{
			messageContent += game.i18n.format("SPACE1889.LightDropSuccessInfo", { remainingTime: remainingTime });
			addLightSource = true;
		}

		if (addLightSource && tokenDocument?.id && item.system.isActive)
		{
			if (game.user.isGM)
			{
				await this.createLightSourceOnScene(tokenDocument.id, item.id, game.scenes.viewed.id);
			}
			else
			{
				game.socket.emit("system.space1889", {
					type: "addLightSource",
					payload: {
						tokenId: tokenDocument.id,
						sceneId: game.scenes.viewed.id,
						lightSourceId: item.id
					}
				});
			}
		}
		await this._deactivateLightSourceFromDrop(item, actor);

		let chatData =
		{
			user: game.user.id,
			speaker: speaker,
			whisper: [],
			content: messageContent
		};
		await ChatMessage.create(chatData, {});
	}

	static async createLightSourceOnScene(tokenId, itemId, sceneId)
	{
		const scene = game.scenes.get(sceneId);
		if (!scene)
			return undefined;

		const tokenDoc = scene.tokens?.get(tokenId);
		if (!tokenDoc)
			return undefined;

		const lightSource = tokenDoc._actor.items.get(itemId);
		if (!lightSource)
			return undefined;

		let spaceFlags = {};
		if (lightSource.system.itemUseType !== "permanentlyUsable" && SPACE1889Time.isSimpleCalendarEnabled())
		{
			const remainingTime = Math.max(0, lightSource.system.duration - this.calcUsedDuration(lightSource));
			const timestamp = SPACE1889Time.getCurrentTimestamp();
			spaceFlags = { space1889: { timestamp: timestamp, remainingTime: remainingTime } };
		}

		const light1={x: tokenDoc.x+25, y: tokenDoc.y+25, vision:false, walls:true,
			config:{
				bright:lightSource.system.brightRadius,
				dim: lightSource.system.dimRadius,
				angle: lightSource.system.angle,
				color:lightSource.system.color,
				alpha:lightSource.system.alpha,
				coloration:lightSource.system.coloration,
				luminosity:lightSource.system.luminosity,
				attenuation: lightSource.system.attenuation,
				saturation: lightSource.system.saturation,
				contrast: lightSource.system.contrast,
				shadows: lightSource.system.shadows,
				animation:{
					speed:lightSource.system.animationSpeed,
					intensity: lightSource.system.animationIntensity,
					reverse:lightSource.system.reverseDirection,
					type:lightSource.system.animationType
				}
			},
			flags: spaceFlags
		}

		return await scene.createEmbeddedDocuments("AmbientLight", [light1]);
	}

	static async _deactivateLightSourceFromDrop(lightSource, actor)
	{
		const newQuantity = Math.max(0, lightSource.system.quantity - 1);
		await lightSource.update({
			"system.isActive": false,
			"system.usedDuration": 0,
			"system.emissionStartTimestamp": 0,
			"system.usedHands": "none",
			"system.quantity": newQuantity
			
		});

		const tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			if (token)
				this._resetTokenLight(token, game.actors.get(actor._id)?.prototypeToken);
		}
	}

	static async createFreeInlineRollWithHtml(rollTerm, titel="", tooltipInfo = "")
	{
		let roll = new Roll(rollTerm);
		await (game.release.generation < 12 ? roll.evaluate({ async: true }) : roll.evaluate());
		const htmlAn = await roll.toAnchor();
		let outerHtml = htmlAn.outerHTML;
		const index = outerHtml.indexOf('class=""');
		let pre = (tooltipInfo !== "") ? `<span data-tooltip="${tooltipInfo}">` : "<span>";
		pre += (titel !== "" ? titel : game.i18n.localize("SPACE1889.Probe")) + ": </span><b>";
		let post = "</b>";
		let fullHtml = "";
		if (index > -1)
			fullHtml = pre + outerHtml.substring(0, index) + `class="inline-roll inline-result" ` + outerHtml.substring(index + 8) + post;
		else
			fullHtml = pre + outerHtml + post;

		return { roll: roll, html: fullHtml };
	}

	static async redoTokenLight(event)
	{
		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		const resetLight = event?.shiftKey && event?.ctrlKey;
		const doTimeRefresh = game.user.isGM;
		const currentTimeStamp = SPACE1889Time.getCurrentTimestamp();

		for (let token of game.scenes.viewed.tokens)
		{
			if (!SPACE1889Helper.hasTokenOwnership(token.id))
				continue;

			const lightSource = this._getActiveLightSource(token.actor);

			if (lightSource && doTimeRefresh)
			{
				if (this._refreshLightSourceByTime(currentTimeStamp, lightSource, token.actor, token))
					return;
			}

			if (lightSource)
				await this._setTokenLight(lightSource, token);
			else if (resetLight)
				await this._resetTokenLight(token, token.actor?.prototypeToken);
		}
	}

	static _getActiveLightSource(actor)
	{
		if (!actor)
			return undefined;

		for (const ls of actor.system?.lightSources)
		{
			if (ls.system.isActive)
				return ls;
		}
		return undefined;
	}
}
