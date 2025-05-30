import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889Combat from "../helpers/combat.js";
import DistanceMeasuring from "../helpers/distanceMeasuring.js"
import SPACE1889Time from "../helpers/time.js"
import SPACE1889Healing from "./healing.js";
import SPACE1889Light from "./light.js";
import { SPACE1889 } from "./config.js";

export default class SPACE1889RollHelper
{
	static getEventEvaluation(event)
	{
		const showInfoOnly = event?.altKey;
		const showDialog = !showInfoOnly && (event?.shiftKey || event?.ctrlKey);
		const specialDialog = !showInfoOnly && (event?.shiftKey && event?.ctrlKey);
		const doNotWhisperInfo = event?.shiftKey || event?.ctrlKey;
		return { showDialog: showDialog, showInfoOnly: showInfoOnly, whisperInfo: !doNotWhisperInfo, specialDialog: specialDialog };
	}

	static rollItemFromEvent(item, actor, event)
	{
		if (item == undefined)
			return;

		const evaluation = this.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.rollItemInfo(item, actor, evaluation.whisperInfo);

		const dieCount = this.getDieCount(item, actor);
		this.rollItem(item, actor, dieCount, evaluation.showDialog);
	}

	static rollItem(item, actor, dieCount, showDialog)
	{
		if (item.type == "weapon" || item.isAttackTalent())
		{
			if (!SPACE1889Combat.IsActorParticipantOfTheActiveEncounter(actor, true))
				return;

			const targetInfo = SPACE1889Helper.getCombatSupportTargetInfo();
			if (targetInfo.combatSupport && (targetInfo.targets == 0 || targetInfo.isDeadCount > 0))
			{
				this.reallyAttackDialog(item, "", undefined, actor, dieCount, showDialog, targetInfo, undefined);
				return;
			}

			if (!SPACE1889Combat.isTargetInRange(actor, item))
				return;
		}

		if (item.type == 'talent')
			this.rollSpecialTalent(item, actor, dieCount, showDialog)
		else
			this.rollSpecial(item, actor, dieCount, showDialog);
	}

	static reallyAttackDialog(item, manoeuverType, actorTokenDocument, actor, dieCount, showDialog, info)
	{
		let text = info.targets == 0 ? game.i18n.localize("SPACE1889.NoTarget") : game.i18n.localize("SPACE1889.DeadTarget");
		if (info.targets > 1 && info.isDeadCount >= 1)
			text = game.i18n.format("SPACE1889.DeadTargets", { count: info.targets, dead: info.isDeadCount });

		const titelInfo = game.i18n.localize("SPACE1889.DoAttack");
		let dialogue = new Dialog(
			{
				title: `${titelInfo}`,
				content: `<p>${text}</p>`,
				buttons:
				{
					ok:
					{
						icon: '',
						label: game.i18n.localize("SPACE1889.Go"),
						callback: (html) => myCallback(html)
					},
					abbruch:
					{
						label: game.i18n.localize("SPACE1889.Cancel"),
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok"
			}).render(true);

		async function myCallback(html)
		{
			if (manoeuverType === "grapple")
			{
				SPACE1889RollHelper.rollGrapple(actorTokenDocument, actor, showDialog);
			}
			else if (manoeuverType === "trip")
			{
				SPACE1889RollHelper.rollTrip(actorTokenDocument, actor, showDialog);
			}
			else if (manoeuverType === "disarm")
			{
				SPACE1889RollHelper.rollDisarm(actorTokenDocument, actor, item, showDialog);
			}
			else if (item)
			{
				if (item.type === 'talent')
					SPACE1889RollHelper.rollSpecialTalent(item, actor, dieCount, showDialog);
				else
					SPACE1889RollHelper.rollSpecial(item, actor, dieCount, showDialog);
			}
		}
	}

	static getDieCount(item, actor)
	{
		if (item.type == 'skill')
			return item.system.rating;
		if (item.type == 'specialization')
			return item.system.rating;
		if (item.type == 'weapon')
			return item.system.attack;
		if (item.type == 'talent' && item.system.isRollable)
			return this.getTalentDieCount(item, actor);

		return 0;
	}

	static getTalentDieCount(item, actor)
	{
		if (item.type == "talent" && item.system.isRollable)
		{
			if (item.system.id == "geschaerfterSinn")
				return Math.max(actor.system.secondaries.perception.total + Number(item.system.bonus), 0);
			else if (item.system.id == "paralysierenderSchlag")
			{
				const skillItem = actor.items.find(e => e.system.id == "waffenlos");
				if (skillItem != undefined)
					return Math.max(0, skillItem.system.rating + ((item.system.level.total - 1) * 2));
			}
			else if (item.system.id == "assassine")
			{
				const skillItem = actor.items.find(e => e.system.id == "heimlichkeit");
				if (skillItem != undefined)
				{
					const theWeaponInfo = SPACE1889RollHelper.getWeaponWithDamageFromTalent(actor, item, true);
					if (!theWeaponInfo.weapon)
						return 0;
					const weaponDamage = theWeaponInfo.damage;
					return Math.max(0, skillItem.system.rating + weaponDamage + ((item.system.level.total - 1) * 2));
				}
			}
			else if (item.system.id == "eigenartigerKampfstil")
			{
				const defense = actor.system.secondaries.defense.total;
				return (defense + (Number(item.system.level.total) * 2));
			}
			return 0;
		}
	}

	static getWeaponFromTalent(actor, talentItem, notify = false)
	{
		const values = this.getWeaponWithDamageFromTalent(actor, talentItem, notify);
		return values.weapon;
	}

	static getWeaponWithDamageFromTalent(actor, talentItem, notify = false)
	{
		let theWeapon = undefined;
		let maxDamage = -1000;
		if (talentItem.system.id == "assassine")
		{
			// nimmt die in den Händen gehaltene Nahkampfwaffe, die den meisten Schaden verursacht, beachtet Nebenhandabzug

			for (const weapon of actor.system.weapons)
			{
				if (weapon.system.usedHands == "none" || weapon.system.skillId != "nahkampf")
					continue;

				let malus = 0;
				if (weapon.system.usedHands == "offHand")
					malus = SPACE1889Helper.getTalentLevel(actor, "beidhaendig") == 0 ? -2 : 0
				let damage = weapon.system.damage + malus;
				if (damage > maxDamage)
				{
					maxDamage = damage;
					theWeapon = weapon;
				}
			}
			if (!theWeapon && notify)
				ui.notifications.info(game.i18n.localize("SPACE1889.NoMeleeWeaponAssasine"));
		}
		if (!theWeapon)
			return { weapon: theWeapon };
		return { weapon: theWeapon, damage: maxDamage };
	}

	/**
	 *
	 * @param {object} item
	 * @param {object} actor
	 * @param {number} dieCount
	 * @param {boolean} showDialog
	*/
	static rollSpecial(item, actor, dieCount, showDialog)
	{
		if (item.type == "weapon" || item.type == "skill" || item.type == "specialization")
		{
			if (item.type == "weapon" && showDialog && (actor.type == "character" || actor.type == "npc"))
			{
				if (!this.canActAndUseWeapon(item, actor))
					return;

				SPACE1889Combat.AttackDialog(actor, item);
				return;
			}

			let attackString = "";
			if (item.type == "weapon")
			{
				if (actor.type == "vehicle")
					attackString = item.system.vehicleInfo + '<br>'; 

				if (game.user.targets.size > 0)
					attackString += game.i18n.format("SPACE1889.AttackOn", { targetName: game.user.targets.first().name });
				else
					attackString += game.i18n.localize("SPACE1889.Attack") ?? "Attack";
			}

			const info = attackString != "" ? attackString : game.i18n.localize("SPACE1889.Probe") ?? "Probe";
			this.rollSubSpecial(item, actor, dieCount, showDialog, info);
		}
	}

	/**
	* 
	* @param {object} item
	* @param {object} actor
	* @param {number} dieCount 
	* @param {boolean} showDialog 
	*/
	static rollSpecialTalent(item, actor, dieCount, showDialog)
	{
		if (item.type == "talent")
		{
			let info = "";
			if (item.system.id == "geschaerfterSinn")
				info = game.i18n.localize("SPACE1889.Probe") ?? "Probe";
			else if (item.system.id == "eigenartigerKampfstil")
				info = game.i18n.localize("SPACE1889.SecondaryAttributeDef");
			else if (game.user.targets.size > 0)
				info = game.i18n.format("SPACE1889.AttackOn", { targetName: game.user.targets.first().name });
			else
				info = game.i18n.localize("SPACE1889.Attack") ?? "Attack";

			this.rollSubSpecial(item, actor, dieCount, showDialog, info, true);
		}
	}


	static getActiveEffectStates(actor)
	{
		return SPACE1889Helper.isFoundryV10Running() ? this.getActiveEffectStatesByFlag(actor) : this.getActiveEffectStatesByStatuses(actor);
	}

	static getActiveEffectStatesByFlag(actor)
	{
		let effectList = [];
		if (!actor)
			return effectList;

		for (let effect of actor.effects._source)
		{
			const statusId = effect.flags?.core?.statusId;
			if (statusId)
				effectList.push(statusId);
		}
		return effectList;
	}

	static getActiveEffectStatesByStatuses(actor)
	{
		let effectList = [];
		if (!actor)
			return effectList;

		for (let effect of actor.effects._source)
		{
			for (let id of effect.statuses)
			{
				effectList.push(id);
			}
		}
		return effectList;
	}

	static hasActiveEffectState(effect, statusId)
	{
		if (SPACE1889Helper.isFoundryV10Running())
		{
			const id = effect.flags?.core?.statusId;
			if (id && statusId === id)
				return true;
		}
		else
		{
			for (let id of effect.statuses)
			{
				if (id === statusId)
					return true;
			}
		}
		return false;
	}

	static canNotAttack(actor, sendNotify)
	{
		const statusIds = this.getActiveEffectStates(actor);

		if (statusIds.findIndex(element => element == "unconscious") >= 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EffectUnconsicousInfo"));
			return true;
		}
		else if (statusIds.findIndex(element => element == "paralysis") >= 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EffectParalysisInfo"));
			return true;
		}
		else if (statusIds.findIndex(element => element == "stun") >= 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EffectStunInfo"));
			return true;
		}
		else if (statusIds.findIndex(element => element == "prone") >= 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EffectProneInfo"));
			return true;
		}
		else if (statusIds.findIndex(element => element == "totalDefense") >= 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EffectTotalDefenseInfo"));
			return true;
		}
		else if (statusIds.findIndex(element => element === "grappled") >= 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EffectGrappledInfo"));
			return true;
		}

		return false;
	}

	static canActAndUseWeapon(item, actor)
	{
		if (this.canNotAttack(actor, true))
			return false;

		const isWeapon = item.type == "weapon";

		if (isWeapon && !SPACE1889Helper.isWeaponReady(item, actor))
		{
			ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotUsedIsNotReady", { weapon: item.name }));
			return false;
		}

		if (isWeapon && !SPACE1889Helper.canDoUseWeapon(item, actor))
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.AmmunitionCanNotFireOutOfAmmo"));
			return false;
		}
		return true;
	}

	/**
	 *
	 * @param {object} item
	 * @param {object} actor
	 * @param {number} dieCount
	 * @param {boolean} showDialog
	 * @param {string} titelInfo
	*/
	static async rollSubSpecial(item, actor, dieCount, showDialog, titelInfo, withExtraInfo = false)
	{
		if (!this.canActAndUseWeapon(item, actor))
			return;

		const isWeapon = item.type == "weapon";

		const extraInfo = withExtraInfo ? game.i18n.localize(item.system.infoLangId) : "";
		let toolTipInfo = "";
		const titelPartOne = game.i18n.localize("SPACE1889.ModifiedRoll");
		const inputDesc = game.i18n.localize("SPACE1889.NumberOfModificationDice");
		const diceDesc = game.i18n.localize("SPACE1889.ConfigDice");
		const isAttackTalent = item.isAttackTalent();
		const isAttack = isAttackTalent || isWeapon;
		const talentWeapon = isAttackTalent ? SPACE1889RollHelper.getWeaponFromTalent(actor, item) : null;

		const targetId = game.user.targets.first() ? game.user.targets.first().id : "";
		let addAutoDefense = game.settings.get("space1889", "combatSupport") && (item.type == 'weapon' || isAttackTalent);
		let firstAidText = "";
		let defaultMod = 0;
		let firstAid = (item.type == "specialization" && item.system.id == "ersteHilfe") ? "firstAid" : "";
		if (firstAid == "" && item.type == "skill" && item.system.id == "medizin")
		{
			firstAid = (actor.system.speciSkills?.find(entry => entry.system.id == 'ersteHilfe')) ? "medical" : "firstAid";
		}
		if (addAutoDefense && targetId != "")
		{
			let controlledToken = SPACE1889Helper.getControlledTokenDocument();
			if (actor._id == controlledToken?.actorId)
			{
				let isRangedCombat = false;
				if (isWeapon)
				{
					if (item.system.skillId != "waffenlos" && item.system.skillId != "nahkampf")
					{
						isRangedCombat = true;
					}
				}
				else if (talentWeapon)
					isRangedCombat = talentWeapon.isRangeWeapon;

				let distanceInfo = DistanceMeasuring.getDistanceInfo(controlledToken, game.user.targets.first().document, !isRangedCombat);

				if (!isRangedCombat && !distanceInfo.isCloseCombatRange)
				{
					ui.notifications.info(game.i18n.localize("SPACE1889.NotInRange"));
					return;
				}

				defaultMod = isRangedCombat ? SPACE1889Helper.getDistancePenalty(item, distanceInfo.distance) : 0;
				dieCount += defaultMod;
				if (defaultMod != 0)
					toolTipInfo = game.i18n.format("SPACE1889.ChatDistanceMod", { mod: SPACE1889Helper.getSignedStringFromNumber(defaultMod) });

				titelInfo += " " + game.i18n.format("SPACE1889.ChatDistanceInBrackets", { distance: distanceInfo.distance.toFixed(1), unit: distanceInfo.unit });
			}
		}
		else if (firstAid.length > 0 && targetId != "")
		{
			const target = game.user.targets.find(e => e.id == targetId);
			const isDying = SPACE1889Helper.isDying(target?.actor);

			if (isDying)
			{
				firstAidText = game.i18n.format("SPACE1889.FirstAidPersonStabilizing", { targetName: target?.name, skill: item.system.label});
				firstAid = "stabilizing";
				const damage = SPACE1889Helper.getDamageTuple(target?.actor);
				defaultMod = Math.min(target?.actor.system.health.max - damage.lethal, 0);
				dieCount += defaultMod;
				toolTipInfo = game.i18n.format("SPACE1889.ChatNegativeHealthPenalty", { penalty: defaultMod });
			}
			else if (firstAid == "firstAid")
			{
				firstAidText = game.i18n.format("SPACE1889.FirstAidPerson", { targetName: target?.name });
			}
			else
				firstAidText = game.i18n.format("SPACE1889.MedicalCarePerson", { targetName: target?.name });
		}
		
		if (showDialog)
		{
			let chatOptions = SPACE1889Helper.getHtmlChatOptions();

			const diceCount = dieCount - defaultMod;
			let dialogue = new Dialog(
				{
					title: `${titelPartOne}: ${item.system.label} (${diceCount} ${diceDesc})`,
					content: `<p>${inputDesc}: <input type="number" id="anzahlDerWuerfel" value = "${defaultMod}" autofocus></p><hr><p><select id="choices" name="choices">${chatOptions}</select></p>`,
					buttons:
					{
						ok:
						{
							icon: '',
							label: game.i18n.localize("SPACE1889.Go"),
							callback: (html) => myCallback(html)
						},
						abbruch:
						{
							label: game.i18n.localize("SPACE1889.Cancel"),
							callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
							icon: `<i class="fas fa-times"></i>`
						}
					},
					default: "ok"
				}).render(true);

			async function myCallback(html)
			{
				const chatoption = html.find('#choices').val();
				const input = html.find('#anzahlDerWuerfel').val();
				let anzahl = input ? parseInt(input) : 0;
				toolTipInfo = anzahl == 0 ? "" : game.i18n.format("SPACE1889.ChatModifier", { mod: SPACE1889Helper.getSignedStringFromNumber(anzahl) }); 
				anzahl += diceCount;

				let additionalChatInfo = firstAidText;
				if (isAttack)
				{
					const useWeaponInfo = await SPACE1889Helper.useWeapon(item, actor);
					additionalChatInfo = useWeaponInfo.chatInfo;
					if (useWeaponInfo.used)
						titelInfo = await SPACE1889RollHelper.logAttack(actor, titelInfo);
				}

				const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, item, anzahl, [targetId], additionalChatInfo, titelInfo, toolTipInfo, extraInfo, isAttackTalent, firstAid, chatoption);

				ChatMessage.create(chatData, {});
			}
		}
		else
		{
			let additionalChatInfo = firstAidText;
			if (isAttack)
			{
				const useWeaponInfo = await SPACE1889Helper.useWeapon(item, actor);
				additionalChatInfo = useWeaponInfo.chatInfo;
				if (useWeaponInfo.used)
					titelInfo = await SPACE1889RollHelper.logAttack(actor, titelInfo);
			}

			const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, item, dieCount, [targetId], additionalChatInfo, titelInfo, toolTipInfo, extraInfo, isAttackTalent, firstAid);
			ChatMessage.create(chatData, {});
		}

		function getIds(option)
		{
			let ids = [];
			if (option == "public")
				return ids;

			const gmId = SPACE1889Helper.getGmId();
			const userId = game.user.id;
			if (option == "selfAndGm")
				ids = gmId != userId ? [gmId, userId] : [userId];
			else if (option == "self")
				ids = [userId];

			return ids;
		}

		async function getChatData(wurfelAnzahl, useWeaponChatInfo, chatOption="public")
		{
			const rollWithHtml = await SPACE1889RollHelper.createInlineRollWithHtml(Math.max(0, wurfelAnzahl), titelInfo, toolTipInfo);
			let weapon = undefined;
			let weaponSkill = "";
			let weaponDamageType = "";
			let effect = "none";
			let effectDurationCT = 0;
			let effectOnly = false;
			if (item.type == "weapon")
			{
				weapon = item;
				weaponSkill = weapon.system.skillId;
				weaponDamageType = weapon.system.ammunition.damageType ?? weapon.system.damageType;
				effect = weapon.system.effect;
				effectDurationCT = weapon.system.effectDurationCombatTurns;
				effectOnly = weapon.system.effectOnly;
			}

			let abbrDamageType = item.system.damageTypeDisplay ? "(" + item.system.damageTypeDisplay + ")" : "";

			let messageContent = `<div><h2>${item.system.label} ${abbrDamageType}</h2></div>`;

			if (item.system.ammunition?.name)
				messageContent += `<small>${item.system.ammunition.name}</small><br>`;

			let reducedDefense = "";
			let areaDamage = "0";
			if (item.system.isAreaDamage && actor.type != 'vehicle')
			{
				messageContent += `${game.i18n.localize("SPACE1889.AreaDamageWeaponUse")} <br>`;
				reducedDefense = "onlyActive";
				areaDamage = item.system.damage;
			}
			if (isAttackTalent)
			{
				reducedDefense = item.getDefenceTypeAgainstThisTalant();
				weapon = SPACE1889RollHelper.getWeaponFromTalent(actor, item);
				messageContent += `<small>${weapon ? weapon.name : game.i18n.localize("SPACE1889.SkillWaffenlos")}</small><br>`;
				weaponSkill = weapon ? weapon.system.skillId : "waffenlos";
				weaponDamageType = weapon ? (weapon.system.ammunition.damageType ?? weapon.system.damageType) : "nonLethal";
				if (weapon && weapon.system.effect != "none")
				{
					effect = weapon.system.effect;
					effectDurationCT = weapon.system.effectDurationCombatTurns;
					effectOnly = weapon.system.effectOnly;
				}
				if (reducedDefense == "onlyActiveParalyse")
				{
					weaponDamageType = "paralyse";
				}
			}

			if (withExtraInfo)
				messageContent += `${extraInfo} <br>`;
			if (useWeaponChatInfo != "")
				messageContent += `${useWeaponChatInfo} <br>`;
			messageContent += `${rollWithHtml.html} <br>`;

			const speaker = ChatMessage.getSpeaker({ actor: actor });

			if (addAutoDefense && targetId && targetId.length > 0)
			{
				const buttonText = game.i18n.localize("SPACE1889.AutoDefense");
				messageContent += `<button class="autoDefence chatButton" data-action="defence" data-actor-id="${actor._id}" data-actor-token-id="${speaker.token}" data-target-id="${targetId}" data-attack-name="${item.name}" data-attack-successes="${rollWithHtml.roll.total}" data-damage-type="${weaponDamageType}" data-skill-id="${weaponSkill}" data-reduced-defense="${reducedDefense}" data-area-damage="${areaDamage}" data-effect="${effect}" data-effect-duration-combat-turns="${effectDurationCT}" data-effect-only="${effectOnly}">${buttonText}</button>`;
			}

			let ids = getIds(chatOption);

			let chatData =
			{
				user: game.user.id,
				speaker: speaker,
				whisper: ids,
				content: messageContent
			};
			return chatData;
		}
	}

	static async getChatDataRollSubSpecial(actor, item, wurfelAnzahl, targetIds, useWeaponChatInfo, titelInfo, toolTipInfo, extraInfo="", isAttackTalent, firstAid="", chatOption="public", specialAttack="")
	{
		const rollWithHtml = await SPACE1889RollHelper.createInlineRollWithHtml(Math.max(0, wurfelAnzahl), titelInfo, toolTipInfo);
		let messageContent = "";
		const speaker = ChatMessage.getSpeaker({ actor: actor });

		if (item?.type === 'weapon' || isAttackTalent || specialAttack !== "")
			messageContent = this.getAttackChatContent(actor, item, rollWithHtml, targetIds, useWeaponChatInfo, extraInfo, isAttackTalent, specialAttack);
		else
		{
			const titel = firstAid === "stabilizing" ? game.i18n.localize("SPACE1889.ChatStabilizing") : `<h2>${item.system.label}</h2>`
			messageContent = `<div>${titel}</div>`;
			if (extraInfo.length > 0)
				messageContent += `${extraInfo} <br>`;
			if (useWeaponChatInfo != "")
				messageContent += `${useWeaponChatInfo} <br>`;
			messageContent += `${rollWithHtml.html} <br>`;
			if (firstAid === "firstAid")
			{
				messageContent += this.#AddFirsAidButton(actor, speaker, targetIds[0], rollWithHtml);
			}
			else if (firstAid === "stabilizing")
			{
				const target = game.user.targets.find(e => e.id == targetIds[0]);

				if (rollWithHtml.roll.total >= 2)
				{
					if (SPACE1889Helper.hasOwnership(target.actor))
						SPACE1889Healing.removeDyingEffect(target.actor);
					else if (target?.id)
					{
						game.socket.emit("system.space1889", {
							type: "removeDyingEffect",
							payload: {
								tokenId: target.id,
								sceneId: game.scenes.viewed.id
							}
						});
					}
					messageContent += game.i18n.format("SPACE1889.ChatFirstAidStabilizingSuccess", { name: target?.name });
				}
				else
					messageContent += game.i18n.format("SPACE1889.ChatFirstAidStabilizingFail", { name: target?.name });
			}
		}

		let ids = this.getChatIds(chatOption);

		let chatData =
		{
			user: game.user.id,
			speaker: speaker,
			whisper: ids,
			content: messageContent
		};
		return chatData;
	}

	static #AddFirsAidButton(actor, speaker, targetId, rollWithHtml)
	{
		const buttonText = game.i18n.localize("SPACE1889.ApplyFirstAid");
		const isLivesaver = SPACE1889Helper.getTalentLevel(actor, "lebensretter") > 0;
		const currentTimeDate = SPACE1889Time.getCurrentTimestamp();
		const target = game.user.targets.find(e => e.id == targetId);
		const buttonToolTip = target ? `data-tooltip="${target.name}"` : '';
		return `<button class="applyFirstAid chatButton" ${buttonToolTip} data-action="firstAid" data-actor-id="${actor._id}" data-actor-token-id="${speaker.token}" data-target-id="${targetId}" data-first-aid-successes="${rollWithHtml.roll.total}" data-lifesaver="${isLivesaver}" data-timestamp="${currentTimeDate}">${buttonText}</button>`;
	}

	static getAttackChatContent(actor, item, rollWithHtml, targetIds, useWeaponChatInfo, extraInfo="", isAttackTalent, specialAttack="")
	{
		const addAutoDefense = game.settings.get("space1889", "combatSupport") && (item?.type === 'weapon' || isAttackTalent || specialAttack !== "");
		let weapon = undefined;
		let weaponSkill = "";
		let weaponDamageType = "";
		let effect = "none";
		let effectDurationCT = 0;
		let effectOnly = false;
		if (item?.type === "weapon")
		{
			weapon = item;
			weaponSkill = weapon.system.skillId;
			weaponDamageType = weapon.system.ammunition.damageType ?? weapon.system.damageType;
			effect = weapon.system.effect;
			effectDurationCT = weapon.system.effectDurationCombatTurns;
			effectOnly = weapon.system.effectOnly;
		}

		let abbrDamageType = item?.system?.damageTypeDisplay ? "(" + item.system.damageTypeDisplay + ")" : "";

		let specialAttackName = "";
		if (specialAttack === "grapple")
			specialAttackName = game.i18n.localize("SPACE1889.CombatManoeuversGrapple");
		else if (specialAttack === "disarm" || specialAttack === "disarmWithWeapon")
			specialAttackName = game.i18n.localize("SPACE1889.CombatManoeuversDisarm");
		else if (specialAttack === "trip")
			specialAttackName = game.i18n.localize("SPACE1889.CombatManoeuversTrip");

		let messageContent = "<div><h2>";
		messageContent += specialAttackName !== "" ? specialAttackName : `${item.system.label} ${abbrDamageType}`;
		messageContent += "</h2></div>";

		if (item?.system?.ammunition?.name)
			messageContent += `<small>${item.system.ammunition.name}</small><br>`;

		let reducedDefense = "";
		let areaDamage = "0";
		if (item?.system?.isAreaDamage && actor.type != 'vehicle')
		{
			messageContent += `${game.i18n.localize("SPACE1889.AreaDamageWeaponUse")} <br>`;
			reducedDefense = "onlyActive";
			areaDamage = item.system.damage;
		}
		if (isAttackTalent)
		{
			reducedDefense = item.getDefenceTypeAgainstThisTalant();
			weapon = SPACE1889RollHelper.getWeaponFromTalent(actor, item);
			messageContent += `<small>${weapon ? weapon.name : game.i18n.localize("SPACE1889.SkillWaffenlos")}</small><br>`;
			weaponSkill = weapon ? weapon.system.skillId : "waffenlos";
			weaponDamageType = weapon ? (weapon.system.ammunition.damageType ?? weapon.system.damageType) : "nonLethal";
			if (weapon && weapon.system.effect != "none")
			{
				effect = weapon.system.effect;
				effectDurationCT = weapon.system.effectDurationCombatTurns;
				effectOnly = weapon.system.effectOnly;
			}
			if (reducedDefense == "onlyActiveParalyse")
			{
				weaponDamageType = "paralyse";
			}
		}
		if (specialAttack !== "")
		{
			if (specialAttack === "disarm")
			{
				weaponSkill = "waffenlos";
				reducedDefense = "onlyActiveComparative";
				weaponDamageType = specialAttack;
				messageContent += `<small>${game.i18n.localize("SPACE1889.SkillWaffenlos")}</small><br>`;
			}
			else if (specialAttack === "disarmWithWeapon")
			{
				let skillLangId = "SPACE1889.SkillNahkampf";
				if (weapon)
				{
					effect = "none";
					effectDurationCT = 0;
					effectOnly = false;
					if (CONFIG.SPACE1889.combatSkills.hasOwnProperty(weaponSkill))
						skillLangId = CONFIG.SPACE1889.combatSkills[weaponSkill];
				}
				else
				{
					weaponSkill = "nahkampf";
				}
				
				reducedDefense = "onlyActiveComparative";
				weaponDamageType = specialAttack;
				messageContent += `<small>${game.i18n.localize(skillLangId)}</small><br>`;
			}
			else
			{
				weaponSkill = "waffenlos";
				reducedDefense = "onlyActive";
				weaponDamageType = specialAttack;
				messageContent += `<small>${game.i18n.localize("SPACE1889.SkillWaffenlos")}</small><br>`;
			}
		}

		if (extraInfo.length > 0)
			messageContent += `${extraInfo} <br>`;
		if (useWeaponChatInfo != "")
			messageContent += `${useWeaponChatInfo} <br>`;
		messageContent += `${rollWithHtml.html} <br>`;

		if (addAutoDefense && targetIds && targetIds.length > 0)
		{
			const speaker = ChatMessage.getSpeaker({ actor: actor });
			for (const targetId of targetIds)
			{
				let buttonToolTip = "";
				const targetToken = game.user.targets.find(e => e.id == targetId);
				if (targetToken)
					buttonToolTip = `data-tooltip="${targetToken.name}"`;
				let buttonText = "";
				if (targetIds.length > 1)
					buttonText += targetToken.name.length <= 14 ? targetToken.name : "..." + targetToken.name.slice(-12);

				buttonText += buttonText.length > 0 ? ": " : "";
				buttonText += game.i18n.localize("SPACE1889.AutoDefense");

				messageContent += `<button class="autoDefence chatButton" ${buttonToolTip} data-action="defence" data-actor-id="${actor._id}" data-actor-token-id="${speaker.token}" data-target-id="${targetId}" data-attack-name="${item ? item.name: specialAttackName}" data-attack-successes="${rollWithHtml.roll.total}" data-damage-type="${weaponDamageType}" data-skill-id="${weaponSkill}" data-reduced-defense="${reducedDefense}" data-area-damage="${areaDamage}" data-effect="${effect}" data-effect-duration-combat-turns="${effectDurationCT}" data-effect-only="${effectOnly}">${buttonText}</button>`;
			}
		}

		return messageContent;
	}

	static getChatIds(chatOption)
	{
		let ids = [];
		if (chatOption == "public")
			return ids;

		const gmId = SPACE1889Helper.getGmId();
		const userId = game.user.id;
		if (chatOption == "selfAndGm")
			ids = gmId != userId ? [gmId, userId] : [userId];
		else if (chatOption == "self")
			ids = [userId];

		return ids;
	}

	/**
	 * 
	 * @param {object} item item
	 * @param {object} actor
	 * @param {boolean} whisper
	 */
	static rollItemInfo(item, actor, whisper)
	{
		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const rollMode = game.settings.get('core', 'rollMode');
		const desc = item.getInfoText(true);
		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
			whisper: whisper ? [game.user.id] : [],
			content: desc ?? ''
		});
		return;
	}

	static showItemImage(item)
	{
		if (!item || item.img == "")
			return false;

		switch (item.type)
		{
			case "item":
			case "ammunition":
			case "skill":
			case "specialization":
			case "talent":
			case "container":
				return item.img != "icons/svg/item-bag.svg";
			case "armor":
				return item.img != "icons/svg/shield.svg";
			case "weapon":
				return item.img != "icons/svg/sword.svg";
			case "damage":
				return true;
			case "weakness":
				return item.img != "icons/svg/paralysis.svg";
			case "resource":
				return item.img != "icons/svg/card-joker.svg";
			case "language":
				return item.img != "icons/svg/sound.svg";
			case "currency":
				return item.img != "icons/svg/coins.svg";
			case "extended_action":
				return item.img !== "icons/tools/navigation/hourglass-yellow.webp";
		}

		return true;
	}

	static isSmallItemImage(item)
	{
		return !(item.type == "item" || item.type == "weapon");
	}

	static async showDamageDialog(actor, item, isLethal)
	{
		let optionen = '';

		optionen += '<option value="lethal"' + (isLethal ? ' selected="selected">' : '>') + game.i18n.localize("SPACE1889.Lethal") + '</option>';
		optionen += '<option value="nonLethal"' + (!isLethal ? ' selected="selected">' : '>') + game.i18n.localize("SPACE1889.NonLethal") + '</option>';
		if (actor.type == "vehicle")
		{
			optionen += '<option value="controls"' + '>' + game.i18n.localize("SPACE1889.Controls") + '</option>';
			optionen += '<option value="propulsion"' + '>' + game.i18n.localize("SPACE1889.Propulsion") + '</option>';
			optionen += '<option value="guns"' + '>' + game.i18n.localize("SPACE1889.Guns") + '</option>';
			optionen += '<option value="crew"' + '>' + game.i18n.localize("SPACE1889.VehicleCrew") + '</option>';
		}

		let damageLabel = game.i18n.localize("SPACE1889.Damage");
		let nameLabel = game.i18n.localize("SPACE1889.Name");
		let damageType = game.i18n.localize("SPACE1889.DamageTypeAbbr");
		let submit = game.i18n.localize("SPACE1889.Submit");
		let cancel = game.i18n.localize("SPACE1889.Cancel");
		let selectedOption;
		let userInputName;
		let damageAmount = 1;
		const imgPath = isLethal ? "icons/skills/wounds/blood-drip-droplet-red.webp" : "icons/skills/wounds/injury-pain-body-orange.webp";

		let dialog = new Dialog({
			title: `${actor.name} : ${damageLabel}`,
			content: `
				<form class="flexcol">
					<div class="resources grid grid-4col">
						<img class="profile-img" src="${imgPath}" height="90" width="90"/>
						<div class="header-fields grid-span-3">
							<div>
								<label>${nameLabel}:</label>
								<input type="text" placeholder="b&ouml;ser Papierschnitt" value="" id="damageName">
							</div>

							<div class="grid grid-2col">
								<div>
									<label>${damageLabel}:</label>
									<input class="resource flex-group-center" type="text" data-dtype="Number" value="1" id="damage">
								</div>
								<div>
									<label>${damageType}:</label>
									<div>
										<select id="damageType" name="damageType">
											${optionen}
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>
			`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: `${submit}`,
					callback: (html) =>
					{
						selectedOption = html.find('#damageType').val();
						userInputName = html.find('#damageName').val();
						damageAmount = html.find('#damage').val();
					}
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: `${cancel}`
				}
			},
			default: "yes",
			close: () =>
			{
				if (selectedOption && actor.items.get(item._id) != undefined)
				{
					let useInputName = actor.type != "creature";
					if (userInputName == "")
					{
						useInputName = false;
						userInputName = selectedOption == "lethal" ? game.i18n.localize("SPACE1889.Lethal") : game.i18n.localize("SPACE1889.NonLethal");
					}

					const path = selectedOption == "lethal" ? "icons/skills/wounds/blood-drip-droplet-red.webp" : "icons/skills/wounds/injury-pain-body-orange.webp";

					let damageAmountInt = parseInt(damageAmount);
					if (damageAmountInt == NaN)
						damageAmountInt = 1;
					damageAmountInt = Math.max(1, damageAmountInt);
					const eventDate = SPACE1889Time.getCurrentTimeDateString();
					const timestamp = SPACE1889Time.getCurrentTimestamp();
					const isCombat = game.combat?.active && game.combat?.started;

					doIt(selectedOption, userInputName, path,damageAmountInt,eventDate,timestamp,isCombat, (useInputName ? userInputName : ""));
				}
				else if (actor.items.get(item._id) != undefined)
				{
					actor.deleteEmbeddedDocuments("Item", [item._id]);
					ui.notifications.info(game.i18n.format("SPACE1889.ChatInfoUndoDamage", { name: actor.name }));
				}
			}
		});
		dialog.render(true);

		async function doIt(damageType, name, path, damageAmount, eventDate, timestamp, isCombat, userInputName)
		{
			await actor.updateEmbeddedDocuments("Item", [{
				_id: item._id,
				"system.damageType": damageType,
				"name": name,
				"img": path,
				"system.damage": damageAmount,
				"system.dataOfTheEvent": eventDate,
				"system.eventTimestamp": timestamp,
				"system.combatInfo.id": isCombat ? game.combat.id : "",
				"system.combatInfo.round": isCombat ? game.combat.round : 0,
				"system.combatInfo.turn": isCombat ? game.combat.turn : 0
			}]);
			await SPACE1889Healing.refreshTheInjuryToBeHealed(actor);
			await SPACE1889RollHelper.doDamageChatMessage(actor, item._id, damageAmount, damageType, userInputName);
		}
	}

	static getMaxRounds()
	{
		return 600;
	}

	static async doDamageChatMessage(actor, itemId, dmg, dmgType, dmgName = "", effect="none", effectCombatTurns="", effectOnly=false, addStylePointButton = false)
	{
		const item = actor.items.get(itemId);
		if (item == undefined)
			return;

		const dmgTypeLabel = dmgType == "lethal" ? game.i18n.localize("SPACE1889.LethalAbbr") : game.i18n.localize("SPACE1889.NonLethalAbbr");
		const isCharakter = actor.type == "character";
		const isNpcWithCharakterRules = actor.type == "npc" && this.useCharacterRulesForNpc();
		const isVehicle = actor.type == "vehicle";
		let stun = isVehicle ? 1000 : actor.system.secondaries.stun.total;
		let str = isVehicle ? 1000 : actor.system.abilities.str.total;
		let recoil = 0;
		let liegend = false;
		let stunned = false;
		let unconsciousStrike = 0;
		let isVirtualDamage = effectOnly && effect != "none";


		if (dmg > str && !isVirtualDamage)
		{
			liegend = dmg > (2 * str);
			recoil = (dmg - str) * 1.5;
		}

		if (dmg > (2 * stun) && !isVirtualDamage)
			unconsciousStrike = dmg - (2 * stun);
		if (dmg > stun && !isVirtualDamage)
			stunned = true;

		let trefferInfo = "";
		let effects = [];
		if (recoil > 0)
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Recoil") + ":</b> " + recoil.toString() + "m<br>";
		if (liegend)
		{
			let actorName = actor.name;
			if (actor.isToken)
				actorName = actor.token.name;
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Knockdown") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoKnockdown", { actorName: actorName}) + "<br>";
			effects.push({ name: "prone", rounds: this.getMaxRounds() });
		}
		if (unconsciousStrike > 0)
		{
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Unconscious") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoDuration", { count: unconsciousStrike.toString() }) + "<br>";
			effects.push({ name: "unconscious", rounds: unconsciousStrike * 10 });
		}
		else if (stunned)
		{
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Stunned") + ":</b> " + game.i18n.localize("SPACE1889.ChatInfoStunned") + "<br>";
			effects.push({ name: "stun", rounds: 1 });
		}

		let damageTuple = SPACE1889Helper.getDamageTuple(actor, itemId);
		if (!isVirtualDamage)
		{
			if (dmgType == "lethal")
				damageTuple.lethal += dmg;
			else
				damageTuple.nonLethal += dmg;
		}
		const maxHealth = actor.system.health.max;
		const newHealth = maxHealth - damageTuple.lethal - damageTuple.nonLethal;
		let lethalValue = maxHealth - damageTuple.lethal;
		let nonLethalValue = lethalValue - damageTuple.nonLethal;
		const deathThreshold = SPACE1889Helper.getDeathThreshold(actor);
		if (lethalValue > deathThreshold && nonLethalValue < deathThreshold)
		{
			const transformedNonLethal = nonLethalValue - deathThreshold;
			nonLethalValue -= transformedNonLethal;
			lethalValue += transformedNonLethal;
		}


		const autoStabilize = SPACE1889Helper.isAutoStabilize(actor);
		const incapacitateThreshold = SPACE1889Helper.getIncapacitateThreshold(actor);
		const nonLethalUnconsciousThreshold = incapacitateThreshold == 0 ? -1 : incapacitateThreshold;
		let unconscious = damageTuple.nonLethal > 0 && nonLethalValue <= incapacitateThreshold && lethalValue > deathThreshold;
		let gesamtInfo = "";

		if (isCharakter || isNpcWithCharakterRules)
		{
			if (newHealth <= incapacitateThreshold)
			{
				if (lethalValue <= 0)
					gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Incapacitate") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoIncapacitate", { damageTypeAbbr: game.i18n.localize("SPACE1889.LethalAbbr") }) + "<br>";
				else
					gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Exhausted") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoIncapacitate", { damageTypeAbbr: game.i18n.localize("SPACE1889.NonLethalAbbr") }) + "<br>";
			}

			if (lethalValue < 0 && lethalValue > deathThreshold)
			{
				gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.DangerOfDeath") + ":</b> ";
				if (autoStabilize)
					gesamtInfo += game.i18n.localize("SPACE1889.ChatInfoDangerOfDeathAutoSuccess") + "<br>";
				else
				{
					gesamtInfo += game.i18n.localize("SPACE1889.ChatInfoDangerOfDeath") + "<br>";
					effects.push({ name: "dying", rounds: 10 });
					if (lethalValue < incapacitateThreshold)
						unconscious = true;
				}
			}
			if (unconscious)
			{
				gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Unconscious") + ":</b> ";
				gesamtInfo += game.i18n.format("SPACE1889.ChatInfoDuration", { count: (-1 * newHealth).toString() }) + "<br>";
			}
			if (lethalValue <= deathThreshold)
			{
				gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Dead") + ":</b> ";
				gesamtInfo += game.i18n.localize("SPACE1889.ChatInfoDead") + "<br>";
				effects.push({ name: "dead", rounds: this.getMaxRounds() });
			}
		}
		else if (newHealth <= 0)
		{
			gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Vanquished") + "!</b>";
			effects.push({ name: "dead", rounds: this.getMaxRounds() });
		}

		if (effect != "none")
		{
			effects.push({ name: effect, rounds: effectCombatTurns });
			const time = SPACE1889Helper.formatTime(SPACE1889Helper.getCombatTurnsInSeconds(effectCombatTurns));
			trefferInfo += "<b>" + game.i18n.localize(CONFIG.SPACE1889.effects[effect]) + ":</b> " + game.i18n.format("SPACE1889.ChatInfoDurationWeaponEffect", { count: time }) + "<br>";
		}

		const usePercentage = !isCharakter && this.usePercentForNpcAndCreatureDamageInfo();

		let info = "";
		if (!isVirtualDamage)
		{
			info = "<small>" + (dmgName != "" ? "durch <i>" + dmgName + "</i> und " : "");
			info += game.i18n.format("SPACE1889.ChatInfoHealth", { health: (!usePercentage ? newHealth.toString() : Math.round(100 * newHealth / maxHealth).toString() + "%") });
			if (damageTuple.nonLethal > 0)
				info += " " + game.i18n.format("SPACE1889.ChatInfoHealthLethalDamageOnly", { lethalHealth: (!usePercentage ? lethalValue.toString() : Math.round(100 * lethalValue / maxHealth).toString() + "%") });
			info += "</small><br>";
		}

		if (trefferInfo != "")
			info += "<b>" + game.i18n.localize("SPACE1889.StrikeEffect") + ":</b> <br>" + trefferInfo;
		if (gesamtInfo != "")
			info += (trefferInfo != "" ? "<br>" : "") + "<b>" + game.i18n.localize("SPACE1889.OverallEffect") + ":</b> <br>" + gesamtInfo;

		const titel = isVirtualDamage ?
			game.i18n.format("SPACE1889.ChatInfoVirtualDamage", { damage: dmg.toString() }) :
			game.i18n.format("SPACE1889.ChatInfoDamage", { damage: (!usePercentage ? dmg.toString() : Math.round(100 * dmg / maxHealth).toString() + "%"), damageType: dmgTypeLabel });
		let messageContent = `<div><h2>${titel}</h2></div>`;
		messageContent += `${info}`;

		let effectIds = [];
		if (effects.length > 0)
			effectIds = await SPACE1889Helper.addEffects(actor, effects);

		const speaker = ChatMessage.getSpeaker({ actor: actor });
		if (!isVirtualDamage && addStylePointButton && actor.system.style && actor.system.style.value >= 2)
		{
			messageContent += this.#AddStylePointDamageReductionButton(actor, speaker, itemId, dmg, dmgType, dmgName, effect, effectCombatTurns, effectOnly, effectIds);
		}

		let chatData =
		{
			user: game.user.id,
			speaker: speaker,
			content: messageContent
		};

		ChatMessage.create(chatData, {});
	}

	static #AddStylePointDamageReductionButton(actor, speaker, damageId, dmg, dmgType, dmgName, weaponEffect, weaponEffectCombatTurns, effectOnly, effectIds)
	{
		const buttonText = game.i18n.localize("SPACE1889.UseStylePoints");
		const buttonToolTip = game.i18n.localize("SPACE1889.UseSpForDamageReduction");
		let effectIdsString = "";
		for (const id of effectIds)
		{
			if (effectIdsString.length > 0)
				effectIdsString += '|'
			effectIdsString += id.toString();
		}

		const currentTimeDate = SPACE1889Time.getCurrentTimestamp();
		//to do : combat Round und Zug 

		return `<button class="applyStylePointDamageReduction chatButton" 
				data-tooltip="${buttonToolTip}"
				data-action="damageReduction"
				data-actor-id="${actor._id}" 
				data-actor-token-id="${speaker.token}" 
				data-damage-id="${damageId}" 
				data-damage="${dmg}" 
				data-damage-type="${dmgType}" 
				data-damage-name="${dmgName}" 
				data-weapon-effect-Name="${weaponEffect}"
				data-weapon-effect-Turns="${weaponEffectCombatTurns}"
				data-weapon-effect-Only="${effectOnly}"
				data-created-effect-Ids="${effectIdsString}"
				data-timestamp="${currentTimeDate}">${buttonText}</button>`;
	}

	static usePercentForNpcAndCreatureDamageInfo()
	{
		return game.settings.get("space1889", "usePercentForNpcAndCreatureDamageInfo");
	}

	static useCharacterRulesForNpc()
	{
		return game.settings.get("space1889", "useCharacterRulesForNpc");
	}

	static getDieType()
	{
		return game.settings.get("space1889", "dice");
	}


	static getVehiclePositionSupporter(position)
	{
		let list = [];
		switch (position)
		{
			case "pilot":
				list.push(["captain", game.i18n.localize("SPACE1889.VehicleCaptain")]);
				list.push(["copilot", game.i18n.localize("SPACE1889.VehicleCopilot")]);
				break;
			case "gunner":
				list.push(["2ndGunner", game.i18n.localize("SPACE1889.Vehicle2ndGunner")]);
				list.push(["captain", game.i18n.localize("SPACE1889.VehicleCaptain")]);
				list.push(["lookout", game.i18n.localize("SPACE1889.VehicleSignaling")]);
				break;
		}
		return list;
	}

	static getVehicleManoeuvresDefaultMod(key)
	{
		switch (key)
		{
			case "DoubleShot":
				return -4;
			case "TotalAttack":
				return 2;
			case "ContinuousFire":
				return 3;
		}
		return 0;
	}
	static getWeaponAuswahl(actor, preSelectId)
	{
		let opt = "";

		let isFirst = true;

		for (let item of actor.system.weapons)
		{
			if (item.system.location == 'lager')
				continue;

			const info = item.name + " " + item.system.damage.toString() + game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[item.system.damageType]) +
				' (' + game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[item.system.vehicle.spot]) + ')';
			if (isFirst || item._id == preSelectId)
				opt += '<option value="' + item._id + '" selected>' + info + '</option>';
			else
				opt += '<option value="' + item._id + '">' + info + '</option>';
			isFirst = false;
		}

		if (isFirst)
			return '';

		const html = '<p><select id="choices" class="choices" name="choices">' + opt + '</select></p>'
		return html;
	}

	static rollManoeuver(key, actor, event, preSelectedWeaponId = "")
	{
		const evaluation = this.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
		{
			this.showManoeuverInfo(key, actor, evaluation.whisperInfo);
			return;
		}

		const titleName = actor.name;
		const actorSystem = actor.system;

		const manoeuvreAndName = game.i18n.localize("SPACE1889.VehicleManoeuvre") + ": " + game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvres[key]);
		const modifierText = game.i18n.localize("SPACE1889.Modifier");
		const modifierLabel = modifierText + " (" + game.i18n.localize("SPACE1889.EnvironmentModifier") + ", " + game.i18n.localize("SPACE1889.SpaceDisadvantage") + ", " + game.i18n.localize("SPACE1889.etc") + ")";

		const labelSkill = game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvresToSkill[key]);
		let skillWithSpezAndValue = labelSkill;

		const isTotalDefense = key === "totalDefense";
		const isDefense = key == "defense" || isTotalDefense;

		if (isDefense && actorSystem.health.value > 0 && actorSystem.positions.pilot.staffed)
			skillWithSpezAndValue += " + " + game.i18n.localize("SPACE1889.PassiveDefense") + " + " + game.i18n.localize("SPACE1889.VehicleManeuverability");
		else if (isDefense)
		{
			skillWithSpezAndValue = game.i18n.localize("SPACE1889.PassiveDefense") + " + " + game.i18n.localize("SPACE1889.VehicleNegativeStructure");
		}
		skillWithSpezAndValue += isTotalDefense ? " + 4" : "";

		const posKey = CONFIG.SPACE1889.vehicleManoeuvresToPosition[key];
		const isManeuverabilitySkill = posKey == "pilot" && !isDefense;
		let maneuverability = 0;

		if (isManeuverabilitySkill)
		{
			const disabled = game.i18n.localize("SPACE1889.VehicleManeuverabilityDisabledAbbr");
			if (actorSystem.maneuverability.value == disabled)
			{
				ui.notifications.info(game.i18n.format("SPACE1889.VehicleManoeuvreNotPossible", { name: actor.name, manoeuvreName: game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvres[key]) }));
				return; 
			}
			maneuverability = Number(actorSystem.maneuverability.value);
		}

		if (posKey == "gunner" && actorSystem.weaponLoad.isOverloaded)
		{
			let text = game.i18n.format("SPACE1889.VehicleExceedingOverloadMax", { name: actor.name });
			text += "<br>" + game.i18n.format("SPACE1889.VehicleExceedingOverloadMaxInfo", { max: actorSystem.weaponLoad.maxWithOverload, current: actorSystem.weaponLoad.value });
			ui.notifications.info(text);
			return;
		}
		else if (posKey == "gunner" && !actorSystem.positions.gunner.staffed)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.VehicleNoGunner"));
			return;
		}

		const skillValueBase = actorSystem.positions[posKey]?.total + (actorSystem.health.value < 0 ? actorSystem.health.value : 0);
		let skillValue = skillValueBase;

		if (isDefense)
			skillValue = actorSystem.secondaries.defense.total + (isTotalDefense ? 4 : 0);

		const lablelUnterstuetzung = game.i18n.localize("SPACE1889.Assistance");
		const labelWurf = game.i18n.localize("SPACE1889.NumberOfDice") + ":";
		const lablelDamage = game.i18n.localize("SPACE1889.Damage");


		const weaponChoiceHtml = posKey == 'gunner' ? this.getWeaponAuswahl(actor, preSelectedWeaponId): '';

		const modifierDefault = this.getVehicleManoeuvresDefaultMod(key);
		const supporter = this.getVehiclePositionSupporter(posKey);

		let isVisibleSupporter1 = false;
		let isVisibleSupporter2 = false;
		let isVisibleSupporter3 = false;

		let checkboxHtml = "";
		let loop = 0;

		if (supporter.length > 0)
		{
			checkboxHtml = '<fieldset>';
			checkboxHtml += '<legend>' + lablelUnterstuetzung + '</legend>';
			for (let [positionKey, description] of supporter)
			{
				++loop;
				let isTemplatePosition = actorSystem.positions[positionKey] != undefined;
				let canDo = isTemplatePosition ? actorSystem.positions[positionKey].staffed && actorSystem.positions[positionKey].total >= 4 : true;
				const state = canDo ? "" : ' disabled="true"';
				const active = canDo && isTemplatePosition && !isDefense ? " checked" : "";
				const positionName = "supporter" + loop.toString();
				switch (loop)
				{
					case 1:
						isVisibleSupporter1 = true;
						break;
					case 2:
						isVisibleSupporter2 = true;
						break;
					case 3:
						isVisibleSupporter3 = true;
						break;
				}

				checkboxHtml += '<div>';
				checkboxHtml += '<input type="checkbox" id="' + positionKey + '" class="' + positionName + 'Checkbox" value="' + positionKey + '" '
				checkboxHtml += state + active + '>';
				checkboxHtml += '<label for="' + positionKey + '">' + description + '</label>';
				checkboxHtml += '</div>'
			}
			checkboxHtml += '</fieldset >';
		}

		const dieType = game.settings.get("space1889", "dice");

		let actorInfo = "[" + labelSkill + " " + actor.system.positions[posKey]?.actorName + "]";
		let diceInfo = "";
		if (isDefense)
			actorInfo = "[" + skillWithSpezAndValue + "]";

		function Recalc()
		{
			let mod = Number($("#modifier")[0].value);
			let unterstuetzung = 0;
			let weaponDamage = 0;
			let uText = "";
			let modText = "";
			let maneuvText = "";
			let maneuvTextShort = "";
			let damageText = "";
			diceInfo = "";

			for (let [positionKey, description] of supporter)
			{
				unterstuetzung += $("#" + positionKey)[0].checked ? 2 : 0;
			}


			if (weaponChoiceHtml != '')
			{
				const id = $("#choices")[0].value;
				const weaponItem = actor.system.weapons.find(e => e._id == id);
				if (weaponItem != undefined)
				{
					const gunner = game.actors.get(actor.system.positions.gunner.actorId);
					const spezialisation = gunner?.system.speciSkills.find(j => j.system.id == weaponItem.system.specializationId);
					
					if (spezialisation != undefined)
					{
						const spezName = game.i18n.localize(spezialisation.system.nameLangId);
						const spezLevel = spezialisation.system.level;
						skillValue = skillValueBase + spezLevel;
						skillWithSpezAndValue = labelSkill + " (" + spezName + "): " + skillValue.toString();
						actorInfo = "[" + spezName + " " + actor.system.positions[posKey]?.actorName + "]";
					}
					else
					{
						skillValue = skillValueBase;
						skillWithSpezAndValue = labelSkill + ": " + skillValue.toString();
						actorInfo = "[" + labelSkill + " " + actor.system.positions[posKey]?.actorName + "]";
					}

					weaponDamage = weaponItem.system.damage;
					diceInfo = weaponItem.name + ' (' + game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[weaponItem.system.vehicle.spot]) + ')<br>';
				}
			}

			uText = " + " + unterstuetzung.toString() + "[" + lablelUnterstuetzung + "]";
			const uTextShort = " + " + unterstuetzung.toString() + "[" + lablelUnterstuetzung.substring(0, 3) + "]";
			modText = " + " + mod.toString() + "[" + modifierText + "]";
			const modTextShort = " + " + mod.toString() + "[" + modifierText.substring(0, 3) + "]";
			damageText = " + " + weaponDamage.toString() + "[" + lablelDamage + "]";
			const damageTextShort = weaponDamage != 0 ? " + " + weaponDamage.toString() + "[" + lablelDamage.substring(0, 3) + "]" : "";

			let summe = Math.max(0, skillValue + weaponDamage + unterstuetzung + mod + maneuverability);
			diceInfo += skillValue.toString() + actorInfo + (weaponDamage > 0 ? damageText : "") + (unterstuetzung > 0 ? uText : "") + (mod > 0 ? modText : "");
			if (isManeuverabilitySkill)
			{
				const maneuver = game.i18n.localize("SPACE1889.VehicleManeuverability");
				maneuvText = " + " + maneuverability.toString() + "[" + maneuver + "]";
				maneuvTextShort = " + " + maneuverability.toString() + "[" + maneuver.substring(0, 3) + "]";
				if (maneuverability != 0)
					diceInfo += maneuvText;
			}

			$("#infoToChange")[0].value = skillWithSpezAndValue;
			$("#zusammensetzung")[0].value = skillValue.toString() + damageTextShort + uTextShort + modTextShort + maneuvTextShort + " = " + summe.toString();
			$("#anzahlDerWuerfel")[0].value = summe;
		}

		function handleRender(html)
		{
			if (isVisibleSupporter1)
			{
				html.on('change', '.supporter1Checkbox', () =>
				{
					Recalc();
				});
			}
			if (isVisibleSupporter2)
			{
				html.on('change', '.supporter2Checkbox', () =>
				{
					Recalc();
				});
			}
			if (isVisibleSupporter3)
			{
				html.on('change', '.supporter3Checkbox', () =>
				{
					Recalc();
				});
			}
			html.on('input', '.modInput', () =>
			{
				Recalc();
			});
			if (weaponChoiceHtml != '')
			{
				html.on('change', '.choices', () =>
				{
					Recalc();
				});
			}
			Recalc();
		}

		let dialogue = new Dialog(
			{
				title: `${titleName}`,
				content: `
  <form>
    <h2>${manoeuvreAndName}</h2>
    <br>
	${weaponChoiceHtml}
	<div>
		<input type="text" id="infoToChange" value="${skillWithSpezAndValue}" disabled="true">
	</div>
	${checkboxHtml}
    <p>${modifierLabel}: <input type="number" class="modInput" id="modifier" value = "${modifierDefault}"></p>
    <hr>
    <h3>
    <div>
        <label for="zusammensetzung">${labelWurf}</label>
        <input type="text" id="zusammensetzung" value="${labelWurf}" disabled="true"></label>
        <input type="hidden" id="anzahlDerWuerfel" value = "0" disabled="true" visible="false">
    </div>
    </h3>
    <hr>
  </form>`,
				buttons:
				{
					ok:
					{
						icon: '',
						label: game.i18n.localize("SPACE1889.Go"),
						callback: (html) => 
						{
							const input = html.find('#anzahlDerWuerfel').val();
							const anzahl = input ? parseInt(input) : 1;
							const realAnzahl = Math.max(0, anzahl);
							const grund = manoeuvreAndName;

							let messageContent = `<div><h2>${grund}</h2></div>`;
							messageContent += `<p>${diceInfo}</p>`;
							messageContent += `<b>[[${realAnzahl}${dieType}]] von ${anzahl}</b> <br>`;
							let chatData =
							{
								user: game.user.id,
								speaker: ChatMessage.getSpeaker({ actor: actor }),
								content: messageContent
							};
							ChatMessage.create(chatData, {})
						}
					},
					abbruch:
					{
						label: game.i18n.localize("SPACE1889.Cancel"),
						callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok",
				render: handleRender
			})

		dialogue.render(true)


	}

	static showManoeuverInfo(key, actor, whisper)
	{
		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const rollMode = game.settings.get('core', 'rollMode');
		const manoeuvreName = game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvres[key]);
		const infoKey = CONFIG.SPACE1889.vehicleManoeuvres[key];
		const desc = game.i18n.localize( infoKey + "Desc");
		const label = `<h2><strong>${manoeuvreName}</strong></h2>`;
		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
			flavor: label,
			whisper: whisper ? [game.user.id] : [],
			content: desc ?? ''
		});
	}

	static onAutoDefense(ev)
	{
		if (!game.settings.get("space1889", "combatSupport"))
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NoAutoDefenseInfo"));
			return;
		}

		const button = $(ev.currentTarget);
		if (!button)
			return;

		const count = button[0].dataset.attackSuccesses;
		const actorId = button[0].dataset.actorId;
		const actorTokenId = button[0].dataset.actorTokenId;
		const targetId = button[0].dataset.targetId;
		const attackName = button[0].dataset.attackName;
		const damageType = button[0].dataset.damageType;
		const combatSkillId = button[0].dataset.skillId;
		const reducedDefense = button[0].dataset.reducedDefense;
		const areaDamage = Number(button[0].dataset.areaDamage);
		const effect = button[0].dataset.effect;
		const effectDurationCombatTurns = Number(button[0].dataset.effectDurationCombatTurns);
		const effectOnly = (button[0].dataset.effectOnly === "true");

		if (targetId == "")
		if (targetId == "")
			return;

		const token = SPACE1889Helper.getTokenFromId(targetId);
		if (!token)
			return;

		if (!token.actor)
		{
			ui.notifications.error(game.i18n.format("SPACE1889.InvalidTokenActor", { name: token.name }));
			return;
		}

		const attackerToken = SPACE1889Helper.getTokenFromId(actorTokenId);
		const actorName = !attackerToken ? 'unbekannt' : attackerToken.name;
		const permissions = token.actor.ownership;
		if (game.user.isGM || (permissions["default"] && permissions["default"] == 3) || (permissions[game.userId] && permissions[game.userId] == 3))
		{
			this.rollDefenseAndAddDamage({
				event: ev,
				actorId: actorId,
				actorTokenId: actorTokenId,
				actorName: actorName,
				targetId: targetId,
				attackName: attackName,
				damageType: damageType,
				combatSkillId: combatSkillId,
				attackValue: count,
				reducedDefense: reducedDefense,
				riposteDamageType: "",
				areaDamage: areaDamage,
				effect: effect,
				effectDurationCombatTurns: effectDurationCombatTurns,
				effectOnly: effectOnly
			});
		}
		else
		{
			let namensliste = "";
			for (let user of game.users)
			{
				if (permissions[user._id] == 3)
					namensliste += (namensliste.length > 0 ? ", " : "") + user.name;
			}
			ui.notifications.info(game.i18n.format("SPACE1889.NoTokenPermission", { player: namensliste }));
		}
		
	}

/**
 * 
 * @param {Object} data
 * @param {Object} data.event
 * @param {string} data.actorId
 * @param {string} data.actorName
 * @param {string} data.targetId
 * @param {string} data.attackName
 * @param {string} data.damageType
 * @param {number} data.attackValue
 * @param {string} data.combatSkillId
 * @param {string} data.reducedDefense
 * @param {string} data.riposteDamageType
 * @param {number} data.areaDamage
 * @param {string} data.effect
 * @param {number} data.effectDurationCombatTurns
 * @param {number} data.effectOnly
 */
	static async rollDefenseAndAddDamage(data)
	{
		let target = SPACE1889Helper.getTokenFromId(data.targetId);
		if (!target)
			return;

		if (this.getEventEvaluation(data.event).showDialog)
		{
			SPACE1889Combat.defenseDialog(data);
			return;
		}

		const options = SPACE1889Combat.getDefenseOptions(data);
		data.reducedDefense = options.defenseType;
		data.riposteDamageType = options.riposteDamageType;
		const modifierToolTipInfo = options.multiDefenseMalus === 0 ? "" : game.i18n.format("SPACE1889.ChatMultiAttackDefenseModifier", { mod: options.multiDefenseMalus });
		this.rollDefenseAndAddDamageSub(data, Math.max(0, options.diceCount), modifierToolTipInfo, options.additionalChatContent);
	}

	static getModifiedDefense(tokenId, actor, defenseType, combatSkillId)
	{
		let defenseCount = this.getDefenseCount(tokenId);

		const multiDefenseMalus = actor.getDefenseMalus(defenseCount + 1);

		let diceCount = Math.max(0, actor.system.secondaries.defense.total);
		if (defenseType == 'onlyPassive')
		{
			diceCount = Math.max(0, actor.system.secondaries.defense.passiveTotal + multiDefenseMalus);
			return { diceCount: diceCount, defenseType: defenseType };
		}

		let resultantDefenseType = defenseType;
		let activeOnly = false;
		if (defenseType.substring(0,10) == 'onlyActive')
		{
			diceCount = Math.max(0, actor.system.secondaries.defense.activeTotal);
			activeOnly = true;
		}

		let blockValue = 0;
		let parryValue = 0;
		let riposteDamageType = "nonLethal";
		if (actor.system.block)
			blockValue = activeOnly ? actor.system.block.value - actor.system.secondaries.defense.passiveTotal : actor.system.block.value;
		if (actor.system.parry)
		{
			parryValue = activeOnly ? actor.system.parry.value - actor.system.secondaries.defense.passiveTotal : actor.system.parry.value;
			riposteDamageType = actor.system.parry.riposteDamageType;
		}

		if (combatSkillId == "waffenlos" || combatSkillId == "nahkampf")
		{
			if (combatSkillId == "nahkampf")
			{
				const waffenloseParade = actor.system.talents.find(t => t.system.id == "waffenloseParade");
				if (waffenloseParade)
					blockValue += (waffenloseParade.system.level.total - 1) * 2;
				else
					blockValue -= 2;					
			}
			

			if (blockValue > diceCount && actor.system.block?.instinctive)
			{
				diceCount = blockValue;
				resultantDefenseType = (activeOnly ? 'onlyActive' : '') + (actor.system.block.riposte ? 'BlockRiposte' : 'Block');
				riposteDamageType = "nonLethal";
			}
			if (parryValue > diceCount && actor.system.parry?.instinctive)
			{
				diceCount = parryValue;
				resultantDefenseType = (activeOnly ? 'onlyActive' : '') + (actor.system.parry.riposte ? 'ParryRiposte' : 'Parry');
				riposteDamageType = actor.system.parry.riposteDamageType;
			}
			// ToDo: Was ist mit Ausweichen!?
		}
		diceCount = Math.max(0, diceCount + multiDefenseMalus);

		return { diceCount: diceCount, defenseType: resultantDefenseType, riposteDamageType: riposteDamageType, multiDefenseMod: multiDefenseMalus};
	}

	static async createInlineRollWithHtml(diceCount, probeName = "", tooltipInfo = "")
	{
		let r = new Roll(diceCount.toString() + game.settings.get("space1889", "dice"));
		await (game.release.generation < 12 ? r.evaluate({ async: true }) : r.evaluate());
		const htmlAn = await r.toAnchor();
		let outerHtml = htmlAn.outerHTML;
		const index = outerHtml.indexOf('class=""');
		let pre = (probeName != "" ? probeName : game.i18n.localize("SPACE1889.Probe")) + ": <b>";
		let post = " " + game.i18n.localize("SPACE1889.Of");
		post += (tooltipInfo != "") ? " <span data-tooltip='" + tooltipInfo + "'>" + diceCount.toString() + "</span></b>" : " " + diceCount.toString() + "</b>";
		let fullHtml = '';
		if (index > -1)
			fullHtml = pre + outerHtml.substring(0, index) + `class="inline-roll inline-result" ` + outerHtml.substring(index + 8) + post;
		else
			fullHtml = pre + outerHtml + post;

		return { roll: r, html: fullHtml };
	}

	static async addDamageToActor(actor, actorName, attackName, damageAmount, damageType)
	{
		const damageName = (attackName != "" ? attackName + " von " : "Wunde verursacht von ") + actorName;
		const damageData = [{ name: 'Wunde in Bearbeitung', type: 'damage' }];
		const items = await Item.create(damageData, { parent: actor });
		const item = items.shift();
		const path = damageType == "lethal" ? "icons/skills/wounds/blood-drip-droplet-red.webp" : "icons/skills/wounds/injury-pain-body-orange.webp";
		const eventDate = SPACE1889Time.getCurrentTimeDateString();
		const timestamp = SPACE1889Time.getCurrentTimestamp();
		const isCombat = game.combat?.active && game.combat?.started;

		await actor.updateEmbeddedDocuments("Item", [{
			_id: item._id,
			"system.damageType": damageType,
			"name": damageName,
			"img": path,
			"system.damage": damageAmount,
			"system.dataOfTheEvent": eventDate,
			"system.eventTimestamp": timestamp,
			"system.combatInfo.id": isCombat ? game.combat.id : "",
			"system.combatInfo.round": isCombat ? game.combat.round : 0,
			"system.combatInfo.turn": isCombat ? game.combat.turn : 0
		}]);
		await SPACE1889Healing.refreshTheInjuryToBeHealed(actor);

		return item._id;
	}

	static async rollDefenseAndAddDamageSub(data, diceCount, modifierToolTipInfo, additionalChatContent)
	{
		let target = SPACE1889Helper.getTokenFromId(data.targetId);
		const actorToken = SPACE1889Helper.getTokenFromId(data.actorTokenId);

		if (!target)
			return;

		await this.incrementDefenseCount(data.targetId);

		const rollWithHtml = await this.createInlineRollWithHtml(diceCount, "", modifierToolTipInfo);

		let title = game.i18n.localize("SPACE1889.SecondaryAttributeDef");

		if (data.reducedDefense.indexOf("Comparative") >= 0)
		{
			title = game.i18n.localize("SPACE1889.ChatOpposedRoll");
			title += _getDefenceName(data.reducedDefense, false);
		}
		else if (data.reducedDefense.substring(0, 10) == 'onlyActive')
		{
			title = game.i18n.localize("SPACE1889.ActiveDefense");
			title += _getDefenceName(data.reducedDefense, true);
		}
		else if (data.reducedDefense.indexOf('UseActionForDefense') >= 0)
		{
			title = game.i18n.localize("SPACE1889.TotalDefense");
			title += _getDefenceName(data.reducedDefense, true, true);
		}
		else if (data.reducedDefense == 'onlyPassive')
			title = game.i18n.localize("SPACE1889.PassiveDefense");
		else
			title = _getDefenceName(data.reducedDefense, false, true);

		if (data.reducedDefense.indexOf("UseActionForDefense") >= 0)
		{
			const statusIds = this.getActiveEffectStates(target.actor);
			if (statusIds.find(element => element === "totalDefense") == undefined)
				SPACE1889Helper.addEffect(target.actor, { name: "totalDefense", rounds: 1 });
		}

		let content = `<div><h2>${title}</h2></div>` + additionalChatContent + rollWithHtml.html;
		const chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: target.actor }),
			content: content
		};
		await ChatMessage.create(chatData, {});

		if (SPACE1889Helper.isDiceSoNiceEnabled() && diceCount > 0)
			await SPACE1889Helper.sleep(SPACE1889Helper.getDsnRollAnimationTime());

		const delta = data.attackValue - rollWithHtml.roll.total;
		const combatSkill = game.i18n.localize(CONFIG.SPACE1889.combatSkills[data.combatSkillId]);
		let doWeaponEffect = data.effect != "none";

		if (delta > 0 && data.reducedDefense !== "" && data.areaDamage > 0 && target.actor.type !== 'vehicle')
		{
			const factor = target.actor.system.secondaries.size.total > 0 ? -1 : 1;
			let sizeMod = factor * Math.floor(Math.abs(target.actor.system.secondaries.size.total) / 2);
			let extraDice = Math.abs(target.actor.system.secondaries.size.total % 2);

			if (target.actor.isSwarm())
			{
				extraDice = 0;
				sizeMod = 0;
			}

			if (extraDice > 0)
			{
				let r = new Roll("1" + game.settings.get("space1889", "dice"));
				await (game.release.generation < 12 ? r.evaluate({ async: true }) : r.evaluate());
				sizeMod += factor * r.total;
			}
			const damageAmount = Math.max(0, data.areaDamage + sizeMod);

			if (damageAmount > 0)
			{
				const itemId = await this.addDamageToActor(target.actor, data.actorName, data.attackName, ((doWeaponEffect && data.effectOnly) ? 0 : damageAmount), data.damageType);
				if (doWeaponEffect)
					await SPACE1889RollHelper.doDamageChatMessage(target.actor, itemId, damageAmount, data.damageType, "", data.effect, data.effectDurationCombatTurns, data.effectOnly, true);
				else
					await SPACE1889RollHelper.doDamageChatMessage(target.actor, itemId, damageAmount, data.damageType, "", "none", "", false, true);
			}
			else
			{
				const chatData =
				{
					user: game.user.id,
					speaker: ChatMessage.getSpeaker({ actor: target.actor }),
					content: game.i18n.format("SPACE1889.AutoDefenseAttackNoDamage", { attackerName: data.actorName, skill: combatSkill })
				};
				ChatMessage.create(chatData, {});
			}
		}
		else if (data.damageType === "disarm" || data.damageType === "disarmWithWeapon")
		{
			const damageAmount = data.attackValue - rollWithHtml.roll.total;
			await SPACE1889RollHelper.doDisarmChatMessage(target, data.actorName, actorToken, damageAmount, data.damageType, data.attackName);
		}
		else if (data.attackValue > rollWithHtml.roll.total)
		{
			let damageAmount = data.attackValue - rollWithHtml.roll.total;
			if (target.actor.isSwarm())
				damageAmount = 1;

			if (data.damageType == 'paralyse')
				await SPACE1889RollHelper.doParalysisChatMessage(target.actor, data.actorName, damageAmount, target.actor.system.abilities.str.total);
			else if (data.damageType === "grapple")
				await SPACE1889RollHelper.doGrappleChatMessage(target.actor, data.actorName, damageAmount, target.actor.system.abilities.str.total);
			else if (data.damageType === "trip")
				await SPACE1889RollHelper.doTripChatMessage(target.actor, data.actorName, damageAmount, target.actor.system.abilities.str.total);
			else
			{
				const itemId = await this.addDamageToActor(target.actor, data.actorName, data.attackName, ((doWeaponEffect && data.effectOnly) ? 0 : damageAmount), data.damageType);
				if (doWeaponEffect)
					await SPACE1889RollHelper.doDamageChatMessage(target.actor, itemId, damageAmount, data.damageType, "", data.effect, data.effectDurationCombatTurns, data.effectOnly, true);
				else
					await SPACE1889RollHelper.doDamageChatMessage(target.actor, itemId, damageAmount, data.damageType, "", "none", "", false, true);
			}
		}
		else if (delta < 0 && data.reducedDefense.indexOf('BlockRiposte') >= 0)
		{
			let damage = (-1) * delta;
			if (actorToken && actorToken.actor?.isSwarm())
				damage = 1;

			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackBlockRiposte", { attackerName: data.actorName, skill: combatSkill, damage: damage })
			};
			ChatMessage.create(chatData, {});
			await SPACE1889RollHelper.addActorDamageAndNotify(data.actorTokenId, SPACE1889Helper.getTokenName(target.actor._id), game.i18n.localize("SPACE1889.TalentGegenschlag") + "(" + data.attackName + ")", damage, data.riposteDamageType);
		}
		else if (delta < 0 && data.reducedDefense.indexOf('ParryRiposte') >= 0 )
		{
			let damage = (-1) * delta;
			if (actorToken && actorToken.actor?.isSwarm())
				damage = 1;

			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackParryRiposte", { attackerName: data.actorName, skill: combatSkill, damage: damage, type: SPACE1889Helper.getDamageTypeAbbr(data.riposteDamageType) })
			};
			ChatMessage.create(chatData, {});
			await SPACE1889RollHelper.addActorDamageAndNotify(data.actorTokenId, SPACE1889Helper.getTokenName(target.actor._id), game.i18n.localize("SPACE1889.TalentRiposte") + "(" + data.attackName + ")", damage, data.riposteDamageType);
		}
		else if (delta < 0 && data.reducedDefense.indexOf('Parry') >= 0 && data.combatSkillId == 'waffenlos')
		{
			let damage = (-1) * delta;
			if (actorToken && actorToken.actor?.isSwarm())
				damage = 1;

			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackParryBrawl", { attackerName: data.actorName, skill: combatSkill, damage: damage, type: SPACE1889Helper.getDamageTypeAbbr(data.riposteDamageType) })
			};
			ChatMessage.create(chatData, {});
			await SPACE1889RollHelper.addActorDamageAndNotify(data.actorTokenId, SPACE1889Helper.getTokenName(target.actor._id), game.i18n.localize("SPACE1889.Parry") + "(" + data.attackName + ")", damage, data.riposteDamageType);
		}
		else
		{
			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackMiss", { attackerName: data.actorName, skill: combatSkill })
			};
			ChatMessage.create(chatData, {});
		}

		const element = $(data.event.currentTarget);
		if (element)
		{
			if (!game.user.isGM)
				element.fadeOut();

			const id = element.closest(".message").attr("data-message-id");
			let message = game.messages.get(id);
			const buttonText = game.i18n.localize("SPACE1889.AutoDefense");
			let newContent = message.content.replace(buttonText + "</button>", buttonText + " (" + game.i18n.localize("SPACE1889.Done") +  ")</button>");			

			game.socket.emit("system.space1889", {
				type: "updateMessage",
				payload: {
					id: id,
					updateData: {
						[`flags.space1889.userHidden`]: true,
						[`content`]: newContent
					}
				}
			});

			if (game.user.isGM)
			{
				message.update({ "content": newContent, "flags.space1889.userHidden" : true });
			}
		}

		function _getDefenceName(defenseType, useBrackets, ignoreTotal = false)
		{
			let name = "";
			const risingBrackets = useBrackets ? " (" : "";
			const closingBrackets = useBrackets ? ")" : "";

			if (!ignoreTotal && defenseType.indexOf('UseActionForDefense') >= 0)
				name += risingBrackets + game.i18n.localize("SPACE1889.TotalDefense") + closingBrackets;
			if (defenseType.indexOf('Block') >= 0)
				name += risingBrackets + game.i18n.localize("SPACE1889.Block") + closingBrackets;
			else if (defenseType.indexOf('Parry') >= 0)
				name += risingBrackets + game.i18n.localize("SPACE1889.Parry") + closingBrackets;
			else if (defenseType.indexOf('Evasion') >= 0)
				name += risingBrackets + game.i18n.localize("SPACE1889.Evasion") + closingBrackets;

			//ToDo: disarm && disarmWithWeapon, dabei auch total, Block und Parry beachten

			return name;
		}
	}

	static async addActorDamageFromSocket(tokenId, damageData)
	{
		await SPACE1889RollHelper.addActorDamageAndNotify(tokenId, damageData.causerName, damageData.attackName, damageData.damageAmount, damageData.damageType, false);
	}

	static async addActorDamageAndNotify(tokenId, causerName, attackName, damageAmount, damageType, useSocket = true )
	{
		const actorToken = SPACE1889Helper.getTokenFromId(tokenId);
		if (!actorToken || !actorToken.actor)
			return;
		
		if (actorToken.actor.isOwner)
		{
			const itemId = await SPACE1889RollHelper.addDamageToActor(actorToken.actor, causerName, attackName, damageAmount, damageType);
			await SPACE1889RollHelper.doDamageChatMessage(actorToken.actor, itemId, damageAmount, damageType);
		}
		else if (useSocket)
		{
			game.socket.emit("system.space1889", {
				type: "createActorDamage",
				tokenId: tokenId,
				damageData: {
						causerName: causerName,
						attackName: attackName,
						damageAmount: damageAmount,
						damageType: damageType
				}
			});
		}
	}

	static async doParalysisChatMessage(actor, attackerName, virtualDamage, comparativeAttributeValue)
	{
		if (!actor)
			return;

		let effects = [];
		let trefferInfo = "";
		if (virtualDamage > (2 * comparativeAttributeValue))
		{
			effects.push({ name: "paralysis", rounds: this.getMaxRounds() });
			trefferInfo = "<b>" + game.i18n.localize("SPACE1889.Paralysed") + ":</b> " + game.i18n.localize("SPACE1889.ChatInfoTotalParalysed") + "<br>";
		}
		else if (virtualDamage > comparativeAttributeValue)
		{
			const rounds = virtualDamage - comparativeAttributeValue;
			effects.push({ name: "paralysis", rounds: rounds });
			trefferInfo = "<b>" + game.i18n.localize("SPACE1889.Paralysed") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoParalysed", { count: rounds }) + "<br>";
		}
		else
		{
			trefferInfo = game.i18n.format("SPACE1889.AutoDefenseAttackMiss", { attackerName: attackerName, skill: "" });
		}

		let info = "<small>" + game.i18n.format("SPACE1889.ChatInfoVirtualDamageVsStrength", { str: comparativeAttributeValue }) + "</small><br>";

		if (virtualDamage > comparativeAttributeValue)
			info += "<b>" + game.i18n.localize("SPACE1889.StrikeEffect") + ":</b> <br>" + trefferInfo;

		const titel = game.i18n.format("SPACE1889.ChatInfoVirtualDamage", { damage: virtualDamage.toString() });
		let messageContent = `<div><h2>${titel}</h2></div>`;
		messageContent += `${info}`;
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};


		ChatMessage.create(chatData, {});
		if (effects.length > 0)
			await SPACE1889Helper.addEffects(actor, effects);
	}

/**
 * 
 * @param {string} tokenId
 * @returns {number}
 */
	static getDefenseCount(tokenId)
	{
		let defenseCount = game.combat?.combatants?.find(c => c.tokenId == tokenId)?.getFlag("space1889", "defenseCount") || 0;
		return defenseCount;
	}

	static async incrementDefenseCount(tokenId)
	{
		const combatant = game.combat?.combatants?.find(c => c.tokenId == tokenId);
		if (!combatant)
			return;

		let defenseCount = combatant.getFlag("space1889", "defenseCount");
		if (defenseCount == undefined)
			return;
		await combatant.setFlag("space1889", "defenseCount", defenseCount + 1);
	}

	static getAttackCount(tokenId)
	{
		let attackCount = game.combat?.combatants?.find(c => c.tokenId == tokenId)?.getFlag("space1889", "attackCount") || 0;
		return attackCount;
	}

	static async incrementAttackCount(tokenId)
	{
		const combatant = game.combat?.combatants?.find(c => c.tokenId == tokenId);
		if (!combatant)
			return;

		let attackCount = combatant.getFlag("space1889", "attackCount") || 0;
		await combatant.setFlag("space1889", "attackCount", attackCount + 1);
	}

	static async logAttack(actor, titelInfo, tokenToUse = undefined)
	{
		let attackInfo = titelInfo;
		const token = tokenToUse ? tokenToUse : (SPACE1889Combat.getCombatToken(actor) || SPACE1889Combat.getToken(actor));
		if (token)
		{
			await SPACE1889RollHelper.incrementAttackCount(token.id);
			const attackCount = SPACE1889RollHelper.getAttackCount(token.id);
			if (attackCount > 1 && game.combat)
			{
				attackInfo = game.i18n.format("SPACE1889.AttackCountInCombatRound", { count: attackCount, round: game.combat.round }) + "<br>" + titelInfo;
			}
		}
		return attackInfo;
	}

	static rollHudAction(event, tokenId, actorId, type, itemId)
	{
		const tokenDocument = game.scenes.viewed.tokens.get(tokenId);
		const actor = tokenDocument ? tokenDocument.actor : game.actors.get(actorId);
		const showDialog = this.getEventEvaluation(event).showDialog;

		if (type === "skill")
		{
			SPACE1889Helper.rollAnySkill(tokenDocument, actor);
			return;
		}

		if (type === "grapple")
		{
			SPACE1889RollHelper.rollGrapple(tokenDocument, actor, showDialog);
		}

		if (type === "trip")
		{
			SPACE1889RollHelper.rollTrip(tokenDocument, actor, showDialog);
		}

		if (type === "disarm")
		{
			const usedWeapon = itemId === "" ? undefined : actor.items.get(itemId);
			SPACE1889RollHelper.rollDisarm(tokenDocument, actor, usedWeapon, showDialog);
		}

		if (type === "drop")
		{
			const item = actor.items.get(itemId);
			SPACE1889Light.rollDrop(tokenDocument, actor, item, showDialog);
		}

		if (type !== "attack" && type !== "talentAttack")
			return;

		const item = actor.items.get(itemId);
		if (!item)
			return;

		SPACE1889RollHelper.rollItemFromEvent(item, actor, event);
	}

	static async rollGrapple(tokenDocument, actor, showDialog)
	{
		if (!actor)
			return;

		if (!SPACE1889Combat.CheckEncounterAndTarget(tokenDocument, actor, true, showDialog))
			return;

		if (showDialog)
		{
			SPACE1889Combat.CombatManoeuverDialog(tokenDocument, actor, "grapple");
			return;
		}

		const target = game.user.targets.first();
		const data = this.getGrappleAttackValues(actor, target);

		if (!data.canDo)
			return;

		if (data.dice <= 0)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotGrapple", { name: actor.name }));
			return;
		}

		const anzahl = Math.max(0, data.dice);
		const chatInfo = "";
		const theTitelInfo = await SPACE1889RollHelper.logAttack(actor, data.name, tokenDocument);
		const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, null, anzahl, game.user.targets.ids, chatInfo, theTitelInfo, data.toolTipInfo, "", false, "", "public", "grapple");
		await ChatMessage.create(chatData, {});
	}

	static getGrappleAttackValues(actor, target)
	{
		const isInCloseCombatRange = SPACE1889Combat.isInCloseCombatRange(actor, target);
		const hasFreeHands = SPACE1889Combat.hasFreeHands(actor);
		const manoeuverName = game.i18n.localize("SPACE1889.CombatManoeuversGrapple");

		if (!actor || !target || !isInCloseCombatRange || !hasFreeHands)
			return { canDo: false, name: manoeuverName, dice: 0, isInRange: isInCloseCombatRange, sizeMalus: 0, toolTipInfo: ""};

		const sizeMalus = target.actor.system.secondaries.size.total;
		const rating = actor.getSkillLevel(actor, "waffenlos", "griffe") - sizeMalus;
		const toolTipInfo = sizeMalus !== 0 ? game.i18n.format("SPACE1889.ChatGrappleSizePenalty", { penalty: sizeMalus }) : "";

		return {canDo: true, name: manoeuverName, dice: rating, isInRange: isInCloseCombatRange, sizeMalus: sizeMalus, toolTipInfo: toolTipInfo};
	}

	static async rollTrip(tokenDocument, actor, showDialog)
	{
		if (!actor)
			return;

		if (!SPACE1889Combat.CheckEncounterAndTarget(tokenDocument, actor, true, showDialog))
			return;

		if (showDialog)
		{
			SPACE1889Combat.CombatManoeuverDialog(tokenDocument, actor, "trip");
			return;
		}

		const target = game.user.targets.first();
		const data = this.getTripAttackValues(actor, target);

		if (!data.canDo)
			return;

		if (data.dice <= 0)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotGrapple", { name: actor.name }));
			return;
		}

		const anzahl = Math.max(0, data.dice);
		const chatInfo = "";
		const theTitelInfo = await SPACE1889RollHelper.logAttack(actor, data.name, tokenDocument);
		const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, null, anzahl, game.user.targets.ids, chatInfo, theTitelInfo, data.toolTipInfo, "", false, "", "public", "trip");
		await ChatMessage.create(chatData, {});
	}

	static getTripAttackValues(actor, target)
	{
		const invalidActorType = actor?.type === "vehicle" || target?.actor?.type === "vehicle";
		const isInCloseCombatRange = SPACE1889Combat.isInCloseCombatRange(actor, target);
		const hasFreeHands = SPACE1889Combat.hasFreeHands(actor);
		const manoeuverName = game.i18n.localize("SPACE1889.CombatManoeuversTrip");

		if (!actor || !target || !SPACE1889Combat.isInCloseCombatRange(actor, target) || invalidActorType)
			return { canDo: false, name: manoeuverName, dice: 0, isInRange: isInCloseCombatRange, manyleggedMalus: 0, toolTipInfo: ""};

		let isVielbeinig = SPACE1889Helper.getTalentLevel(target.actor, "vielbeiner") > 0;
		if (target?.actor?.type === "creature" && target?.actor?.system?.movementType === "manylegged")
			isVielbeinig = true;

		const malus = isVielbeinig ? 2 : 0;
		const rating = actor.getSkillLevel(actor, "waffenlos", hasFreeHands ? "wuerfe" : "") - malus;
		const toolTipInfo = malus !== 0 ? game.i18n.format("SPACE1889.ChatTripSizePenalty", { penalty: malus }) : "";

		return {canDo: true, name: manoeuverName, dice: rating, isInRange: isInCloseCombatRange, manyleggedMalus: malus, toolTipInfo: toolTipInfo};
	}


	static async doGrappleChatMessage(actor, attackerName, virtualDamage, comparativeAttributeValue)
	{
		if (!actor)
			return;

		let effects = [];
		let trefferInfo = "";
		let grappled = "<b>" + game.i18n.localize("SPACE1889.EffectGrappled") + ":</b> ";

		const actorName = actor.token ? actor.token.name : actor.name;

		if (virtualDamage > comparativeAttributeValue * 2)
		{
			effects.push({ name: "grappled", rounds: this.getMaxRounds() });
			effects.push({ name: "noActiveDefense", rounds: this.getMaxRounds() });
			trefferInfo += grappled + game.i18n.format("SPACE1889.ChatGrappleGreatSuccess", { actorName: attackerName, targetName: actorName });
			trefferInfo += `<br>${game.i18n.localize("SPACE1889.EffectGrappledInfo")}`;
		}
		else if (virtualDamage > comparativeAttributeValue)
		{
			effects.push({ name: "grappled", rounds: this.getMaxRounds() });
			trefferInfo += grappled + game.i18n.format("SPACE1889.ChatGrappleSuccess", { actorName: attackerName, targetName: actorName });
			trefferInfo += `<br>${game.i18n.localize("SPACE1889.EffectGrappledInfo")}`;
		}
		else
		{
			trefferInfo += game.i18n.format("SPACE1889.ChatGrappleFail", { actorName: attackerName });
		}

		let info = "<small>" + game.i18n.format("SPACE1889.ChatInfoVirtualDamageVsStrength", { str: comparativeAttributeValue }) + "</small><br>";
		info += `<b>${game.i18n.localize("SPACE1889.StrikeEffect")}:</b>`;
		if (virtualDamage > comparativeAttributeValue)
			info += " <br>" + trefferInfo;
		else
			info += ` <b>${game.i18n.localize("SPACE1889.None")}</b><br>${trefferInfo}`;

		const titel = game.i18n.format("SPACE1889.ChatInfoVirtualDamage", { damage: virtualDamage.toString() });
		let messageContent = `<div><h2>${titel}</h2></div>`;
		messageContent += `${info}`;
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
		if (effects.length > 0)
			await SPACE1889Helper.addEffects(actor, effects);
	}

	static async doTripChatMessage(actor, attackerName, virtualDamage, comparativeAttributeValue)
	{
		if (!actor)
			return;

		let effects = [];
		let trefferInfo = "";
		const actorName = actor.token ? actor.token.name : actor.name;

		if (virtualDamage > comparativeAttributeValue)
		{
			effects.push({ name: "prone", rounds: this.getMaxRounds() });
			trefferInfo += "<b>" + game.i18n.localize("EFFECT.StatusProne") + ":</b> ";
			trefferInfo += game.i18n.format("SPACE1889.ChatInfoKnockdown", { actorName: actorName });
		}
		else
		{
			trefferInfo += game.i18n.format("SPACE1889.ChatTripFail", { actorName: actorName });
		}

		let info = "<small>" + game.i18n.format("SPACE1889.ChatInfoVirtualDamageVsStrength", { str: comparativeAttributeValue }) + "</small><br>";
		info += `<b>${game.i18n.localize("SPACE1889.StrikeEffect")}:</b>`;
		if (virtualDamage > comparativeAttributeValue)
			info += " <br>" + trefferInfo;
		else
			info += ` <b>${game.i18n.localize("SPACE1889.None")}</b> ${trefferInfo}`;

		const titel = game.i18n.format("SPACE1889.ChatInfoVirtualDamage", { damage: virtualDamage.toString() });
		let messageContent = `<div><h2>${titel}</h2></div>`;
		messageContent += `${info}`;
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});
		if (effects.length > 0)
			await SPACE1889Helper.addEffects(actor, effects);
	}

	static async rollDisarm(tokenDocument, actor, usedWeapon, showDialog)
	{
		if (!actor)
			return;

		if (!SPACE1889Combat.CheckEncounterAndTarget(tokenDocument, actor, true, showDialog))
			return;

		if (showDialog)
		{
			SPACE1889Combat.CombatManoeuverDialog(tokenDocument, actor, "disarm");
			return;
		}

		const target = game.user.targets.first();

		const data = this.getDisarmAttackValues(actor, target);
		if (data.noWeaponToDisarm)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.DisarmNoWeaponOnTarget"));
			return;
		}

		if (!data.canDo)
			return;

		let chatInfo = "";
		let specialAttack = "disarm";
		let weapon = null; 

		if (data.weapon && data.weaponRating > data.noWeaponRating)
		{
			specialAttack = "disarmWithWeapon";
			chatInfo = game.i18n.format("SPACE1889.DisarmWithWeapon", { weapon: usedWeapon.system.label });
			weapon = data.weapon;
		}

		if (data.dice <= 0)
		{
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotDisarm", { name: actor.name }));
			return;
		}

		const anzahl = Math.max(0, data.dice);

		const theTitelInfo = await SPACE1889RollHelper.logAttack(actor, data.name, tokenDocument);
		const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, weapon, anzahl, game.user.targets.ids, chatInfo, theTitelInfo, data.toolTipInfo, "", false, "", "public", specialAttack);
		await ChatMessage.create(chatData, {});
	}

	static getDisarmAttackValues(actor, target, usedWeapon)
	{
		const invalidActorType = actor.type === "vehicle" || target?.actor?.type === "vehicle" || target?.actor?.type === "creature";
		const isInCloseCombatRange = SPACE1889Combat.isInCloseCombatRange(actor, target);
		const noWeaponToDisarm = SPACE1889Combat.hasFreeHands(target?.actor);
		const manoeuverName = game.i18n.localize("SPACE1889.CombatManoeuversDisarm");
		let weapon = undefined;

		if (!actor || !target || !SPACE1889Combat.isInCloseCombatRange(actor, target) || invalidActorType || noWeaponToDisarm)
			return { canDo: false, name: manoeuverName, dice: 0, noWeaponRating: 0, weaponRating: 0, weapon: weapon, 
				isInRange: isInCloseCombatRange, noWeaponToDisarm: noWeaponToDisarm, toolTipInfo: ""};

		const malus = 0;
		const toolTipInfo = "";

		const canDoNoWeaponAttack = SPACE1889Combat.hasFreeHands(actor);
		const noWeaponsRating = canDoNoWeaponAttack ? (actor.GetSkillRating(actor, "waffenlos", "str") - malus) : 0;
		let weaponRating = 0;

		const knockMalus = 2;
		const weapons = SPACE1889Combat.getWeaponInHands(actor);
		const primaryRating = SPACE1889Combat.isCloseCombatWeapon(weapons.primaryWeapon, false)
			? actor.getSkillLevel(actor, weapons.primaryWeapon.system.skillId, weapons.primaryWeapon.system.specializationId) - malus - knockMalus
			: 0;
		const offHandMalus = SPACE1889Helper.getTalentLevel(actor, "beidhaendig") === 0 ? 2 : 0;
		const offHandRating = SPACE1889Combat.isCloseCombatWeapon(weapons.offHandWeapon, false)
			? actor.getSkillLevel(actor, weapons.offHandWeapon.system.skillId, weapons.offHandWeapon.system.specializationId) - malus - knockMalus - offHandMalus
			: 0;
		if (weapons.primaryWeapon && primaryRating > 0 && primaryRating >= offHandRating)
		{
			weaponRating = primaryRating;
			weapon = weapons.primaryWeapon;
		}
		else if (weapons.offHandWeapon && offHandRating > 0)
		{
			weaponRating = offHandRating;
			weapon = weapons.offHandWeapon;
		}

		const rating = Math.max(Math.max(weaponRating, noWeaponsRating), 0);

		return {
			canDo: canDoNoWeaponAttack || weapon != undefined,
			name: manoeuverName,
			dice: rating,
			noWeaponRating: noWeaponsRating,
			weaponRating: weaponRating,
			weapon: weapon,
			isInRange: isInCloseCombatRange,
			noWeaponToDisarm: noWeaponToDisarm,
			twoHandsMalus: malus,
			toolTipInfo: toolTipInfo
		};
	}


	static async doDisarmChatMessage(actorToken, attackerName, attackerToken, virtualDamage, type, attackWeaponName)
	{
		let actor = actorToken?.actor;
		if (!actorToken || !actor)
			return;

		let trefferInfo = "";
		const actorName = actorToken.name;

		const throwAway = type === "disarmWithWeapon";
		const weapons = SPACE1889Combat.getWeaponInHands(actor);
		const weapon = weapons.primaryWeapon ? weapons.primaryWeapon : weapons.offHandWeapon;
		let transferWeapon = undefined;

		if (virtualDamage <= 0)
		{
			trefferInfo += game.i18n.format("SPACE1889.DisarmFailText", { attackerName: attackerName });
		}
		else if (throwAway)
		{
			trefferInfo += game.i18n.format("SPACE1889.DisarmFlingAway", {attackerName: attackerName,  targetName: actorName, weaponName: weapon?.system?.label, distance: 1.5*virtualDamage });
		}
		else
		{
			trefferInfo += game.i18n.format("SPACE1889.DisarmStealTheWeapon", { attackerName: attackerName, targetName: actorName, weaponName: weapon?.system?.label });
			transferWeapon = weapon;
		}

		let info = "<small>" + game.i18n.format("SPACE1889.Delta", { delta: virtualDamage.toString() }) + "</small><br>";
		info += `<b>${game.i18n.localize("SPACE1889.StrikeEffect")}:</b>`;
		if (virtualDamage > 0)
			info += " <br>" + trefferInfo;
		else
			info += ` <b>${game.i18n.localize("SPACE1889.None")}</b><br> ${trefferInfo}`;

		const titel = virtualDamage > 0
			? game.i18n.localize("SPACE1889.DisarmSuccess")
			: game.i18n.localize("SPACE1889.DisarmFail");
		let messageContent = `<div><h2>${titel}</h2></div>`;
		messageContent += `${info}`;
		let chatData =
		{
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: messageContent
		};

		ChatMessage.create(chatData, {});

		if (weapon && virtualDamage > 0)
		{
			const attacker = attackerToken?.actor;
			if (attacker && transferWeapon)
			{
				if (SPACE1889Helper.hasOwnership(attacker))
				{
					await SPACE1889RollHelper.copyActorItem(attackerToken, actorToken, weapon.id);
				}
				else
				{
					game.socket.emit("system.space1889", {
						type: "copyActorItem",
						payload: {
							tokenId: attackerToken.id,
							sourceTokenId: actorToken?.id,
							itemId: weapon.id
						}
					});
				}
			}
			actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.usedHands": "none" }]);
		}
	}

	static async copyActorItem(actorToken, sourceToken, itemId)
	{
		if (actorToken && sourceToken)
		{
			const item = sourceToken.actor.items.get(itemId);
			if (item)
			{
				const copyItem = foundry.utils.duplicate(item);
				await actorToken.actor.createEmbeddedDocuments( "Item", [copyItem] );
			}
		}
	}
}
