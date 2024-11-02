import SPACE1889Time from "./time.js";
import SPACE1889Helper from "./helper.js";
import SPACE1889Light from "./light.js";

export default class SPACE1889Vision
{
	static timePasses()
	{
		if (!game.user.isGM || !SPACE1889Time.isSimpleCalendarEnabled())
			return;

		const currentTimeStamp = SPACE1889Time.getCurrentTimestamp();
		const list = game.actors.filter(e => e.type === "character");
		for (const actor of list)
		{
			for (const vision of actor.system.visions)
			{
				this._checkAndDeactivateVisionByTime(currentTimeStamp, vision, actor, undefined);
			}
		}

		for (const token of game.scenes.viewed.tokens)
		{
			if (token.actorLink && token.actor.type === "character")
				continue;

			for (const vision of token.actor.system.visions)
			{
				this._checkAndDeactivateVisionByTime(currentTimeStamp, vision, token.actor, token);
			}
		}
	}

	static _checkAndDeactivateVisionByTime(timeStamp, vision, actor, token)
	{
		if (!vision.system.isActive || vision.system.emissionStartTimestamp === 0 || SPACE1889Light.isPermanentlyUsable(vision))
			return false;

		const timeDelta = Number(SPACE1889Time.getTimeDifInSeconds(timeStamp, vision.system.emissionStartTimestamp));
		const usedDuration = Number(vision.system.usedDuration) + (timeDelta / 60.0);
		if (usedDuration >= vision.system.duration)
		{
			this._deactivateVisionByTime(vision, actor, token);
			return true;
		}
		return false;
	}

	static async _deactivateVisionByTime(visionItem, actor, token)
	{
		let newQuantity = visionItem.system.quantity;
		const isConsumables = visionItem.system.itemUseType === "consumables";
		const usedDuration = isConsumables ? 0 : visionItem.system.duration;
		let startTimestamp = visionItem.system.emissionStartTimestamp;
		if (isConsumables)
		{
			newQuantity = Math.max(0, newQuantity - 1);
			startTimestamp = 0;
		}

		const delta = Math.max(0, visionItem.system.duration - visionItem.system.usedDuration) * 60;
		const emissionEndTimeStamp = visionItem.system.emissionStartTimestamp + delta;

		await visionItem.update({
			"system.isActive": false,
			"system.usedDuration": usedDuration,
			"system.emissionStartTimestamp": startTimestamp,
			"system.quantity": newQuantity
		});

		if (token)
			this._resetTokenVision(token, actor?.prototypeToken);
		else
		{
			const tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
			for (let tok of tokens)
			{
				this._resetTokenVision(tok, actor?.prototypeToken);
			}
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.formatTimeDate(SPACE1889Time.getTimeAndDate(emissionEndTimeStamp)) : "";
		const messageContent = game.i18n.format("SPACE1889.VisionFades", { "vision": visionItem.system.label, "name": token ? token.name : actor.name, "time": timeAsString });
		let chatData =
		{
			user: game.user.id,
			//speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static async deactivateVision(visionItem, actor)
	{
		if (SPACE1889Time.isSimpleCalendarEnabled() && !visionItem.system.interruptible)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotDeActivateVision", { "name": visionItem.system.label }));
			return;
		}

		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		const usedDuration = SPACE1889Light.calcUsedDuration(visionItem);

		await visionItem.update({
			"system.isActive": false,
			"system.usedDuration": usedDuration,
			"system.emissionStartTimestamp": 0
		});

		let tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			if (token)
				this._resetTokenVision(token, game.actors.get(actor._id)?.prototypeToken);
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.getCurrentTimeDateString() : "";
		const messageContent = game.i18n.format("SPACE1889.VisionSwitchOff", { "vision": visionItem.system.label, "name": actor.name, "time": timeAsString });
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static async _resetTokenVision(token, prototypeToken)
	{
		if (token && SPACE1889Helper.hasTokenConfigurePermission(false))
		{
			let sight = prototypeToken?.sight;
			if (sight)
			{
				await token.update({
					"sight.angle": sight.angle,
					"sight.attenuation": sight.attenuation,
					"sight.brightness": sight.brightness,
					"sight.color": sight.color,
					"sight.contrast": sight.contrast,
					"sight.range": sight.range,
					"sight.saturation": sight.saturation,
					"sight.visionMode": sight.visionMode,
					"sight.enabled": true
				});
			}
			else
			{
				await token.update({
					"sight.angle": 360,
					"sight.attenuation": 0,
					"sight.brightness": 1,
					"sight.color": null,
					"sight.contrast": 0,
					"sight.range": 0,
					"sight.saturation": 0,
					"sight.visionMode": "basic",
					"sight.enabled": true
				});
			}
		}
	}

	static async activateVision(visionItem, actor)
	{
		if (visionItem.system.quantity < 1)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotActivateVisionNoItem", { "name": visionItem.system.label }));
			return;
		}
		if (!SPACE1889Light.isPermanentlyUsable(visionItem) && visionItem.system.usedDuration >= visionItem.system.duration)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.CanNotActivateVisionNoEnergy"));
			return;
		}
		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		if (SPACE1889Time.isSimpleCalendarEnabled())
			await visionItem.update({ "system.isActive": true, "system.emissionStartTimestamp": SPACE1889Time.getCurrentTimestamp() });
		else
			await visionItem.update({ "system.isActive": true });

		let tokens = game.scenes.viewed.tokens.filter(e => e.actorId === actor.id);
		for (let token of tokens)
		{
			await this._setTokenVision(visionItem, token);
		}

		const timeAsString = SPACE1889Time.isSimpleCalendarEnabled() ? SPACE1889Time.getCurrentTimeDateString() : "";
		const messageContent = game.i18n.format("SPACE1889.VisionBegins", { "vision": visionItem.system.label, "name": actor.name, "time": timeAsString });
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});

	}

	static async _setTokenVision(visionItem, token)
	{
		if (token && visionItem)
		{
			await token.update({
				"sight.angle": visionItem.system.visionAngle,
				"sight.attenuation": visionItem.system.visionAttenuation,
				"sight.brightness": visionItem.system.visionBrightness,
				"sight.color": visionItem.system.visionColor,
				"sight.contrast": visionItem.system.visionContrast,
				"sight.range": visionItem.system.visionRange,
				"sight.saturation": visionItem.system.visionSaturation,
				"sight.visionMode": visionItem.system.visionMode,
				"sight.enabled": true
			});
		}
	}

	static async refillVision(visionItem, actor)
	{
		if (!visionItem || !actor || visionItem.type !== "vision")
			return;

		if (visionItem.system.itemUseType === "consumables" || SPACE1889Light.isPermanentlyUsable(visionItem))
		{
			ui.notifications.info(game.i18n.format("SPACE1889.VisionCanNotRecharge", { "name": visionItem.system.label }));
			return;
		}

		if (visionItem.system.isActive)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.VisionCanNotRechargeDuringOperation", { "name": visionItem.system.label }));
			return;
		}

		if (visionItem.system.usedDuration === 0)
			return;

		await visionItem.update({
			"system.usedDuration": 0,
			"system.emissionStartTimestamp": 0
		});

		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			whisper: [],
			content: game.i18n.format("SPACE1889.VisionRecharge", { "name": visionItem.system.label })
		};
		await ChatMessage.create(chatData, {});
	}

	static async redoTokenVision(event)
	{
		if (!SPACE1889Helper.hasTokenConfigurePermission())
			return;

		const resetVision = event?.shiftKey && event?.ctrlKey;
		const doTimeRefresh = game.user.isGM;
		const currentTimeStamp = SPACE1889Time.getCurrentTimestamp();

		for (let token of game.scenes.viewed.tokens)
		{
			if (!SPACE1889Helper.hasTokenOwnership(token.id))
				continue;

			const visionItem = this._getActiveVision(token.actor);

			if (visionItem && doTimeRefresh)
			{
				if (this._checkAndDeactivateVisionByTime(currentTimeStamp, visionItem, token.actor, token))
					return; 
			}

			if (visionItem)
				await this._setTokenVision(visionItem, token);
			else if (resetVision)
				await this._resetTokenVision(token, token.actor?.prototypeToken);
		}
	}

	static _getActiveVision(actor)
	{
		if (!actor)
			return undefined;

		for (const vision of actor.system?.visions)
		{
			if (vision.system.isActive)
				return vision;
		}
		return undefined;
	}
}
