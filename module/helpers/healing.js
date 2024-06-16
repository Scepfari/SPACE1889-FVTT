import SPACE1889Helper from "./helper.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";
import SPACE1889Time from "../helpers/time.js";

export default class SPACE1889Healing
{
	static calcRemainingDamage(injury)
	{
		if (!injury || injury.type != "damage")
			return 0;

		let damage = injury.system.damage - injury.system.stylePointDamageReduction - injury.system.completedHealingProgress;
		if (injury.system.firstAidApplied)
			damage -= injury.system.firstAidHealing;

		return Math.max(0, Math.ceil(damage));
	}

	static onFirstAid(ev)
	{
		const button = $(ev.currentTarget);
		if (!button)
			return;

		const firstAidSuccesses = Number(button[0].dataset.firstAidSuccesses);
		//const actorId = button[0].dataset.actorId;
		//const actorTokenId = button[0].dataset.actorTokenId;
		const targetId = button[0].dataset.targetId;
		const isLifesaver = button[0].dataset.lifesaver === 'true';
		const timeStamp = Number(button[0].dataset.timestamp);

		if (targetId == "")
			return;

		const token = SPACE1889Helper.getTokenFromId(targetId);
		if (!token)
			return;

		const combatant = game.combat?.combatants.find((e) => e.tokenId === targetId);
		if (combatant)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.FistAidBlockedInCombat"));
			return;
		}

		//const healerToken = game.scenes.viewed.tokens.get(actorTokenId);
		//const healerName = !attackerToken ? 'unbekannt' : attackerToken.name;
		if (!SPACE1889Helper.hasOwnership(token.actor, true))
			return;

		this.applyFirstAid(token.actor, firstAidSuccesses, isLifesaver, timeStamp);

		SPACE1889Helper.markChatButtonAsDone(ev,
			game.i18n.localize("SPACE1889.ApplyFirstAid"),
			game.i18n.localize("SPACE1889.FirstAidApplied")
		);
	}

	static async applyFirstAid(actor, firstAidSuccesses, fromLivesaver, timestamp)
	{
		if (actor.type !== "character" && actor.type !== "npc")
			return;

		let nonLethalInjuries = [];
		let lethalInjuries = [];

		for (let injury of actor.system.injuries)
		{
			if (!SPACE1889Time.isLessThenOneHour(injury.system.eventTimestamp, timestamp))
				continue;

			if (injury.system.firstAidApplied) //to do: Spaetere Wiederholung ermoeglichen
				continue;

			let info = {
				id: injury._id,
				injury: injury,
				damage: injury.system.damage - injury.system.stylePointDamageReduction,
				firstAidNonLethalConvertedId: "",
//				firstAidApplied: false, //injury.system.firstAidApplied,
				firstAidHealing: 0 //injury.system.firstAidHealing
			}
			if (injury.system.damageType == "lethal")
				lethalInjuries.push(info);
			else
				nonLethalInjuries.push(info);
		}

		let remainingHealingPoints = fromLivesaver ? 2*firstAidSuccesses : firstAidSuccesses;

		if (nonLethalInjuries.length == 0 && lethalInjuries.length == 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.FirstAidAlreadyApplied"));
			return;
		}

		let firstAidInfo = { nonLethalCount: 0, lethalCount: 0, transformed: false };

		for (let info of nonLethalInjuries)
		{
			if (info.damage <= remainingHealingPoints)
			{
				info.firstAidHealing = info.damage;
				remainingHealingPoints -= info.firstAidHealing;
			}
			else if (remainingHealingPoints > 0)
			{
				info.firstAidHealing = remainingHealingPoints;
				remainingHealingPoints = 0;
			}
			firstAidInfo.nonLethalCount += info.firstAidHealing;
			await updateInjury(actor, info);
		}

		for (let info of lethalInjuries)
		{
			if (info.damage * 2 <= remainingHealingPoints)
			{
				info.firstAidHealing = info.damage;
				remainingHealingPoints -= (2 * info.damage);
				firstAidInfo.lethalCount += info.firstAidHealing;
			}
			else if (remainingHealingPoints > 0)
			{
				if (remainingHealingPoints % 2 === 0)
				{
					info.firstAidHealing = remainingHealingPoints / 2;
					remainingHealingPoints = 0;
					firstAidInfo.lethalCount += info.firstAidHealing;
				}
				else
				{
					info.firstAidHealing = Math.ceil(remainingHealingPoints / 2);
					remainingHealingPoints = 0;
					firstAidInfo.lethalCount += info.firstAidHealing - 1;
					firstAidInfo.transformed = true;

					const damageData = [{ name: 'Wunde in Bearbeitung', type: 'damage' }];
					const items = await Item.create(damageData, { parent: actor });
					const nonLethalInjury = items.shift();

					actor.updateEmbeddedDocuments("Item", [{
						_id: nonLethalInjury._id,
						"system.damageType": "nonLethal",
						"name": info.injury.name + " (" + game.i18n.localize("SPACE1889.SpeciSkillErsteHilfe") + ")",
						"img": "icons/skills/wounds/injury-pain-body-orange.webp",
						"system.damage": 1,
						"system.dataOfTheEvent": info.injury.system.dataOfTheEvent,
						"system.eventTimestamp": info.injury.system.eventTimestamp,
						"system.combatInfo.id": info.injury.system.combatInfo.id,
						"system.combatInfo.round": info.injury.system.combatInfo.round,
						"system.combatInfo.turn": info.injury.system.combatInfo.turn,
						"system.firstAidApplied": true
					}]);

					info.firstAidNonLethalConvertedId = nonLethalInjury._id;
				}
			}
			await updateInjury(actor, info);
		}

		this.refreshTheInjuryToBeHealed(actor)
		SPACE1889Time.changeDate(60); //Heildauer ist 60s
		this.sendFirstAidHealingChatMessage(actor, timestamp, firstAidInfo);

		async function updateInjury(actor, updateInfo)
		{
			const injury = actor.items.get(updateInfo.id);
			await injury.update({
				'system.firstAidHealing': updateInfo.firstAidHealing,
				'system.firstAidApplied': true,
				'system.firstAidNonLethalConvertedId': updateInfo.firstAidNonLethalConvertedId
			});
		}
	}

	static sendFirstAidHealingChatMessage(actor, time, firstAidInfo)
	{
		const timeAsString = SPACE1889Time.formatTimeDate(SPACE1889Time.getTimeAndDate(time));
		let content = game.i18n.localize("SPACE1889.HealingThroughFirstAid") + timeAsString;
		content += game.i18n.localize("SPACE1889.FirstAidDuration");

		if (firstAidInfo.lethalCount == 0 && firstAidInfo.nonLethalCount == 0 && !firstAidInfo.transformed)
			content += game.i18n.localize("SPACE1889.FirstAidFailed");
		else
		{
			if (firstAidInfo.nonLethalCount != 0 || firstAidInfo.lethalCount != 0)
				content += game.i18n.format("SPACE1889.FirstAidHealing", { "nonLethal": firstAidInfo.nonLethalCount, "lethal": firstAidInfo.lethalCount, });
			if (firstAidInfo.transformed)
				content +=  game.i18n.localize("SPACE1889.FirstAidLethalToNl");
		}

		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: content
		};

		ChatMessage.create(chatData, {});
	}

	static onStylePointDamageReduction(ev)
	{
		const button = $(ev.currentTarget);
		if (!button)
			return;

		const actorId = button[0].dataset.actorId;
		const speakerTokenId = button[0].dataset.actorTokenId;
		const damageId = button[0].dataset.damageId;
		const originalDamage = Number(button[0].dataset.damage);
		const originalDamageType = button[0].dataset.damageType;
		const originalDamageName = button[0].dataset.damageName;
		const weaponEffect = button[0].dataset.weaponEffectName;
		const weaponEffectTurns = button[0].dataset.weaponEffectTurns;
		const weaponEffectOnly = button[0].dataset.weaponEffectOnly;
		const timeStamp = Number(button[0].dataset.timestamp);
		let createdEffectIds = [];
		const createdEffectIdsString = button[0].dataset.createdEffectIds;
		if (createdEffectIdsString.length > 0)
			createdEffectIds = createdEffectIdsString.split("|");
		
		if (speakerTokenId == "" && actorId == "")
			return;

		let actor = SPACE1889Helper.getTokenFromId(speakerTokenId)?.actor;
		if (!actor)
			actor = game.actors.get(actorId);

		if (!actor)
			return;

		if (actor.system.style.value < 2)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NotEnoughStylePointsForDamageReduction"));
		}

		if (!SPACE1889Helper.hasOwnership(actor, true))
			return;

		this.stylePointDamageReduction(ev, actor, damageId, originalDamage, originalDamageType, originalDamageName, weaponEffect, weaponEffectTurns, weaponEffectOnly, timeStamp, createdEffectIds);
	}

	static stylePointDamageReduction(ev, actor, damageId, originalDamage, originalDamageType, originalDamageName, weaponEffect, weaponEffectTurns, weaponEffectOnly, timeStamp, createdEffectIds)
	{
		const injury = actor.items.get(damageId);
		if (!injury ||
			injury.system?.damage != originalDamage ||
			injury.system?.damageType != originalDamageType ||
			injury.system?.stylePointDamageReduction != 0 ||
			injury.system?.firstAidApplied ||
			!this.isSameTime(injury) )
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.InvalidDamageForStylePointUse"));
			return;
		}

		const actorStylePoints = actor.system.style.value;
		const maxReduction = Math.min(Math.floor(actorStylePoints / 2), originalDamage);
		const damageLocalized = game.i18n.localize("SPACE1889.Damage");
		const stylePointsLocalized = game.i18n.localize("SPACE1889.StylePoints");
		let reductionOptions = '<option value="0" selected="selected">-</option>';
		for (let i = 1; i <= maxReduction; ++i)
		{
			reductionOptions += `<option value="${i}"> ${i} ${damageLocalized} (${i * 2} ${stylePointsLocalized})</option>`;
		}

		const inputDesc = game.i18n.localize("SPACE1889.ChooseDamageReduction") + ":";

		let dialogue = new Dialog(
			{
				title: `${game.i18n.localize("SPACE1889.UseStylePoints")}: (${actorStylePoints})`,
				content: `<p>${inputDesc}:</p><p><select id="choices" name="choices">${reductionOptions}</select></p>`,
				buttons:
				{
					ok:
					{
						icon: '',
						label: game.i18n.localize("SPACE1889.Apply"),
						callback: (html) => myCallback(html)
					},
					abbruch:
					{
						label: game.i18n.localize("SPACE1889.Cancel"),
						callback: () => { },
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok"
			}).render(true);

		async function myCallback(html)
		{
			const input = html.find('#choices').val();
			const damageReduction = input ? Number(input) : 0;

			if (damageReduction == 0 || actorStylePoints != actor.system.style.value)
				return;

			await actor.updateEmbeddedDocuments("Item", [{ _id: injury._id, "system.stylePointDamageReduction": damageReduction }]);
			await actor.update({ "system.style.value": actor.system.style.value - (damageReduction * 2) });

			// effekte löschen
			for (const id of createdEffectIds)
			{
				let effect = actor.effects.get(id);
				if (effect)
					await effect.delete();
			}

			await SPACE1889Healing.refreshTheInjuryToBeHealed(actor);
			await SPACE1889RollHelper.doDamageChatMessage(actor, damageId, originalDamage-damageReduction, originalDamageType, originalDamageName, weaponEffect, weaponEffectTurns, weaponEffectOnly, false);

			SPACE1889Helper.markChatButtonAsDone(ev,
				game.i18n.localize("SPACE1889.UseStylePoints"),
				game.i18n.format("SPACE1889.StylePointsUsed", { spCount: damageReduction * 2 })
			);
		}
	}

	static isSameTime(injury)
	{
		const checkTimestamps = SPACE1889Time.isSimpleCalendarEnabled();

		let isSame = checkTimestamps ? injury.system.eventTimestamp == SPACE1889Time.getCurrentTimestamp() : true;
		const isCombat = game.combat?.active && game.combat?.started;
		if ((isCombat || injury.system.combatInfo.id != "") && isSame)
		{
			isSame = injury.system.combatInfo.id == (isCombat ? game.combat.id : "") &&
				injury.system.combatInfo.round == (isCombat ? game.combat.round : 0) &&
				injury.system.combatInfo.turn == (isCombat ? game.combat.turn : 0)
		}

		return isSame;
	}

	static findInjuryToHeal(actor, overrideStartHealingTimeStamp = Infinity)
	{
		if (!actor || SPACE1889Helper.isDead(actor))
			return undefined;

		const injuryInHealingId = actor.system.healing.currentHealingDamageId;
		let minTime = Infinity;
		let wantedInjury = undefined;
		const healingStartTimeStamp = overrideStartHealingTimeStamp == Infinity ? actor.system.healing.startOfHealingTimeStamp : overrideStartHealingTimeStamp;

		for (const injury of actor.system.injuries)
		{
			if (injury.system.remainingDamage == 0 || injury.system.damageType != "nonLethal")
				continue;

			const healingTimeForTheNextHealthPoint = this.getHealingTimeInSecondsForNextHealthPoint(injury, injuryInHealingId, healingStartTimeStamp);

			if (healingTimeForTheNextHealthPoint < minTime)
			{
				wantedInjury = injury;
				minTime = healingTimeForTheNextHealthPoint
			}
		}

		if (minTime < Infinity && wantedInjury != undefined)
			return wantedInjury;

		for (const injury of actor.system.injuries)
		{
			if (injury.system.remainingDamage == 0 || injury.system.damageType == "nonLethal")
				continue;

			const healingTimeForTheNextHealthPoint = this.getHealingTimeInSecondsForNextHealthPoint(injury, injuryInHealingId, healingStartTimeStamp);

			if (healingTimeForTheNextHealthPoint < minTime)
			{
				wantedInjury = injury;
				minTime = healingTimeForTheNextHealthPoint;
			}
		}
		return wantedInjury;
	}

	static getHealingTimeInSecondsForNextHealthPoint(injury, injuryInHealingId, healingStartTimeStamp)
	{
		if (!injury || injury.system.remainingDamage == 0)
			return Infinity;

		let neededSecondsToHeal = this.getHealingSecondsByDamageType(injury.system?.damageType);
		const investedTime = injury.system.completedHealingProgress - Math.floor(injury.system.completedHealingProgress);
		if (investedTime > 0)
			neededSecondsToHeal *= (1 - investedTime);

		let healingTime = neededSecondsToHeal / injury.system.healingFactor;

		if (injury.id == injuryInHealingId && SPACE1889Time.isSimpleCalendarEnabled())
			healingTime -= this.getPastTimeInSeconds(healingStartTimeStamp)

		return healingTime;
	}

	static getHealingSecondsByDamageType(damageType)
	{
		const oneDayInSeconds = 86400  // 24 * 60 * 60s = 86400s
		return (damageType == "nonLethal" ? 1 : 7) * oneDayInSeconds;
	}

	static getPastTimeInSeconds(healingStartTimeStamp)
	{
		if (healingStartTimeStamp == 0 || healingStartTimeStamp == Infinity || !SPACE1889Time.isSimpleCalendarEnabled())
			return 0;

		// nur wenn der aktuelle Zeitpunkt nach dem Heilstart liegt, wird ein Wert != 0 zurückgeliefert
		return Math.max(SPACE1889Time.getTimeDifInSeconds(SPACE1889Time.getCurrentTimestamp(), healingStartTimeStamp), 0);
	}

	static healByTime()
	{
		if (!game.user.isGM)
			return;

		for (let actor of game.actors)
		{
			if (actor.type != "npc" && actor.type != "character")
				continue;

			if (SPACE1889Helper.isDead(actor))
				continue;

			this.healActorByTime(actor);
		}
	}

	static async healActorByTime(actor)
	{
		if (!actor)
			return;

		await this.removeOutdatedEffects(actor);

		const pastTime = this.getPastTimeInSeconds(actor.system.healing.startOfHealingTimeStamp);
		let healingTimeForCurrentHealing = Infinity;
		let healingInjury = undefined;
		if (actor.system.healing.currentHealingDamageId != "")
		{
			healingInjury = actor.items.get(actor.system.healing.currentHealingDamageId);
			healingTimeForCurrentHealing = this.getHealingTimeInSecondsForNextHealthPoint(healingInjury, "", actor.system.healing.startOfHealingTimeStamp);

			if (healingTimeForCurrentHealing < Infinity && pastTime >= healingTimeForCurrentHealing)
			{
				// es ist genug Zeit verstrichen um mind. eine Gesundheit zu heilen
				const newStartTimeStamp = actor.system.healing.startOfHealingTimeStamp + healingTimeForCurrentHealing;
				const completedHealingProgress = Math.floor(healingInjury.system.completedHealingProgress) + 1;
				await actor.updateEmbeddedDocuments("Item", [{ _id: healingInjury.id, "system.completedHealingProgress": completedHealingProgress }]);
				this.sendHealingChatMessage(actor, healingInjury, newStartTimeStamp);

				// nächstes Heilobjekt identifizieren, markieren, benötigte Zeit abstreichen und dann nochmal von vorn
				const nextInjuryToHeal = this.findInjuryToHeal(actor, newStartTimeStamp);
				const nextInjuryId = nextInjuryToHeal ? nextInjuryToHeal.id : "";
				await actor.update({ 'system.healing.currentHealingDamageId': nextInjuryId, "system.healing.startOfHealingTimeStamp": newStartTimeStamp });
				await this.healActorByTime(actor);
				return;
			}
		}

		let injury = this.findInjuryToHeal(actor);
		if (!injury)
			return;

		if (actor.system.healing.currentHealingDamageId == injury.id)
		{
			actor.prepareData();
			return;
		}

		if (actor.system.healing.currentHealingDamageId != "" && healingInjury)
		{
			// bisherigen Fortschritt verbuchen
			let neededSecondsToHeal = this.getHealingSecondsByDamageType(healingInjury.system?.damageType);
			const progress = pastTime * healingInjury.system.healingFactor / neededSecondsToHeal;
			const completedHealingProgress = healingInjury.system.completedHealingProgress + progress;
			if (Math.floor(completedHealingProgress) != Math.floor(healingInjury.system.completedHealingProgress))
			{
				ui.notifications.info(game.i18n.format("SPACE1889.HealingError", { actorName: actor.name, injuryName: healingInjury.name }));
				const info = `potenzieller Fehler in der Heilung\nActor ${actor.name} (id: ${actor.id}) injury ${healingInjury.name} (id: ${healingInjury.id}) \nHealing progress uncertain: ${Math.floor(completedHealingProgress)} != ${Math.floor(healingInjury.system.completedHealingProgress)}`;
				console.log(info);
			}

			await actor.updateEmbeddedDocuments("Item", [{ _id: healingInjury.id, "system.completedHealingProgress": completedHealingProgress }]);
			await actor.update({ 'system.healing.currentHealingDamageId': injury.id, "system.healing.startOfHealingTimeStamp": SPACE1889Time.getCurrentTimestamp() });
		}
		else
		{
			await actor.update({ 'system.healing.currentHealingDamageId': injury.id, "system.healing.startOfHealingTimeStamp": SPACE1889Time.getCurrentTimestamp() });			
		}
	}

	static async refreshTheInjuryToBeHealed(actor)
	{
		let injury = this.findInjuryToHeal(actor);
		if (!injury)
		{
			if (actor.system.healing.currentHealingDamageId != "")
				await actor.update({ 'system.healing.currentHealingDamageId': "", "system.healing.startOfHealingTimeStamp": 0 });

			return;
		}

		if (actor.system.healing.currentHealingDamageId != "" && actor.system.healing.currentHealingDamageId != injury.id)
		{
			const healingInjury = actor.items.get(actor.system.healing.currentHealingDamageId);
			if (healingInjury)
			{
				const pastTime = this.getPastTimeInSeconds(actor.system.healing.startOfHealingTimeStamp);
				let neededSecondsToHeal = this.getHealingSecondsByDamageType(healingInjury.system?.damageType);
				const progress = pastTime * healingInjury.system.healingFactor / neededSecondsToHeal;
				const completedHealingProgress = healingInjury.system.completedHealingProgress + progress;
				// bisherigen Fortschritt verbuchen
				if (Math.floor(completedHealingProgress) == Math.floor(healingInjury.system.completedHealingProgress))
					await actor.updateEmbeddedDocuments("Item", [{ _id: healingInjury.id, "system.completedHealingProgress": completedHealingProgress }]);
				else
					console.log("Fehler in function healActorByTime()");
			}
			await actor.update({ 'system.healing.currentHealingDamageId': injury.id, "system.healing.startOfHealingTimeStamp": SPACE1889Time.getCurrentTimestamp() });
		}
		if (actor.system.healing.currentHealingDamageId == "")
		{
			await actor.update({ 'system.healing.currentHealingDamageId': injury.id, "system.healing.startOfHealingTimeStamp": SPACE1889Time.getCurrentTimestamp() });
		}
	}

	static getHealingProgressOnActivePoint(actor, injury)
	{
		if (!actor || !injury )
			return 0;

		const current = actor.items.get(actor.system.healing.currentHealingDamageId);
		if (!current || current.id != injury.id)
			return injury.system.completedHealingProgress - Math.floor(injury.system.completedHealingProgress);

		const pastTime = this.getPastTimeInSeconds(actor.system.healing.startOfHealingTimeStamp);
		let neededSecondsToHeal = this.getHealingSecondsByDamageType(injury.system?.damageType);
		let progress = pastTime * injury.system.healingFactor / neededSecondsToHeal;
		progress += injury.system.completedHealingProgress - Math.floor(injury.system.completedHealingProgress);
		return progress;
	}

	static async changeHealingFactor(actor, injuryId, newHealingFactor)
	{
		const injury = actor.items.get(injuryId)

		if (!actor || !injury || !newHealingFactor)
			return;

		if (this.calcRemainingDamage(injury) == 0)
		{
			await actor.updateEmbeddedDocuments("Item", [{ _id: injuryId, "system.healingFactor": newHealingFactor }]);
			return;
		}

		const healingInjury = actor.items.get(actor.system.healing.currentHealingDamageId);
		let setNewTime = false;
		let isFactorUpdateDone = false;
		if (healingInjury)
		{
			
			const pastTime = this.getPastTimeInSeconds(actor.system.healing.startOfHealingTimeStamp);
			if (pastTime > 0)
			{
				setNewTime = true;
				let neededSecondsToHeal = this.getHealingSecondsByDamageType(healingInjury.system.damageType);
				const progress = pastTime * healingInjury.system.healingFactor / neededSecondsToHeal;
				const progressOfActualPoint = Math.min(progress + healingInjury.system.completedHealingProgress - Math.trunc(healingInjury.system.completedHealingProgress), 1);
				const completedProgress = Math.trunc(healingInjury.system.completedHealingProgress) + progressOfActualPoint;
				if (injuryId == healingInjury.id)
				{
					await actor.updateEmbeddedDocuments("Item", [{
						_id: healingInjury.id, "system.completedHealingProgress": completedProgress,
						"system.healingFactor": newHealingFactor
					}]);
					isFactorUpdateDone = true;
				}
				else
				{
					await actor.updateEmbeddedDocuments("Item", [{
						_id: healingInjury.id, "system.completedHealingProgress": completedProgress
					}]);
				}
			}
		}

		if (!isFactorUpdateDone)
			await actor.updateEmbeddedDocuments("Item", [{ _id: injuryId, "system.healingFactor": newHealingFactor }]);

		let currentTime = SPACE1889Time.getCurrentTimestamp();
		let newHealing = this.findInjuryToHeal(actor, currentTime)
		let newHealingId = newHealing ? newHealing.id : "";
		if (actor.system.healing.currentHealingDamageId != newHealingId || setNewTime)
		{
			let newTime = actor.system.healing.startOfHealingTimeStamp;
			if (setNewTime || newTime == 0)
				newTime = currentTime;

			await actor.update({
				"system.healing.currentHealingDamageId": newHealingId,
				"system.healing.startOfHealingTimeStamp": newTime
			});
		}
	}

	static sendHealingChatMessage(actor, injury, time)
	{
		const timeAsString = SPACE1889Time.formatTimeDate(SPACE1889Time.getTimeAndDate(time));
		const messageContent = injury.system.remainingDamage > 0 ?
			game.i18n.format("SPACE1889.ChatPartiallyHealed", { "name": injury.name, "date": timeAsString, "damage": injury.system.remainingDamage }) :
			game.i18n.format("SPACE1889.ChatHealed", { "name": injury.name, "date": timeAsString});
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static async removeOutdatedEffects(actor)
	{
		if (!actor)
			return;
		
		let effectsToRemove = [];
		for (let effect of actor.effects)
		{
			if (!effect.duration)
				continue;

			if (effect.duration.combat && game.combats.has(effect.duration.combat)) // do not touch a running combat
				continue;

			const pastTime = this.getPastTimeInSeconds(effect.duration.startTime);

			if (effect.duration.seconds > 0 && effect.duration.seconds < pastTime)
				effectsToRemove.push(effect._id);

		}
		if (effectsToRemove.length > 0)
			await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove);

	}

	
	static async checkDying()
	{
		if (game.user.isGM)
		{
			const combatTokenId = game.combat?.combatant?.token?.id;
			const token = canvas.tokens.get(combatTokenId);
			const actor = token?.actor;
			await this.stabilize(actor, token.name);
		}
	}

	static async stabilize(actor, tokenName)
	{
		if (!actor || !SPACE1889Helper.isDying(actor))
			return;

		const damage = SPACE1889Helper.getDamageTuple(actor);
		const penalty = Math.min(actor.system.health.max - damage.lethal, 0);
		const dice = (2 * actor.system.abilities.con.total) + penalty;

		let messageContent = game.i18n.localize("SPACE1889.ChatStabilizing");
		const info = game.i18n.localize("SPACE1889.ChatReflexiveBodyRoll");
		const toolTipInfo = game.i18n.format("SPACE1889.ChatNegativeHealthPenalty", { penalty: penalty });

		const rollWithHtml = await SPACE1889RollHelper.createInlineRollWithHtml(Math.max(0, dice), info, toolTipInfo);
		messageContent += `${rollWithHtml.html} <br>`;

		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const name = tokenName ? tokenName : actor.name;

		if (rollWithHtml.roll.total >= 2)
		{
			
			messageContent += game.i18n.format("SPACE1889.ChatStabilizingSuccess", { name: name });
			this.removeDyingEffect(actor);
		}
		else
		{
			messageContent += game.i18n.format("SPACE1889.ChatStabilizingFail", { name: name });
			const combatData = this.getCombatData();
			const damageId = await this.addFailStabilizingDamage(actor, combatData);
			const damageInfo = this.getDamageInfo;

			let healthInfo = game.i18n.format("SPACE1889.ChatInfoHealth", { health: actor.system.health.value.toString() });
			if (damageInfo.nonLethalValue !== damageInfo.lethalValue)
				healthInfo += game.i18n.format("SPACE1889.ChatInfoHealthLethalDamageOnly", { lethalHealth: (damageInfo.lethalValue).toString() });

			messageContent += `<br><small> ${healthInfo}</small>`;
			let effectIds = [];

			if (damageInfo.isDead)
			{
				messageContent += "<p><b>" + game.i18n.localize("SPACE1889.Dead") + ":</b> ";
				messageContent += game.i18n.localize("SPACE1889.ChatInfoDead") + "</p>";

				const effects = [{ name: "dead", rounds: SPACE1889RollHelper.getMaxRounds() }];
				effectIds = await SPACE1889Helper.addEffects(actor, effects);
			}

			messageContent += this.createStylePointStabilizingButton(actor, speaker, damageId, combatData, effectIds, rollWithHtml.roll.total);
		}

		let chatData =
		{
			user: game.user.id,
			speaker: speaker,
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static async removeDyingEffect(actor)
	{
		let effectsToRemove = [];
		for (let effect of actor.effects)
		{
			if (SPACE1889RollHelper.hasActiveEffectState(effect, "dying"))
				effectsToRemove.push(effect.id);
		}
		if (effectsToRemove.length > 0)
			await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove);
	}

	static createStylePointStabilizingButton(actor, speaker, damageId, combatData, effectIds, rollTotal)
	{
		const buttonText = game.i18n.localize("SPACE1889.UseStylePoints");
		const buttonToolTip = game.i18n.localize("SPACE1889.UseSpForStabilizing");

		const currentTimeDate = SPACE1889Time.getCurrentTimestamp();
		let effectIdsString = "";
		for (const id of effectIds)
		{
			if (effectIdsString.length > 0)
				effectIdsString += "|";
			effectIdsString += id.toString();
		}

		return `<button class="applyStylePointForStabilizing chatButton" 
				data-tooltip="${buttonToolTip}"
				data-action="stabilizing"
				data-actor-id="${actor._id}" 
				data-actor-token-id="${speaker.token}" 
				data-damage-id="${damageId}" 
				data-roll-total="${rollTotal}"
				data-created-effect-Ids="${effectIdsString}" 
				data-combat-id="${combatData.id}" 
				data-combat-round="${combatData.round}" 
				data-combat-turn="${combatData.turn}" 
				data-timestamp="${currentTimeDate}">${buttonText}</button>`;
	}

	/**
	 *
	 * @param {Space1889Actor} actor
	 * @param {object} combatData
	 */
	static async addFailStabilizingDamage(actor, combatData)
	{
		const data = [{
			name: game.i18n.localize("SPACE1889.BleedToDeath"),
			type: "damage",
			img: "icons/skills/wounds/blood-drip-droplet-red.webp"
		}];

		const item = await actor.addDamageWithData(data);

		await actor.updateEmbeddedDocuments("Item", [{
			_id: item.id,
			"system.damageType": "lethal",
			"system.damage": 1,
			"system.dataOfTheEvent": combatData.date,
			"system.eventTimestamp": combatData.timestamp,
			"system.combatInfo.id": combatData.id,
			"system.combatInfo.round": combatData.round,
			"system.combatInfo.turn": combatData.turn
		}]);
		return item.id;
	}

	static getCombatData()
	{
		const isCombat = game.combat?.active && game.combat?.started;
		const data = {
			timestamp: SPACE1889Time.getCurrentTimestamp(),
			date: SPACE1889Time.getCurrentTimeDateString(),
			id: (isCombat ? game.combat.id : ""),
			round: (isCombat ? game.combat.round : 0),
			turn: (isCombat ? game.combat.turn : 0)
		};
		return data;
	}

	static getDamageInfo(actor)
	{
		const damageTuple = SPACE1889Helper.getDamageTuple(actor);
		let lethalValue = actor.system.health.max - damageTuple.lethal;
		let nonLethalValue = lethalValue - damageTuple.nonLethal;
		const deathThreshold = SPACE1889Helper.getDeathThreshold(actor);
		if (lethalValue > deathThreshold && nonLethalValue < deathThreshold)
		{
			const transformedNonLethal = nonLethalValue - deathThreshold;
			nonLethalValue -= transformedNonLethal;
			lethalValue += transformedNonLethal;
		}
		return {lethalValue: lethalValue, nonLethalValue: nonLethalValue, deathThreshold: deathThreshold, isDead: lethalValue <= deathThreshold};
	}

	static async onStylePointStabilizing(ev)
	{
		const button = $(ev.currentTarget);
		if (!button)
			return;

		const actorId = button[0].dataset.actorId;
		const speakerTokenId = button[0].dataset.actorTokenId;
		const damageId = button[0].dataset.damageId;
		const rollTotal = Number(button[0].dataset.rollTotal);
		const combatId = button[0].dataset.combatId;
		const combatTurn = Number(button[0].dataset.combatTurn);
		const combatRound = Number(button[0].dataset.combatRound);
		const timeStamp = Number(button[0].dataset.timestamp);
		let createdEffectIds = [];
		const createdEffectIdsString = button[0].dataset.createdEffectIds;
		if (createdEffectIdsString.length > 0)
			createdEffectIds = createdEffectIdsString.split("|");
		
		if (speakerTokenId === "" && actorId === "")
			return;

		let actor = SPACE1889Helper.getTokenFromId(speakerTokenId)?.actor;
		if (!actor)
			actor = game.actors.get(actorId);

		if (!actor)
			return;

		const stylePoints = 4 - (2 * rollTotal);
		if (actor.system.style.value < stylePoints)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.NotEnoughStylePointsToStabilize", {name: actor.name, needed: stylePoints, existSp: actor.system.style.value}));
		}

		if (!SPACE1889Helper.hasOwnership(actor, true))
			return;

		const injury = actor.items.get(damageId);
		if (!injury || !this.isSameTime(injury) )
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.InvalidStylePointStabilizationUse"));
			return;
		}

		await actor.deleteEmbeddedDocuments("Item", [damageId]);
		await actor.update({ "system.style.value": actor.system.style.value - (stylePoints) });

		// effekte löschen
		for (const id of createdEffectIds)
		{
			let effect = actor.effects.get(id);
			if (effect)
				await effect.delete();
		}
		await this.removeDyingEffect(actor);

		await SPACE1889Healing.refreshTheInjuryToBeHealed(actor);

		SPACE1889Helper.markChatButtonAsDone(ev,
			game.i18n.localize("SPACE1889.UseStylePoints"),
			game.i18n.format("SPACE1889.StylePointsUsed", { spCount: stylePoints })
		);

		let content = game.i18n.localize("SPACE1889.ChatStabilizing") + game.i18n.format("SPACE1889.ChatStabilizingSuccess", { name: actor.name });

		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			whisper: [],
			content: content
		};

		ChatMessage.create(chatData, {});
	}
}
