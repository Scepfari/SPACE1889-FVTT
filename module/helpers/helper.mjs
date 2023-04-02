import TurnMarker from "../helpers/turnMarker.mjs";

export default class SPACE1889Helper
{
	static getTalentData(actor, talentId)
	{
		return actor.system.talents?.find(entry => entry.system.id == talentId);
	}

	static getTalentLevel(actor, talentId)
	{
		const talent = this.getTalentData(actor, talentId);
		if (talent != undefined)
		{
			return talent.system.level.value;
		}
		return 0;
	}

	static getDeathThreshold(actor)
	{
		let threshold = -5;
		const level = this.getTalentLevel(actor, "zaeherHund");
		if (level > 0)
			threshold -= (2 * level);

		return threshold;
	}

	static isAutoStabilize(actor)
	{
		return (this.getTalentLevel(actor, "zaeherHund") > 0);
	}

	static getIncapacitateThreshold(actor)
	{
		let threshold = 0;
		const level = this.getTalentLevel(actor, "schmerzresistenz");
		if (level > 0)
			threshold -= (2 * level);

		return threshold;
	}

	static getDamageTuple(actor, ignoreThisItemId = "")
	{
		let lethal = 0;
		let nonLethal = 0;
		for (const item of actor.items)
		{
			if (item.type != "damage")
				continue;

			if (item._id == ignoreThisItemId)
				continue;

			if (item.system.damageType == "lethal")
				lethal += item.system.damage;
			else
				nonLethal += item.system.damage;
		}

		return { lethal: lethal, nonLethal: nonLethal };
	}

	static isCreature(actor)
	{
		return actor.type == 'creature';
	}

	static getExchangeValue(item)
	{
		const exchangeRatio = 20 / item.system.exchangeRateForOnePound;
		if (exchangeRatio == 0)
			return "?";

		const sumShilling = Number(item.system.quantity) * exchangeRatio;

		const pound = Math.floor(sumShilling / 20);
		const shilling = Math.round(sumShilling - (pound * 20));

		let value = "";
		if (pound > 0)
			value = pound.toString() + game.i18n.localize("SPACE1889.CurrencyBritishPoundsAbbr") + " ";
		if (shilling > 0)
			value += shilling.toString() + game.i18n.localize("SPACE1889.CurrencyBritishShillingAbbr");

		if (value == "")
			value = "<< 1" + game.i18n.localize("SPACE1889.CurrencyBritishShillingAbbr");

		return value;
	}

	/**
	 * 
	 * @param {object} ev event
	 * @param {number} currentValue
	 * @param {number} min
	 * @param {number} max
	 */
	static incrementValue(ev, currentValue, min, max, showNotification = false)
	{
		const factor = (ev.ctrlKey && ev.shiftKey) ? 100 : (ev.ctrlKey ? 10 : (ev.shiftKey ? 5 : 1));
		const sign = ev.button == 2 ? -1 : 1;
		const wantedValue = Number(currentValue) + (factor * sign);
		let newValue = wantedValue;
		if (sign > 0 && max != undefined)
			newValue = Math.min(newValue, max);
		else if (sign < 0)
			newValue = Math.max(newValue, min);

		if (showNotification && wantedValue > newValue)
		{
			const info = game.i18n.format("SPACE1889.CanNotIncrementAttributeSkill", { level: max, currentHeroLevel: this.GetHeroLevelName() });
			ui.notifications.info(info);
		}

		return newValue;
	}

	static GetHeroLevelName()
	{
		const heroLevel = game.settings.get("space1889", "heroLevel");
		let id = "";
		if (heroLevel == 0)
			id = "SPACE1889.HeroLevelPechvogel";
		else if (heroLevel == 1)
			id = "SPACE1889.HeroLevelDurchschnittsbuerger";
		else if (heroLevel == 2)
			id = "SPACE1889.HeroLevelVielversprechend";
		else if (heroLevel == 3)
			id = "SPACE1889.HeroLevelVeteran";
		else if (heroLevel == 4)
			id = "SPACE1889.HeroLevelWeltspitze";
		else
			id = "SPACE1889.HeroLevelUebermensch";
		return game.i18n.localize(id);
	}

	static incrementVehicleSizeValue(ev, currentValue)
	{
		const sign = ev.button == 2 ? -1 : 1;
		const factor = (ev.ctrlKey && ev.shiftKey) ? 10 : (ev.ctrlKey ? 4 : (ev.shiftKey ? 2 : 1));

		const sizeList = [0, 1, 2, 4, 8, 16, 32];
		const currentIndex = sizeList.findIndex((e) => e == Number(currentValue));
		if (currentIndex > -1)
		{
			const newIndex = Math.max(0, Math.min(sizeList.length - 1, currentIndex + (sign * factor)));
			return sizeList[newIndex];
		}
		return this.incrementValue(ev, currentValue, sizeList[0], sizeList[sizeList.length - 1]);
	}

	static getCrewTemperModificator(temper)
	{
		if (temper == undefined || temper == null)
			return 0;

		switch (temper)
		{
			case "hochmotiviert":
				return 1;
			case "angespannt":
				return -1;
			case "befehlsverweigerung":
				return -2;
			case "meuterei":
				return -4;
			default:
				return 0;
		}
	}

	static getCrewExperienceValue(experience)
	{
		if (experience == undefined || experience == null)
			return 0;

		switch (experience)
		{
			case "rookie":
				return 2;
			case "regular":
				return 4;
			case "veteran":
				return 6;
			case "elite":
				return 8;
			default:
				return 4;
		}
	}

	static getStructureMalus(current, max, speed, control, propulsion)
	{
		const tempoRate = (current - propulsion) / max;
		const maneuverabilityRate = (current - control) / max;

		let maneuverability = 0;
		let tempoFactor = 0;

		if (maneuverabilityRate > 0.75)
			maneuverability = 0;
		else if (maneuverabilityRate > 0.5)
			maneuverability =  1;
		else if (maneuverabilityRate > 0.25)
			maneuverability = 2;
		else if (maneuverabilityRate <= 0.25)
			maneuverability = 4;

		if (tempoRate > 0.25 && tempoRate <= 0.5)
			tempoFactor = 0.25;
		else if (tempoRate <= 0.25)
			tempoFactor = 0.5;

		return { maneuverability: maneuverability, speed: Math.ceil(speed * tempoFactor) };
	}

	static async setVehicleActorPositionFromDialog(vehicle, dropedActor)
	{
		if (dropedActor == undefined || dropedActor == null || vehicle == undefined || vehicle == null)
			return "";
		if (dropedActor.type == "vehicle" || vehicle.type != "vehicle")
			return ;

		let optionen = '<option value="all"' + ' selected="selected">' + game.i18n.localize("SPACE1889.VehicleAllPositions") + '</option>';

		for (let [key, langId] of Object.entries(CONFIG.SPACE1889.vehicleCrewPositions))
		{
			optionen += '<option value="' + key + '"' + '>' + game.i18n.localize(langId) + '</option>';
		}


		const vehicleName = vehicle.name;
		const actorName = dropedActor.name;

		const text = "Welche Position soll " + actorName + " auf dem Fahrzeug " + vehicleName + " einnehmen?";

		let positionLabel = game.i18n.localize("SPACE1889.VehicleCrewPosition");
		let submit = game.i18n.localize("SPACE1889.Submit")
		let cancel = game.i18n.localize("SPACE1889.Cancel")
		let selectedOption;
		let userInputName;


		let dialog = new Dialog({
			title: `${vehicle.name} : ${dropedActor.name}`,
			content: `
				<form class="flexcol">
					<p>${text}</p>
						<div>
							<label>${positionLabel}:</label>
							<div>
								<select id="position" name="position">
									${optionen}
								</select>
							</div>
						</div>
				</form>
			`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: `${submit}`,
					callback: () =>
					{
						selectedOption = document.getElementById('position').value;
					},
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: `${cancel}`,
				}
			},
			default: "yes",
			close: () =>
			{
				if (selectedOption)
				{
					let all = selectedOption == "all";
					const id = dropedActor._id;

					if (selectedOption == "captain" || all)
						vehicle.update({ 'system.positions.captain.actorId': id, 'system.positions.captain.actorName': actorName });
					if (selectedOption == "pilot" || all)
						vehicle.update({ 'system.positions.pilot.actorId': id, 'system.positions.pilot.actorName': actorName });
					if (selectedOption == "copilot" || all)
						vehicle.update({ 'system.positions.copilot.actorId': id, 'system.positions.copilot.actorName': actorName });
					if (selectedOption == "gunner" || all)
						vehicle.update({ 'system.positions.gunner.actorId': id, 'system.positions.gunner.actorName': actorName });
					if (selectedOption == "signaler" || all)
						vehicle.update({ 'system.positions.signaler.actorId': id, 'system.positions.signaler.actorName': actorName });
					if (selectedOption == "lookout" || all)
						vehicle.update({ 'system.positions.lookout.actorId': id, 'system.positions.lookout.actorName': actorName });
					if (selectedOption == "mechanic" || all)
						vehicle.update({ 'system.positions.mechanic.actorId': id, 'system.positions.mechanic.actorName': actorName });
					if (selectedOption == "medic" || all)
						vehicle.update({ 'system.positions.medic.actorId': id, 'system.positions.medic.actorName': actorName });
				}
			}
		});
		dialog.render(true);
	}

	static showActorSheet(id)
	{
		let crew = game.actors.get(id);
		if (crew != undefined && crew != null)
		{
			if (crew.sheet.rendered)
			{
				crew.sheet.bringToTop();
				crew.sheet.maximize();
			}
			else
				crew.sheet.render(true);
		}
	}

	/**
	 * sortiert die uebergebene Liste nach Namen
	 * @param objectArray 
	 */
	static sortByName(objectArray)
	{
		objectArray.sort((a, b) =>
		{
			if (a.name < b.name)
				return -1;
			if (a.name > b.name)
				return 1;
			return 0;
		});
	}

	static sortBySortFlag(objectArray)
	{
		objectArray.sort((a, b) =>
		{
			if (a?.sort < b?.sort)
				return -1;
			if (a?.sort > b?.sort)
				return 1;
			return 0;
		});
	}

	static async showHelpJournal()
	{
		let pac = game.packs.get("space1889.help");
		let docs = await pac.getDocuments();
		const language = game.settings.get('core', 'language')
		for (let doc of docs)
		{
			if (doc.name.substring(0, 2) == language)
				doc.sheet.render(true);
		}
	}

	static async showGmScreen()
	{
		let pac = game.packs.get("space1889.gminfos");
		let docs = await pac.getDocuments();
		const language = game.settings.get('core', 'language')
		let doc = undefined;
		if (language == "de")
		{
			doc = docs.find(e => e._id == "ZIqbgqYvZb1MA366");
		}
		else
		{
			doc = docs.find(e => e._id == "lYFa5uVsIh8OyoLW");
		}
		if (doc)
			doc.sheet.render(true, { width: 805, height: 850, top: 10, left: 120 });
	}

	static getEffectData(effect)
	{
		const combatId = game.combat ? game.combat._id : 0;
		let duration = game.combat ?
			{ combat: game.combat._id, rounds: effect.rounds, seconds: 6 * effect.rounds, startRound: 0, startTime: game.time.worldTime, startTurn: 0 } :
			{ seconds: 6, startTime: game.time.worldTime };

		
		const infos = [
			{
				name: "stun",
				label: game.i18n.localize("EFFECT.StatusStunned"),
				icon: "icons/svg/daze.svg",
				flags: { core: { statusId: "stun" } },
				duration: duration,
			},
			{
				name: "prone",
				label: game.i18n.localize("EFFECT.StatusProne"),
				icon: "icons/svg/falling.svg",
				flags: { core: { statusId: "prone" } },
				duration: duration
			},
			{
				name: "unconscious",
				label: game.i18n.localize("EFFECT.StatusUnconscious"),
				icon: "icons/svg/unconscious.svg",
				flags: { core: { statusId: "unconscious" } },
				duration: duration,
			},
			{
				name: "paralysis",
				label: game.i18n.localize("EFFECT.StatusParalysis"),
				icon: "icons/svg/paralysis.svg",
				flags: { core: { statusId: "paralysis" } },
				duration: duration,
			},
			{
				name: "fear",
				label: game.i18n.localize("EFFECT.StatusFear"),
				icon: "icons/svg/terror.svg",
				flags: { core: { statusId: "fear" } },
				duration: duration,
			},
			{
				name: "burning",
				label: game.i18n.localize("EFFECT.StatusBurning"),
				icon: "icons/svg/fire.svg",
				flags: { core: { statusId: "burning" } },
				duration: duration,
			},
			{
				name: "dead",
				label: game.i18n.localize("EFFECT.StatusDead"),
				icon: "icons/svg/skull.svg",
				flags: { core: { statusId: "dead", overlay: true } },
			}
		];
		return infos.find(e => e.name == effect.name);
	}

	static async addEffects(actor, effects)
	{
		for (const effect of effects)
		{
			await this.addEffect(actor, effect);
		}
	}

	static async addEffect(actor, effect)
	{
		if (!actor)
			return;
		let effectData = this.getEffectData(effect);
		if (!effectData)
			return;

		effectData.origin = actor.uuid;

		const gameRound = game.combat ? game.combat.round : 0;
		const gameTurn = game.combat ? game.combat.turn : 0;
		if (game.combat && effectData.duration)
		{
			effectData.duration.startRound = gameRound;
			effectData.duration.startTurn = gameTurn;
		}
		await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
	}

	static async sleep(sleeptimeInMilliSeconds)
	{
		await new Promise(resolve => setTimeout(resolve, sleeptimeInMilliSeconds));
	}

	static isDiceSoNiceEnabled()
	{
		return this.isModuleEnabled("dice-so-nice");
	}

	static isModuleEnabled(id)
	{
		return game.modules.get(id) && game.modules.get(id).active;
	}

	static getDsnRollAnimationTime()
	{
		if (!this.isDiceSoNiceEnabled())
			return 0;

		const speed = game.dice3d.box?.speed;
		if (!speed)
			speed = 3;

		if (speed <= 0)
			speed = 1;
		if (speed > 3)
			speed = 3;

		const list = [3000, 2000, 1000];
		return list[speed - 1];
	}

//function refreshSpaceCombatMarker()
	static regenerateMarkers()
	{
		if (!game.combat?.started)
			return;
		if (!game.settings.get("space1889", "useCombatTurnMarker"))
			return;
		if (!canvas.tokens.Space1889TurnMarker)
			new TurnMarker();
		canvas.tokens.Space1889TurnMarker?.MoveToCombatant();
	}

	static refreshTurnMarker(reallyDestroy)
	{
		canvas.tokens?.Space1889TurnMarker?.Destroy(reallyDestroy);
	}

	static isSimpleCalendarEnabled()
	{
		return this.isModuleEnabled("foundryvtt-simple-calendar");
	}

	static getCurrentTimeAndDate()
	{
		if (this.isSimpleCalendarEnabled())
		{
			const date = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
			return { year: date.year, month: date.month + 1, day: date.day + 1, hour: date.hour, minute: date.minute, second: date.second };
		}
		const worldDate = new Date();

		return {
			year: worldDate.getFullYear(), month: Number(worldDate.getMonth()) + 1, day: worldDate.getDate(),
			hour: worldDate.getHours(), minute: worldDate.getMinutes(), second: worldDate.getSeconds()
		};
	}

	static getTimeAndDate(timestamp)
	{
		if (this.isSimpleCalendarEnabled())
		{
			const date = SimpleCalendar.api.timestampToDate(timestamp);
			return { year: date.year, month: date.month + 1, day: date.day + 1, hour: date.hour, minute: date.minute, second: date.second };
		}
		const worldDate = new Date(timestamp);

		return {
			year: worldDate.getFullYear(), month: Number(worldDate.getMonth()) + 1, day: worldDate.getDate(),
			hour: worldDate.getHours(), minute: worldDate.getMinutes(), second: worldDate.getSeconds()
		};
	}

	static formatTimeDate(date)
	{
		let text = date.day.toString() + "." + date.month.toString() + "." + date.year.toString() +
			" " + date.hour.toString() + ":" + (date.minute < 10 ? "0" : "") + date.minute.toString() +
			":" + (date.second < 10 ? "0" : "") + date.second.toString();
		return text;
	}

	static getCurrentTimeDateString()
	{
		return this.formatTimeDate(this.getCurrentTimeAndDate());
	}

	static formatEffectDuration(effectDuration)
	{
		const canDoDate = this.isSimpleCalendarEnabled();
		const date = canDoDate ? this.formatTimeDate(this.getTimeAndDate(effectDuration.startTime)) : "";
		let roundInfo = "";

		if (effectDuration.startRound > 0 || effectDuration.startTurn > 0)
			roundInfo = game.i18n.format("SPACE1889.EffectRoundTurnInfo", { round: effectDuration.startRound, turn: effectDuration.startTurn });

		return date + (date != "" && roundInfo != "" ? "\r\n " : "") + roundInfo;
	}

	static async showArtwork({ img, name, uuid, isOwner }, hide = false) 
	{
		new ImagePopout(img,
			{
				title: hide ? (isOwner ? name : "-") : name,
				shareable: true,
				uuid
			}).render(true)
	}

	static getControlledTokenDocument()
	{
		for (let token of canvas.scene.tokens)
		{
			if (token?._object?.controlled)
				return token;
		}
		return undefined;
	}

	static getDistancePenalty(item, distance, actor = undefined)
	{
		if (item.type != "weapon" || !item.system.isRangeWeapon)
			return 0;

		let isPistol = item.system.specializationId == "pistole";
		if (!isPistol && item.system.specializationId == "archaisch")
		{
			// archaische Pistolen können aktuell nicht klar identifiziert werden
			if (item?.flags?.core?.sourceId == 'Compendium.space1889.waffen.NXzxp6dsp9sJWD82' ||
				item?.flags?.core?.sourceId == 'Compendium.space1889.waffen.X8WKdO6DPzJAvxvW')
				isPistol = true;
		}
		
		let isShotgun = item.system.specializationId == "schrotgewehr";
		let isGun = !isPistol && !isShotgun;
		let range = item.system.calculatedRange;
		let shotgunMalus = 0;

		if (isShotgun)
		{
			let currentAmmo = item.system.ammunition.ammos.find(x => x._id == item.system.ammunition.currentItemId);
			if (!currentAmmo || currentAmmo?.system?.isConeAttack)
			{
				shotgunMalus = Math.floor(distance / item.system.coneRange) * (-1);
			}
		}

		if (distance <= 1.5)
		{
			return isPistol ? 1 : (isGun ? -1 : 0);
		}
		if (distance <= range)
			return shotgunMalus;
		if (distance <= (2 * range))
			return shotgunMalus - 2;
		if (distance <= (4 * range))
			return shotgunMalus - 4;
		return shotgunMalus - 8;
	}

	static replaceCommaWithPoint(text)
	{
		return text.replace(/,/g, ".");
	}

	/**
	 * @param {number} value
	 * @returns {string}
	 */
	static getSignedStringFromNumber(value)
	{
		return (value < 0 ? "" : "+") + value.toString();
	}

	static isRangeWeapon(weapon)
	{
		if (!weapon || weapon.type != "weapon")
			return false;

		if (weapon.system.skillId != "waffenlos" && weapon.system.skillId != "nahkampf")
		{
			const range = parseFloat(this.replaceCommaWithPoint(weapon.system.range));
			return range > 0.0;
		}
		return false;
	}

	static getAmmunitionCapacityType(weapon)
	{
		let type = weapon.system.capacityType;
		if (type == "revolver" || type == "internal")
			return "default";
			
		return type;
	}

	static getConeAngle(item)
	{
		if (!item || item.type != "weapon" || item.system.specializationId != "schrotgewehr")
			return 0;

		const range = item.system.coneRange;
		if (range <= 0.0)
			return 0;

		const halfEnlargement = 0.75; // 1.5m per range
		const a = Math.sqrt(range * range + (halfEnlargement * halfEnlargement));
		const angleRad = 2 * Math.asin(halfEnlargement / a);
		const angle = angleRad * 180 / Math.PI;
		return Math.round((angle + Number.EPSILON) * 100) / 100;
	}

	static async setWeaponHand(weapon, actor, backward)
	{
		if (!weapon || !actor || weapon.type != "weapon")
			return;

		const newHand = this.getNextValidHandPosition(weapon, actor, backward);

		if (newHand == weapon.system.usedHands)
			return;

		
		await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.usedHands": newHand }]);

		const isQuickDraw = SPACE1889Helper.getTalentLevel(actor, "schnellziehen") > 0
		let desc = "";
		let title = "";
		if (newHand == "none")
		{
			title = game.i18n.localize("SPACE1889.WeaponUnReadyWeapon");
			desc = isQuickDraw ?
				game.i18n.format("SPACE1889.WeaponQuickDrawHolster", { weapon: weapon.name }) :
				game.i18n.format("SPACE1889.WeaponActionHolster", { weapon: weapon.name });
		}
		else
		{
			title = game.i18n.localize("SPACE1889.WeaponReadyWeapon");
			const handname = game.i18n.localize(CONFIG.SPACE1889.weaponHand[newHand]);
			if (newHand == "bothHands")
			{
				desc = isQuickDraw ?
					game.i18n.format("SPACE1889.WeaponQuickDrawReadyTwoHanded", { weapon: weapon.name }) :
					game.i18n.format("SPACE1889.WeaponActionReady", { weapon: weapon.name, hands: handname });
			}
			else
			{
				desc = isQuickDraw ?
					game.i18n.format("SPACE1889.WeaponQuickDrawReadyOneHand", { weapon: weapon.name, hand: handname }) :
					game.i18n.format("SPACE1889.WeaponActionReady", { weapon: weapon.name, hands: handname });
			}

		}

		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const label = `<h2><strong>${title}</strong></h2>`;
		ChatMessage.create({
			speaker: speaker,
			flavor: label,
			whisper: [],
			content: desc
		});
	}

	static getWeaponInHands(actor)
	{
		let primaryHand = [];
		let offHand = [];
		for (const weapon of actor.system.weapons)
		{
			if (weapon.system.usedHands == "bothHands")
			{
				primaryHand.push(weapon._id);
				offHand.push(weapon._id)
			}
			else if (weapon.system.usedHands == "primaryHand")
				primaryHand.push(weapon._id);
			else if (weapon.system.usedHands == "offHand")
				offHand.push(weapon._id);
		}
		return { primary: primaryHand, off: offHand };
	}

	static getNextValidHandPosition(weapon, actor, backwardDirection)
	{
		const currentHand = weapon.system.usedHands;
		const weaponInHands = this.getWeaponInHands(actor);

		const isPrimaryPossible = weaponInHands.primary.length == 0;
		const isOffPossible = weaponInHands.off.length == 0;

		let wanted = this.getNextWeaponHand(backwardDirection, weapon.system.usedHands, weapon.system.isTwoHanded);
		if (this.isWeaponHandPossible(wanted, isPrimaryPossible, isOffPossible))
			return wanted;

		if (weapon.system.isTwoHanded)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotReadyTwoHand", {weapon: weapon.name}));
			return "none";
		}

		if (wanted == "primaryHand")
		{
			const itemName = actor.system.weapons.find(e => e._id == weaponInHands.primary[0])?.name;
			ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotReadyPrimaryHand", { weapon: weapon.name, item: itemName}));
		}
		else if (wanted == "offHand")
		{
			const itemName = actor.system.weapons.find(e => e._id == weaponInHands.off[0])?.name;
			ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotReadyPrimaryHand", { weapon: weapon.name, item: itemName}));
		}

		let secondTry = this.getNextWeaponHand(backwardDirection, wanted, weapon.system.isTwoHanded)
		if (this.isWeaponHandPossible(secondTry, isPrimaryPossible, isOffPossible))
			return secondTry;
		else
		{
			ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotReady", { weapon: weapon.name }));
		}

		return "none";

	}

	static isWeaponHandPossible(wantedHand, isPrimaryPossible, isOffPossible)
	{
		if (wantedHand == "none")
			return true;
		if (wantedHand == "primaryHand" && isPrimaryPossible)
			return true;
		if (wantedHand == "offHand" && isOffPossible)
			return true;
		if (wantedHand == "bothHands" && isPrimaryPossible && isOffPossible)
			return true;

		return false;
	}

	static getNextWeaponHand(backwardDirection, currentHand, isTwoHanded)
	{
		if (isTwoHanded)
			return currentHand == "none" ? "bothHands" : "none";

		const n = 'none';
		const p = 'primaryHand';
		const o = 'offHand';

		if (currentHand == n)
			return backwardDirection ? o : p;
		else if (currentHand == p)
			return backwardDirection ? n : o;
		else
			return backwardDirection ? p : n;
	}

	static async reloadWeapon(weapon, actor, noChatInfoAsReturnValue = false)
	{
		if (!weapon || !actor || weapon.type != "weapon")
			return;

		if (weapon.system.ammunition.currentItemId == "")
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.AmmunitionCanNotReload"));
			return;
		}

		let currentAmmo = weapon.system.ammunition.ammos.find(x => x._id == weapon.system.ammunition.currentItemId);

		if (currentAmmo?.system?.quantity == 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.AmmunitionCanNotReloadOutOfAmmo"));
			return;
		}

		if (weapon.system.ammunition.remainingRounds >= weapon.system.capacity)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.AmmunitionIsAlreadyLoaded"));
			return;
		}

		const isInstantReload = SPACE1889Helper.getTalentLevel(actor, "schnellladen") > 0
		const infoId = isInstantReload ? "SPACE1889.AmmunitionInstantReload" : "SPACE1889.AmmunitionDefaultReloadAction";
		let desc = game.i18n.format(infoId, { weaponName: weapon.name });

		let autoReloadNeededLoadActions = Math.round(1 / ((isInstantReload ? 2 : 1) * weapon.system.ammunition.autoReloadRate)) - 1;
		if (weapon.system.ammunition.autoReloadRate != 0 && autoReloadNeededLoadActions >= 0)
		{
			if (weapon.system.ammunition.usedLoadingActions >= autoReloadNeededLoadActions)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": weapon.system.ammunition.remainingRounds + 1, "system.ammunition.usedLoadingActions": 0 }]);
				await actor.updateEmbeddedDocuments("Item", [{ _id: currentAmmo._id, "system.quantity": currentAmmo.system.quantity - 1 }]);
				desc = game.i18n.format("SPACE1889.AmmunitionReloadActionFireRateReady", { weaponName: weapon.name });
			}
			else
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.usedLoadingActions": weapon.system.ammunition.usedLoadingActions + 1 }]);
				desc = game.i18n.format("SPACE1889.AmmunitionReloadActionFireRate", { weaponName: weapon.name, turns: autoReloadNeededLoadActions + 1, loadActions: weapon.system.ammunition.usedLoadingActions });
			}
		}
		else if (weapon.system.capacityType == "internal" || weapon.system.capacityType == "revolver")
		{
			const currentRounds = weapon.system.ammunition.remainingRounds;
			const capacity = weapon.system.capacity;
			let wantedLoad = Math.min(capacity - currentRounds, currentAmmo.system.quantity);

			if (game.combat?.started)
			{
				wantedLoad = Math.min(wantedLoad, actor.system.abilities.dex.total);
			}
			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": currentRounds + wantedLoad }]);
			await actor.updateEmbeddedDocuments("Item", [{ _id: currentAmmo._id, "system.quantity": currentAmmo.system.quantity - wantedLoad }]);
		}
		else
		{
			await actor.updateEmbeddedDocuments("Item", [{ _id: currentAmmo._id, "system.quantity": currentAmmo.system.quantity - 1 }]);
			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": currentAmmo.system.capacity }]);
		}

		if (noChatInfoAsReturnValue)
			return desc;
	
		const speaker = ChatMessage.getSpeaker({ actor: actor });
			
		const label = `<h2><strong>${game.i18n.localize("SPACE1889.AmmunitionReload")}</strong></h2>`;
		ChatMessage.create({
			speaker: speaker,
			flavor: label,
			whisper: [],
			content: desc ?? ''
		});
		return "";
	}

	static async unloadWeapon(weapon, actor)
	{
		if (!weapon || !actor || weapon.type != "weapon")
			return;

		if (weapon.system.ammunition.currentItemId == "")
		{
			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": 0, "system.ammunition.usedLoadingActions": 0 }]);
			return;
		}

		let currentAmmo = weapon.system.ammunition.ammos.find(x => x._id == weapon.system.ammunition.currentItemId);

		if (weapon.system.capacityType == "internal" || weapon.system.capacityType == "revolver")
		{
			const currentRounds = weapon.system.ammunition.remainingRounds;

			let wantedUnload = weapon.system.ammunition.remainingRounds;

			if (game.combat?.started && weapon.system.capacityType == "internal")
			{
				wantedUnload = Math.min(wantedUnload, actor.system.abilities.dex.total);
			}
			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": currentRounds - wantedUnload , "system.ammunition.usedLoadingActions": 0}]);
			await actor.updateEmbeddedDocuments("Item", [{ _id: currentAmmo._id, "system.quantity": currentAmmo.system.quantity + wantedUnload }]);
		}
		else
		{
			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": 0 , "system.ammunition.usedLoadingActions": 0 }]);
			if (weapon.system.capacity == weapon.system.ammunition.remainingRounds)
				await actor.updateEmbeddedDocuments("Item", [{ _id: currentAmmo._id, "system.quantity": currentAmmo.system.quantity + 1 }]);
		}

		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const infoId = SPACE1889Helper.getTalentLevel(actor, "schnellladen") > 0 ? "SPACE1889.AmmunitionInstantUnload" : "SPACE1889.AmmunitionDefaultUnloadAction";
			
		const desc = game.i18n.format(infoId, { weaponName: weapon.name });
		const label = `<h2><strong>${game.i18n.localize("SPACE1889.AmmunitionUnload")}</strong></h2>`;
		ChatMessage.create({
			speaker: speaker,
			flavor: label,
			whisper: [],
			content: desc ?? ''
		});

	}

	static isWeaponReady(weapon, actor)
	{
		if (weapon.system.usedHands == "none" && (actor.type == "character" || actor.type == "npc"))
			return false;

		return true;
	}

	static canDoUseWeapon(weapon, actor)
	{
		if (!weapon.system.isRangeWeapon || actor.type == "vehicle")
			return true;

		if (weapon.system.ammunition.remainingRounds > 0)
			return true;

		if (weapon.system.ammunition.autoReloadRate == 0)
			return false;

		let currentAmmo = weapon.system.ammunition.ammos.find(x => x._id == weapon.system.ammunition.currentItemId);
		if (!currentAmmo || currentAmmo.system.quantity <= 0)
			return false;

		const isInstantReload = SPACE1889Helper.getTalentLevel(actor, "schnellladen") > 0
		let autoReloadNeededLoadActions = Math.round(1 / ((isInstantReload ? 2 : 1) * weapon.system.ammunition.autoReloadRate)) - 1;	
		if (weapon.system.ammunition.usedLoadingActions >= autoReloadNeededLoadActions)
			return true;

		return false;
	}

	static async useWeapon(weapon, actor)
	{
		if (!weapon.system.isRangeWeapon || actor =="vehicle")
			return "";

		if (weapon.system.ammunition.autoReloadRate == 0)
		{
			if (weapon.system.ammunition.remainingRounds <= 0)
				return game.i18n.localize("SPACE1889.AmmunitionCanNotFireOutOfAmmo");

			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": weapon.system.ammunition.remainingRounds - 1 }]);
			return "";
		}

		if (weapon.system.ammunition.remainingRounds > 0)
		{
			await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": weapon.system.ammunition.remainingRounds - 1 }]);
			return "";
		}


		if (SPACE1889Helper.canDoUseWeapon(weapon, actor))
		{
			const chatInfo = await SPACE1889Helper.reloadWeapon(weapon, actor, true);
			if (weapon.system.ammunition.remainingRounds > 0)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": weapon.system.ammunition.remainingRounds - 1 }]);
				return chatInfo;
			}
		}

		return 	game.i18n.localize("SPACE1889.AmmunitionCanNotReload");
	}

	static getAutoReloadRate(weapon)
	{
		if (!weapon || weapon.system?.type == "weapon")
			return 0;

		if (weapon.system.capacityType != "default" && weapon.system.capacityType != "internal")
			return 0;

		let parts = weapon.system.rateOfFire.split("/");
				
		if (parts.length == 1)
		{
			let rate = parseInt(parts[0]);
			if (rate > 0)
				return rate;
			return 0;
		}

		if (parts.length == 2)
		{
			let numerator = parseInt(parts[0]);
			let denominator = parseInt(parts[1]);

			if (isNaN(numerator) || isNaN(denominator) || numerator == 0 || denominator == 0)
				return 0;

			return numerator / denominator;
		}
		return 0;
	}

	static async createAmmo()
	{
		let tokens = canvas.tokens.controlled;

		if (tokens.length == 0)
		{
			const info = game.i18n.localize("SPACE1889.NoTokensSelected");
			ui.notifications.info(info);
			return;
		}

		let actorList = [];
		for (const token of tokens)
		{
			actorList.push(token.document._actor);
		}
		this.updateWeaponAndCreateAmmo(actorList);
	}

	static async updateWeaponAndCreateAmmo(actorList)
	{
		if (!actorList || actorList.length == 0)
			return;
	
		const pack = game.packs.get("space1889.waffen");
		let packWeapons = await pack.getDocuments();

		const muPack = game.packs.get("space1889.munition");
		const packAmmunition = await muPack.getDocuments();

		for (const actor of actorList)
		{
			this.createAmmoForActor(actor, packWeapons, packAmmunition);
		}
	}

	static async createAmmoForActor(actor, packWeapons, packAmmunition)
	{
		if (!actor)
			return;

		if ((actor.type == "character" || actor.type == "npc") && actor.system.ammunitions?.length == 0)
		{
			await this.updateActorWeapons(actor, packWeapons);

			let itemsToAdd = [];
			let weaponsWithAmmo = [];
			for (const weapon of actor.system.weapons)
			{
				if (weapon.system.isRangeWeapon)
				{
					const ammu = await this.GetAmmunition(weapon, packAmmunition);

					if (ammu)
					{
						itemsToAdd.push(ammu.toObject());
						weaponsWithAmmo.push(weapon);
						console.log("Add ammunition: " + ammu.name);
					}
					else
						console.log("no ammunition for " + weapon.name);
				}
			}
			if (itemsToAdd.length > 0)
			{
				const createdAmmo = await actor.createEmbeddedDocuments("Item", itemsToAdd);
				if (weaponsWithAmmo.length == createdAmmo.length)
				{
					for (let i = 0; i < weaponsWithAmmo.length; ++i)
						await actor.updateEmbeddedDocuments("Item", [{ _id: weaponsWithAmmo[i]._id, "system.ammunition.currentItemId": createdAmmo[i]._id }]);
				}
			}
		}
	}

	static async GetAmmunition(weapon, packAmmunition)
	{
		if (!packAmmunition)
			return undefined;

		if (weapon.system.specializationId == "schrotgewehr")
		{
			const ammo = packAmmunition.find(e => e.system.type == weapon.system.ammunition.type && e.system.damageType == "lethal" && e.system.isConeAttack && e.system.caliber == weapon.system.ammunition.caliber && e.system.capacityType == this.getAmmunitionCapacityType(weapon));
			if (ammo != undefined)
				return ammo;
		}

		if (weapon.system.ammunition.type == "catridges")
			return packAmmunition.find(e => e.system.type == weapon.system.ammunition.type && e.system.caliber == weapon.system.ammunition.caliber && e.system.capacityType == this.getAmmunitionCapacityType(weapon));

		if (weapon.system.ammunition.type == "bullets")
		{
			if (weapon.system.ammunition.caliber != "")
			{
				const bullet = packAmmunition.find(e => e.system.type == weapon.system.ammunition.type && e.system.caliber == weapon.system.ammunition.caliber);
				if (bullet)
					return bullet;
			}

			let bulletId = "";
			switch(weapon.system.specializationId)
			{
				case "pistole":
					bulletId = "HPdjoEqRPSogrqrA";
					break;
				case "kanone":
					bulletId = "b8NJLUYQPPR0Dxa6";
					break;
				default:
					bulletId = "wJcXp18HZEIE15J8";
					break;
			}
			return packAmmunition.find(e => e._id == bulletId);
		}

		return packAmmunition.find(e => e.system.type == weapon.system.ammunition.type && e.system.capacityType == this.getAmmunitionCapacityType(weapon));
	}

	static getIdFromUuid(uuid)
	{
		let result = "";
		let parts = uuid.split(".");
		if (parts.length > 0)
			result = parts[parts.length - 1];
		return result;
	}

	static async updateActorWeapons(actor, packWeapons)
	{
		if (!actor)
			return;
		if (actor.type == "character" || actor.type == "npc")
		{
			for (const weapon of actor.system.weapons)
			{
				if (weapon.system.isRangeWeapon && (weapon.system.ammunition.type == "default" || weapon.system.ammunition.type == ""))
				{
					const sourceId = weapon.flags.core?.sourceId;
					if (sourceId)
					{
						let source = packWeapons.find(e => e._id == this.getIdFromUuid(sourceId));
						if (source)
						{
							const capacity = Number(weapon.system.capacity) == 0 ? source.system.capacity : weapon.system.capacity;
							await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.type": source.system.ammunition.type, "system.ammunition.caliber": source.system.ammunition.caliber, "system.ammunition.remainingRounds": source.system.capacity, "system.capacity": capacity, "system.capacityType": source.system.capacityType }]);
							console.log("update weapon " + weapon.name + " from actor/token " + actor.name); 
						}
					}
					if (Number(weapon.system.capacity) > 0)
						await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": weapon.system.capacity }]);
				}
			}
		}
	}

	static hasTokenOwnership(tokenId)
	{
		if (game.user.isGM)
			return true;

		if (tokenId == "")
			return false;

		const token = game.scenes.viewed.tokens.get(tokenId);
		if (!token)
			return false;

		const permissions = token._actor.ownership;
		if ((permissions["default"] && permissions["default"] == 3) || (permissions[game.userId] && permissions[game.userId] == 3))
			return true;

		return false;
	}

	static uniqueCanvasNameForNotLinkedActors(token, update)
	{
		if (token._actor.prototypeToken.actorLink)
			return;

		const actor = token.actor;
		let sameActorTokens = canvas.scene.tokens.filter((x) => x.actor && x.actor.id === actor.id);
		if (sameActorTokens.length > 0)
		{
			let nameList = [];
			for (const oldToken of sameActorTokens)
				nameList.push(oldToken.name);

			let i = 1;
			let newName = "";
			do 
			{
				newName = actor.name + " " + (sameActorTokens.length + i).toString();
				++i;
			} while (nameList.includes(newName));

			update["name"] = newName;
		}
	}

	static getTokenName(actorId)
	{
		const actorToken = game.scenes.viewed.tokens.find(e => e.actor._id == actorId);
		if (actorToken)
			return actorToken.name;

		return "?";
	}

	static getDamageTypeAbbr(damageType)
	{
		return game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[damageType]);
	}

	static getItemChatImageHtml(imagepath, small = false)
	{
		let html = "<img class=\"space1889-image\" src=" + imagepath + " alt=\"" + game.i18n.localize("SPACE1889.UnableToLoadImage") + "\"";
		html += (small ? "height=\"75\" />" : "/>") + "<br>";
		return html;
	}

	static addImageToChat(imagepath, whisper = false)
	{
		let theContent = this.getItemChatImageHtml(imagepath);
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${theContent}`,
			whisper: whisper ? [game.user.id] : [],
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
          });
	}

	static async filePickerImageToChat(whisper)
	{
		await new FilePicker({type: "image", current: "",callback: picked}).render(true);
		async function picked(imagepath) {
			SPACE1889Helper.addImageToChat(imagepath, whisper);
		}
	}

	static showPopOutImage(ev)
	{
		const image = $(ev.currentTarget);
		const src = image[0].src;
		new ImagePopout(src, { editable: false, shareable: true }).render(true);
	}

	static getExternalLinksDialogData()
	{
		const isGerman = game.settings.get('core', 'language') == "de";
		let dialogData = {
			title: game.i18n.localize("SPACE1889.ExternalLinksTitel"),
			content: game.i18n.localize("SPACE1889.ExternalLinksContent"),
			buttons: {
				one: {
					icon: '<i class="fad fa-bug" style="font-size:40px"></i>',
					label: game.i18n.localize("SPACE1889.ExternalLinksBugReport"),
					callback: () => {
						var windowObjectReference = window.open("https://github.com/Scepfari/SPACE1889-FVTT/issues/new", "_blank");

					}
				},
				two: {
					icon: '<img src="systems/space1889/icons/foundryDiscord.webp" alt="logo foundry discord" height="50px">',
					label: game.i18n.localize("SPACE1889.ExternalLinksDiscordFoundry"),
					callback: () => {
						var windowObjectReference = window.open("https://discord.gg/foundryvtt", "_blank");
					}
				}
			}
		};

		if (isGerman)
		{
			dialogData.buttons.three = {
				icon: '<img src="systems/space1889/icons/dieGiessereiDiscord.webp" alt="logo foundry discord" height="50px">',
				label: game.i18n.localize("SPACE1889.ExternalLinksDiscordDieGiesserei"),
				callback: () =>
				{
					var windowObjectReference = window.open("https://discord.gg/XrKAZ5J", "_blank");
				}
			}
		}

		dialogData.buttons.four = {
			icon: '<img src="systems/space1889/icons/uhrwerkLogo.png" alt="logo uhrwerk" height="50px">',
			label: game.i18n.localize("SPACE1889.ExternalLinksPublisher"),
			callback: () =>
			{
				var windowObjectReference = window.open("https://www.uhrwerk-verlag.de/", "_blank");

			}
		}

		if (isGerman)
		{
			dialogData.buttons.five = {
				icon: '<img src="systems/space1889/icons/uhrwerkForumLogo.png" alt="logo Uhrwerk Forum" height="50px">',
				label: game.i18n.localize("SPACE1889.ExternalLinksForum"),
				callback: () =>
				{
					var windowObjectReference = window.open("https://community.uhrwerk-verlag.de/index.php?board=14.0", "_blank");
				}
			}
		}

		const add = game.data.addresses.remote.substr(8, 27) == 'freunde-der-oper.moltenhost';
		if (add)
		{
			dialogData.buttons.zero =  {
				icon: '<img src="systems/space1889/icons/space1889Logo.webp" alt="logo SPACE 1889" height="50px">',
				label: "<div title=\"Freunde des gepflegten Rollenspiels\">privates Forum</div>",
				callback: () => {
					var windowObjectReference = window.open("http://www.space1889.shadowbroker.de/", "_blank");
				}
			}
		}

		let dialogOptions = {
			width: 'auto',
			height: '180',
			left: 100,
			top: 20
		};
		return { data: dialogData, options: dialogOptions };
	}
}