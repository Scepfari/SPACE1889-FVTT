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
				if (!lightSource.system.isActive || lightSource.system.emissionStartTimestamp === 0)
					continue;

				const timeDelta = Number(SPACE1889Time.getTimeDifInSeconds(currentTimeStamp, lightSource.system.emissionStartTimestamp));
				const usedDuration = Number(lightSource.system.usedDuration) + (timeDelta / 60.0);
				if (usedDuration >= lightSource.system.duration)
					this._deactivateLightSourceByTime(lightSource, actor);
			}
		}
	}

	static async _deactivateLightSourceByTime(lightSource, actor)
	{
		let newQuantity = lightSource.system.quantity;
		const usedDuration = lightSource.system.rechargeable ? lightSource.system.duration : 0;
		let startTimestamp = lightSource.system.emissionStartTimestamp;
		if (!lightSource.system.rechargeable)
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
			"system.quantity": newQuantity
		});

		let tokens = game.scenes.active.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			this._resetTokenLight(token, actor?.prototypeToken);
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.formatTimeDate(SPACE1889Time.getTimeAndDate(emissionEndTimeStamp)) : "";
		const messageContent = game.i18n.format("SPACE1889.LightGoesOut", { "lightSource": lightSource.system.label, "name": actor.name, "time": timeAsString });
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

		let timeDelta = 0.0;
		if (SPACE1889Time.isSimpleCalendarEnabled() && lightSource.system.emissionStartTimestamp !== 0)
			timeDelta = Number(SPACE1889Time.getTimeDifInSeconds(SPACE1889Time.getCurrentTimestamp(), lightSource.system.emissionStartTimestamp));

		const usedDuration = Number(lightSource.system.usedDuration) + (timeDelta / 60.0);

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

	static async _resetTokenLight(token, prototypeToken)
	{
		if (token)
		{
			let light = prototypeToken?.light;
			if (light)
			{
				await token.update({
					"light.dim": light.dim,
					"light.bright": light.bright,
					"light.angle": light.angle,
					"light.color": light.color,
					"light.luminosity": light.luminosity,
					"light.animation.type": light.animation.type,
					"light.animation.speed": light.animation.speed,
					"light.animation.intensity": light.animation.intensity,
					"light.animation.reverse": light.animation.reverse
				});
			}
			else
			{
				await token.update({
					"light.dim": 0,
					"light.bright": 0,
					"light.angle": 360,
					"light.color": null,
					"light.luminosity": 0.5,
					"light.animation.type": null,
					"light.animation.speed": 5,
					"light.animation.intensity": 5,
					"light.animation.reverse": false
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
		if (lightSource.system.requiresHands && lightSource.system.usedHands === "none")
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.CanNotActivateLightNoHand"));
			return;
		}
		if (lightSource.system.usedDuration >= lightSource.system.duration)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.CanNotActivateLightNoEnergy"));
			return;
		}

		if (SPACE1889Time.isSimpleCalendarEnabled())
			await lightSource.update({ "system.isActive": true, "system.emissionStartTimestamp": SPACE1889Time.getCurrentTimestamp() });
		else
			await lightSource.update({ "system.isActive": true });

		let tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			if (token)
			{
				await token.update({
					"light.dim": lightSource.system.dimRadius,
					"light.bright": lightSource.system.brightRadius,
					"light.angle": lightSource.system.angle,
					"light.color": lightSource.system.color,
					"light.luminosity": lightSource.system.colorIntensity,
					"light.animation.type": lightSource.system.animationType === "none" ? null : lightSource.system.animationType,
					"light.animation.speed": lightSource.system.animationSpeed,
					"light.animation.intensity": lightSource.system.animationIntensity,
					"light.animation.reverse": lightSource.system.reverseDirection
				});
			}
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

	static blockedHandsFromLightSources(actor)
	{
		if (!actor)
			return { primary: false, off: false };

		let primaryUsed = false;
		let offUsed = false;
		for (let ls of actor.system.gear)
		{
			if (ls.type === "lightSource" && ls.system.requiresHands)
			{
				if (ls.system.usedHands === "primaryHand" || ls.system.usedHands === "bothHands")
					primaryUsed = true;
				if (ls.system.usedHands === "offHand" || ls.system.usedHands === "bothHands")
					offUsed = true;
			}
		}

		return { primary: primaryUsed, off: offUsed };
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
			return;

		await actor.updateEmbeddedDocuments("Item", [{ _id: lightSource._id, "system.usedHands": newHand }]);
	}

	static getNextValidLightSourceHandPosition(lightSource, actor, backwardDirection)
	{
		if (!lightSource || !lightSource.system.requiresHands)
			return "none";

		let fallback = "none";
		if (lightSource.system.isActive)
			fallback = lightSource.system.usedHands;

		const weaponInHands = SPACE1889Helper.getWeaponIdsInHands(actor);
		const lsBlocked = this.blockedHandsFromLightSources(actor);

		const isPrimaryPossible = weaponInHands.primary.length === 0 && !lsBlocked.primary;
		const isOffPossible = weaponInHands.off.length === 0 && !lsBlocked.off;
		const isNonePossible = !lightSource.system.isActive;

		let wanted = this.getNextLightSourceHand(backwardDirection, lightSource.system.usedHands, false);
		if (SPACE1889Helper.isWeaponHandPossible(wanted, isPrimaryPossible, isOffPossible, isNonePossible))
			return wanted;

		let secondTry = this.getNextLightSourceHand(backwardDirection, wanted, false);
		if (SPACE1889Helper.isWeaponHandPossible(secondTry, isPrimaryPossible, isOffPossible))
			return secondTry;

		return fallback;
	}
}
