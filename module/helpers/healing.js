import SPACE1889Helper from "./helper.mjs";
import SPACE1889RollHelper from "../helpers/roll-helper.mjs";
import SPACE1889Time from "../helpers/time.js";

export default class SPACE1889Healing
{
	static OnFirstAid(ev)
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

		const token = game.scenes.viewed.tokens.get(targetId);
		if (!token)
			return;

		//const healerToken = game.scenes.viewed.tokens.get(actorTokenId);
		//const healerName = !attackerToken ? 'unbekannt' : attackerToken.name;
		if (!SPACE1889Helper.hasOwnership(token.actor, true))
			return;

		this.ApplyFirstAid(token.actor, firstAidSuccesses, isLifesaver, timeStamp);

		SPACE1889Helper.markChatButtonAsDone(ev,
			game.i18n.localize("SPACE1889.ApplyFirstAid"),
			game.i18n.localize("SPACE1889.FirstAidApplied")
		);
	}

	static async ApplyFirstAid(actor, firstAidSuccesses, fromLivesaver, timestamp)
	{
		if (actor.type !== "character" && actor.type !== "npc")
			return;

		let nonLethalInjuries = [];
		let lethalInjuries = [];

		for (let injury of actor.system.injuries)
		{
			if (!SPACE1889Time.isLessThenOneHour(injury.system.eventTimestamp, timestamp))
				continue;

			if (injury.system.firstAidApplied) //to do: Sp�tere Wiederholung erm�glichen
				continue;

			let info = {
				id: injury._id,
				injury: injury,
				damage: injury.system.damage - injury.system.stylePointDamageReduction,
				firstAidNonLeathalConvertedId: "",
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
			await updateInjury(actor, info);
		}

		for (let info of lethalInjuries)
		{
			if (info.damage * 2 <= remainingHealingPoints)
			{
				info.firstAidHealing = info.damage;
				remainingHealingPoints -= (2 * info.damage);
			}
			else if (remainingHealingPoints > 0)
			{
				if (remainingHealingPoints % 2 === 0)
				{
					info.firstAidHealing = remainingHealingPoints / 2;
					remainingHealingPoints = 0;
				}
				else
				{
					info.firstAidHealing = Math.ceil(remainingHealingPoints / 2);
					remainingHealingPoints = 0;

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

					info.firstAidNonLeathalConvertedId = nonLethalInjury._id;
				}
			}
			await updateInjury(actor, info);
		}
		ui.notifications.info('Erste Hilfe ausgeführt');

		async function updateInjury(actor, updateInfo)
		{
			const injury = actor.items.get(updateInfo.id);
			await injury.update({
				'system.firstAidHealing': updateInfo.firstAidHealing,
				'system.firstAidApplied': true,
				'system.firstAidNonLeathalConvertedId': updateInfo.firstAidNonLeathalConvertedId
			});
		}
	}

	static OnStylePointDamageReduction(ev)
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

		let actor = game.scenes.viewed.tokens.get(speakerTokenId)?.actor;
		if (!actor)
			actor = game.actors.get(actorId)

		if (!actor)
			return;

		if (actor.system.style.value < 2)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NotEnoughStylePointsForDamageReduction"));
		}

		if (!SPACE1889Helper.hasOwnership(actor, true))
			return;

		this.StylePointDamageReduction(ev, actor, damageId, originalDamage, originalDamageType, originalDamageName, weaponEffect, weaponEffectTurns, weaponEffectOnly, timeStamp, createdEffectIds);
	}

	static StylePointDamageReduction(ev, actor, damageId, originalDamage, originalDamageType, originalDamageName, weaponEffect, weaponEffectTurns, weaponEffectOnly, timeStamp, createdEffectIds)
	{
		const injury = actor.items.get(damageId);
		if (!injury ||
			injury.system?.damage != originalDamage ||
			injury.system?.damageType != originalDamageType ||
			injury.system?.stylePointDamageReduction != 0 ||
			injury.system?.firstAidApplied ||
			!isSameTime(injury) )
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
		
		//zwei Optionen Schaden reduzieren oder Verteidigung erhöhen, letzteres ist interessant
		//bei Waffen mit Flächenschaden

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
						label: 'Abbrechen',
						callback: () => { },
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok"
			}).render(true);

		async function myCallback(html)
		{
			const chatoption = "public";
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

			await SPACE1889RollHelper.doDamageChatMessage(actor, damageId, originalDamage-damageReduction, originalDamageType, originalDamageName, weaponEffect, weaponEffectTurns, weaponEffectOnly, false);

			SPACE1889Helper.markChatButtonAsDone(ev,
				game.i18n.localize("SPACE1889.UseStylePoints"),
				game.i18n.format("SPACE1889.StylePointsUsed", { spCount: damageReduction * 2 })
			);

		}

		function isSameTime(injury)
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
	}
}
