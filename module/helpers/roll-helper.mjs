import SPACE1889Helper from "../helpers/helper.mjs";
import DistanceMeasuring from "../helpers/distanceMeasuring.mjs"

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
			const targetInfo = SPACE1889Helper.getCombatSupportTargetInfo()
			if (targetInfo.combatSupport && (targetInfo.noTarget || targetInfo.isDead))
			{
				this.reallyAttackDialog(item, actor, dieCount, showDialog, targetInfo);
				return;
			}
		}

		if (item.type == 'talent')
			this.rollSpecialTalent(item, actor, dieCount, showDialog)
		else
			this.rollSpecial(item, actor, dieCount, showDialog);
	}

	static reallyAttackDialog(item, actor, dieCount, showDialog, info)
	{
		const text = info.noTarget ? game.i18n.localize("SPACE1889.NoTarget") : game.i18n.localize("SPACE1889.DeadTarget");
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
						label: 'Abbrechen',
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok"
			}).render(true);

		async function myCallback(html)
		{
			if (item.type == 'talent')
				SPACE1889RollHelper.rollSpecialTalent(item, actor, dieCount, showDialog)
			else
				SPACE1889RollHelper.rollSpecial(item, actor, dieCount, showDialog);
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
					return Math.max(0, skillItem.system.rating + ((item.system.level.value - 1) * 2));
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
					return Math.max(0, skillItem.system.rating + weaponDamage + ((item.system.level.value - 1) * 2));
				}
			}
			else if (item.system.id == "eigenartigerKampfstil")
			{
				const defense = actor.system.secondaries.defense.total;
				return (defense + (Number(item.system.level.value) * 2));
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

		return false;
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
		if (this.canNotAttack(actor, true))
			return;

		const isWeapon = item.type == "weapon";

		if (isWeapon && !SPACE1889Helper.isWeaponReady(item, actor))
		{
			ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotUsedIsNotReady", { weapon: item.name }));
			return;
		}

		if (isWeapon && !SPACE1889Helper.canDoUseWeapon(item, actor))
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.AmmunitionCanNotFireOutOfAmmo"));
			return;
		}

		const extraInfo = withExtraInfo ? game.i18n.localize(item.system.infoLangId) : "";
		let toolTipInfo = "";
		const titelPartOne = game.i18n.localize("SPACE1889.ModifiedRoll");
		const inputDesc = game.i18n.localize("SPACE1889.NumberOfModificationDice");
		const diceDesc = game.i18n.localize("SPACE1889.ConfigDice");
		const isAttackTalent = item.isAttackTalent();
		const talentWeapon = isAttackTalent ? SPACE1889RollHelper.getWeaponFromTalent(actor, item) : null;

		const targetId = game.user.targets.first() ? game.user.targets.first().id : "";
		let addAutoDefense = game.settings.get("space1889", "combatSupport") && (item.type == 'weapon' || isAttackTalent);
		let defaultMod = 0;
		if (addAutoDefense && targetId != "")
		{
			let controlledToken = SPACE1889Helper.getControlledTokenDocument();
			if (actor._id == controlledToken?.actorId)
			{
				let distanceInfo = DistanceMeasuring.getDistanceInfo(controlledToken, game.user.targets.first().document);
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

				const closeCombatRange = 1.5;
				if (!isRangedCombat && distanceInfo.distance > closeCombatRange)
				{
					if (distanceInfo.xGridDistance > 1.0 || distanceInfo.yGridDistance > 1.0)
					{
						ui.notifications.info(game.i18n.localize("SPACE1889.NotInRange"));
						return;
					}
				}
				if (distanceInfo.distance > closeCombatRange && DistanceMeasuring.getGridWorldSize() <= closeCombatRange &&
					distanceInfo.xGridDistance <= 1 && distanceInfo.yGridDistance <= 1)
					distanceInfo.distance = closeCombatRange;

				defaultMod = isRangedCombat ? SPACE1889Helper.getDistancePenalty(item, distanceInfo.distance, actor) : 0;
				dieCount += defaultMod;
				if (defaultMod != 0)
					toolTipInfo = game.i18n.format("SPACE1889.ChatDistanceMod", { mod: SPACE1889Helper.getSignedStringFromNumber(defaultMod) });

				titelInfo += " " + game.i18n.format("SPACE1889.ChatDistanceInBrackets", { distance: distanceInfo.distance.toFixed(1), unit: distanceInfo.unit });
			}
		}
		
		if (showDialog)
		{
			const diceCount = dieCount - defaultMod;
			let dialogue = new Dialog(
				{
					title: `${titelPartOne}: ${item.system.label} (${diceCount} ${diceDesc})`,
					content: `<p>${inputDesc}: <input type="number" id="anzahlDerWuerfel" value = "${defaultMod}"></p>`,
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
							label: 'Abbrechen',
							callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
							icon: `<i class="fas fa-times"></i>`
						}
					},
					default: "ok"
				}).render(true);

			async function myCallback(html)
			{
				const input = html.find('#anzahlDerWuerfel').val();
				let anzahl = input ? parseInt(input) : 0;
				toolTipInfo = anzahl == 0 ? "" : game.i18n.format("SPACE1889.ChatDistanceMod", { mod: SPACE1889Helper.getSignedStringFromNumber(anzahl) }); 
				anzahl += diceCount;
				const useWeaponChatInfo = await SPACE1889Helper.useWeapon(item, actor);
				const chatData = await getChatData(anzahl, useWeaponChatInfo);
				ChatMessage.create(chatData, {});
			}
		}
		else
		{
			const useWeaponChatInfo = await SPACE1889Helper.useWeapon(item, actor);
			const chatData = await getChatData(dieCount, useWeaponChatInfo);
			ChatMessage.create(chatData, {});
		}

		async function getChatData(wurfelAnzahl, useWeaponChatInfo)
		{
			const rollWithHtml = await SPACE1889RollHelper.createInlineRollWithHtml(Math.max(0, wurfelAnzahl), titelInfo, toolTipInfo);
			let weapon = undefined;
			let weaponSkill = "";
			let weaponDamageType = "";
			if (item.type == "weapon")
			{
				weapon = item;
				weaponSkill = weapon.system.skillId;
				weaponDamageType = weapon.system.ammunition.damageType ?? weapon.system.damageType;
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
				messageContent += `<button class="autoDefence chatButton" data-action="defence" data-actor-id="${actor._id}" data-actor-token-id="${speaker.token}" data-target-id="${targetId}" data-attack-name="${item.name}" data-attack-successes="${rollWithHtml.roll.total}" data-damage-type="${weaponDamageType}" data-skill-id="${weaponSkill}" data-reduced-defense="${reducedDefense}" data-area-damage="${areaDamage}">${buttonText}</button>`;
			}
			let chatData =
			{
				user: game.user.id,
				speaker: speaker,
				content: messageContent
			};
			return chatData;
		}
	}

	/**
	 * 
	 * @param {object} item item
	 * @param {object} actor
	 * @param {boolean} whisper
	 */
	static rollItemInfo(item, actor, whisper)
	{
		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const rollMode = game.settings.get('core', 'rollMode');
		let label = `[${item.type}] ${item.name}`;
		let desc = item.system.description;
		if (item.type == "skill")
		{
			const fertigkeit = game.i18n.localize("SPACE1889.Skill") ?? item.type;
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId && item.system.description != "")
				desc = item.system.description;
			if (item.system.isSkillGroup)
			{
				const skillGroup = game.i18n.localize("SPACE1889.SkillGroup");
				const gruppe = game.i18n.localize(CONFIG.SPACE1889.skillGroups[item.system.skillGroupName]);
				label = `<h2><strong>${gruppe}</strong></h2> <h3>[${skillGroup}]</h3>`;
			}
			else
				label = `<h2><strong>${item.system.label}</strong> [${fertigkeit}]</h2>`;
		}
		else if (item.type == "specialization")
		{
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId && item.system.description != "")
				desc = item.system.description;

			const skillLangId = item.system.nameLangId = 'SPACE1889.Skill' + item.system.underlyingSkillId.replace(/^(.)/, function (b) { return b.toUpperCase(); });

			let skillName = game.i18n.localize(skillLangId);
			if (skillName == skillLangId)
				skillName = item.system.underlyingSkillId;
			const specialization = game.i18n.localize("SPACE1889.Specialization") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong></h2> <h3>[${skillName} ${specialization}]</h3>`;
		}
		else if (item.type == "talent")
		{
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId && item.system.description != "")
				desc = item.system.description;
			const talent = game.i18n.localize("SPACE1889.Talent") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${talent}]</h2>`;
		}
		else if (item.type == "weakness")
		{
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId && item.system.description != "")
				desc = item.system.description;
			const weakness = game.i18n.localize("SPACE1889.Weakness") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${weakness}]</h2>`;
		}
		else if (item.type == "resource")
		{
			desc = game.i18n.localize(item.system.descriptionLangId);
			const weakness = game.i18n.localize("SPACE1889.Resource") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${weakness}]</h2>`;
		}
		else if (item.type == "weapon")
		{
			desc = "";
			const weapon = game.i18n.localize("SPACE1889.Weapon") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${weapon}]</h2>`;
			if (item.system.specializationId != "none")
				desc += game.i18n.localize("SPACE1889.CombatSpecialization") + ": " + game.i18n.localize(CONFIG.SPACE1889.combatSpecializations[item.system.specializationId]) + "<br>";
			desc +=  game.i18n.localize("SPACE1889.Damage") + ": " + item.system.damage.toString() + " " + item.system.damageTypeDisplay;
			if (item.system.range != "")
			{
				desc += "<br>" + game.i18n.localize("SPACE1889.Range") + ": " + item.system.range;
				if (item.system.templateConeAngle)
					desc += "<br>" + game.i18n.localize("SPACE1889.ConeAngle") + ": " + item.system.templateConeAngle + "°";
				desc += "<br>" + game.i18n.localize("SPACE1889.Capacity") + ": " + item.system.capacity + " " + game.i18n.localize(CONFIG.SPACE1889.weaponCapacityTypes[item.system.capacityType] + "Abbr");
			}

			desc += "<br>" + game.i18n.localize("SPACE1889.Weight") + ": " + item.system.weight.toString() + "kg";
			desc += "<br>" + game.i18n.localize("SPACE1889.Price") + ": " + item.system.price;

			if (item.system.location == "mounted")
			{
				desc += "<br>" + game.i18n.localize("SPACE1889.SecondaryAttributeSiz") + ": " + item.system.size;
				const mountPos = game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[item.system.vehicle.spot]);
				desc += "<br>" + game.i18n.localize("SPACE1889.WeaponGunPosition") + ": " + mountPos;

				if (item.system.vehicle.isSwivelMounted)
					desc += "<br>" + game.i18n.localize("SPACE1889.WeaponSwivelingRange") + ": " + item.system.vehicle.swivelingRange + "&deg;";
				else
					desc += "<br>" + game.i18n.localize("SPACE1889.WeaponIsRigidlyMounted");
			}


			if (item.system.description != "")
				desc += "<br>" + game.i18n.localize("SPACE1889.Description") + ": " + jQuery(item.system.description).text();
		}
		else if (item.type == "armor")
		{
			const armor = game.i18n.localize("SPACE1889.Armor") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${armor}]</h2>`;
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId && item.system.description != "")
				desc = item.system.description;
			else if (item.system.description != "")
				desc += "<br>" + item.system.description;
		}
		else if (item.type == "language")
		{
			const language = game.i18n.localize("SPACE1889.Language") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${language}]</h2>`;
			desc = game.i18n.localize("SPACE1889.LanguageOrigin") + ": " + item.system.origin + "<br>"
				+ game.i18n.localize("SPACE1889.FamilyOfLanguages") + ": " + item.system.family;
			if (item.system.isDialectSourceId != "no")
				desc += "<br>" + game.i18n.localize("SPACE1889.IsDialectFrom") + " " + item.system.dialect;
			if (item.system.old)
				desc += "<br>" + item.system.oldInfo;
		}
		else if (item.type == "currency")
		{
			const currency = game.i18n.localize("ITEM.TypeCurrency") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${currency}]</h2>`;
			desc = "";
			if (item.type != "money")
			{
				const typeId = CONFIG.SPACE1889.moneyTypes[item.type];
				if (typeId != undefined)
				{
					const typename = game.i18n.localize(typeId);
					if (typename != "" && typename != typeId)
						desc = "<small>" + typename + "</small><br>";
				}
			}

			desc += item.system.quantity.toString() + " " + item.system.abbr + " ~ " + item.system.exchangeValue + "<br>";
			desc += game.i18n.localize("SPACE1889.ExchangeRate") + ": ";
			desc += "1 " + game.i18n.localize("SPACE1889.CurrencyBritishPoundsAbbr") + " = " + item.system.exchangeRateForOnePound.toString() + " " + item.system.abbr;
		}
		else if (item.type == "ammunition")
		{
			const type = game.i18n.localize("SPACE1889.Ammunition") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${type}]</h2>`;
			desc =  game.i18n.localize("SPACE1889.Damage") + ": " + game.i18n.localize(CONFIG.SPACE1889.noComboDamageTypes[item.system.damageType]) + "<br>";
			desc += game.i18n.localize("SPACE1889.AmmunitionType") + ": " + game.i18n.localize(CONFIG.SPACE1889.weaponAmmunitionTypes[item.system.type]) + "<br>";

			if (item.system.caliber != "")
				desc += game.i18n.localize("SPACE1889.Caliber") + ": " + item.system.caliber + "<br>";

			if (item.system.capacityType != "default")
			{
				desc += game.i18n.localize("SPACE1889.CapacityTypeLong") + ": " + game.i18n.localize(CONFIG.SPACE1889.ammunitionCapacityTypes[item.system.capacityType]) + "<br>";
				desc += game.i18n.localize("SPACE1889.Capacity") + ": " + item.system.capacity.toString() + "<br>";
			}

			if (item.system.damageModifikator != 0)
				desc += game.i18n.localize("SPACE1889.AmmunitionDamageModifier") + ": " + item.system.damageModifikator.toString() + "<br>";

			if (item.system.damageModifikator != 0)
				desc += game.i18n.localize("SPACE1889.AmmunitionRangeModifierFactor") + ": " + item.system.rangeModFactor.toString() + "<br>";
		}
		else
		{
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId)
				desc = "";
			if (item.system.description != "")
				desc += "<br>" + item.system.description;

			const type = game.i18n.localize("SPACE1889.Item") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${type}]</h2>`;
		}

		if (this.showItemImage(item))
			desc = SPACE1889Helper.getItemChatImageHtml(item.img, this.isSmallItemImage(item)) + desc;

		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
			flavor: label,
			whisper: whisper ? [game.user.id] : [],
			content: desc ?? ''
		});
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
		let submit = game.i18n.localize("SPACE1889.Submit")
		let cancel = game.i18n.localize("SPACE1889.Cancel")
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
					callback: () =>
					{
						selectedOption = document.getElementById('damageType').value;
						userInputName = document.getElementById('damageName').value;
						damageAmount = document.getElementById('damage').value;
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
					const eventDate = SPACE1889Helper.getCurrentTimeDateString();

					actor.updateEmbeddedDocuments("Item", [{ _id: item._id, "system.damageType": selectedOption, "name": userInputName, "img": path, "system.damage": damageAmountInt, "system.dataOfTheEvent": eventDate }]);
					SPACE1889RollHelper.doDamageChatMessage(actor, item._id, damageAmountInt, selectedOption, (useInputName ? userInputName : ""));
				}
				else if (actor.items.get(item._id) != undefined)
				{
					actor.deleteEmbeddedDocuments("Item", [item._id]);
					ui.notifications.info(game.i18n.format("SPACE1889.ChatInfoUndoDamage", { name: actor.name }));
				}
			}
		});
		dialog.render(true);
	}

	static getMaxRounds()
	{
		return 600;
	}

	static doDamageChatMessage(actor, itemId, dmg, dmgType, dmgName = "")
	{
		const item = actor.items.get(itemId);
		if (item == undefined)
			return;

		const dmgTypeLabel = dmgType == "lethal" ? game.i18n.localize("SPACE1889.LethalAbbr") : game.i18n.localize("SPACE1889.NonLethalAbbr");
		const isCharakter = actor.type == "character";
		const isVehicle = actor.type == "vehicle";
		let stun = isVehicle ? 1000 : actor.system.secondaries.stun.total;
		let str = isVehicle ? 1000 : actor.system.abilities.str.total;
		let recoil = 0;
		let liegend = false;
		let stunned = false;
		let unconsciousStrike = 0;


		if (dmg > str)
		{
			liegend = dmg > (2 * str);
			recoil = (dmg - str) * 1.5;
		}

		if (dmg > (2 * stun))
			unconsciousStrike = dmg - (2 * stun);
		if (dmg > stun)
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
		if (dmgType == "lethal")
			damageTuple.lethal += dmg;
		else
			damageTuple.nonLethal += dmg;

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

		if (isCharakter)
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

		const usePercentage = !isCharakter && this.usePercentForNpcAndCreatureDamageInfo();

		let info = "<small>" + (dmgName != "" ? "durch <i>" + dmgName + "</i> und " : "");
		info += game.i18n.format("SPACE1889.ChatInfoHealth", { health: (!usePercentage ? newHealth.toString() : Math.round(100 * newHealth / maxHealth).toString() + "%") });
		if (damageTuple.nonLethal > 0)
			info += " " + game.i18n.format("SPACE1889.ChatInfoHealthLethalDamageOnly", { lethalHealth: (!usePercentage ? lethalValue.toString() : Math.round(100 * lethalValue / maxHealth).toString() + "%") });
		info += "</small><br>";

		if (trefferInfo != "")
			info += "<b>" + game.i18n.localize("SPACE1889.StrikeEffect") + ":</b> <br>" + trefferInfo;
		if (gesamtInfo != "")
			info += (trefferInfo != "" ? "<br>" : "") + "<b>" + game.i18n.localize("SPACE1889.OverallEffect") + ":</b> <br>" + gesamtInfo;

		const titel = game.i18n.format("SPACE1889.ChatInfoDamage", { damage: (!usePercentage ? dmg.toString() : Math.round(100 * dmg / maxHealth).toString() + "%"), damageType: dmgTypeLabel });
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
			SPACE1889Helper.addEffects(actor, effects);
	}

	static usePercentForNpcAndCreatureDamageInfo()
	{
		return game.settings.get("space1889", "usePercentForNpcAndCreatureDamageInfo");
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

		const isTotalDefense = key == "totalDefense"
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
				html.on('input', '.choices', () =>
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
						label: 'Abbrechen',
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

		if (targetId == "")
			return;

		const token = game.scenes.viewed.tokens.get(targetId);
		if (!token)
			return;

		const attackerToken = game.scenes.viewed.tokens.get(actorTokenId);
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
				areaDamage: areaDamage
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
 *  
 */
	static async rollDefenseAndAddDamage(data)
	{
		let target = game.scenes.viewed.tokens.get(data.targetId);
		if (!target)
			return;

		const rollAndDefense = SPACE1889RollHelper.getModifiedDefense(data.targetId, target.actor, data.reducedDefense, data.combatSkillId)
		data.reducedDefense = rollAndDefense.defenseType;
		data.riposteDamageType = rollAndDefense.riposteDamageType;
		const modifierToolTipInfo = rollAndDefense.multiDefenseMod == 0 ? "" : game.i18n.format("SPACE1889.ChatMultiAttackDefenseModifier", { mod: rollAndDefense.multiDefenseMod });

		if (this.getEventEvaluation(data.event).showDialog)
		{
			this.rollDefenseAndAddDamageWithDialog(data, rollAndDefense.diceCount, modifierToolTipInfo);
			return;
		}

		this.rollDefenseAndAddDamageSub(data, rollAndDefense.diceCount, modifierToolTipInfo);
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
					blockValue += (waffenloseParade.system.level.value - 1) * 2;
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
		}
		diceCount = Math.max(0, diceCount + multiDefenseMalus);

		return { diceCount: diceCount, defenseType: resultantDefenseType, riposteDamageType: riposteDamageType, multiDefenseMod: multiDefenseMalus};
	}

	static async createInlineRollWithHtml(diceCount, probeName = "", tooltipInfo = "")
	{
		let r = new Roll(diceCount.toString() + game.settings.get("space1889", "dice"));
		await r.evaluate({ async: true });
		const htmlAn = await r.toAnchor();
		let outerHtml = htmlAn.outerHTML;
		const index = outerHtml.indexOf('class=""');
		let pre = (probeName != "" ? probeName : game.i18n.localize("SPACE1889.Probe")) + ": <b>";
		let post = " " + game.i18n.localize("SPACE1889.Of");
		post += (tooltipInfo != "") ? " <span title='" + tooltipInfo + "'>" + diceCount.toString() + "</span></b>" : " " + diceCount.toString() + "</b>";
		const fullHtml = pre + outerHtml.substring(0, index) + `class="inline-roll inline-result" ` + outerHtml.substring(index + 8) + post;
		return { roll: r, html: fullHtml };
	}

	static async addDamageToActor(actor, actorName, attackName, damageAmount, damageType)
	{
		const damageName = (attackName != "" ? attackName + " von " : "Wunde verursacht von ") + actorName;
		const damageData = [{ name: 'Wunde in Bearbeitung', type: 'damage' }];
		const items = await Item.create(damageData, { parent: actor });
		const item = items.shift();
		const path = damageType == "lethal" ? "icons/skills/wounds/blood-drip-droplet-red.webp" : "icons/skills/wounds/injury-pain-body-orange.webp";
		const eventDate = SPACE1889Helper.getCurrentTimeDateString();
		actor.updateEmbeddedDocuments("Item", [{ _id: item._id, "system.damageType": damageType, "name": damageName, "img": path, "system.damage": damageAmount, "system.dataOfTheEvent": eventDate }]);
		return item._id;
	}

	static async rollDefenseAndAddDamageSub(data, diceCount, modifierToolTipInfo)
	{
		let target = game.scenes.viewed.tokens.get(data.targetId);
		if (!target)
			return;

		await this.incrementDefenseCount(data.targetId);

		const rollWithHtml = await this.createInlineRollWithHtml(diceCount, "", modifierToolTipInfo);

		let title = game.i18n.localize("SPACE1889.SecondaryAttributeDef");
		if (data.reducedDefense.substring(0, 10) == 'onlyActive')
		{
			title = game.i18n.localize("SPACE1889.ActiveDefense");
			if (data.reducedDefense.indexOf('Block') >= 0)
				title += " (" + game.i18n.localize("SPACE1889.Block") + ")";
			if (data.reducedDefense.indexOf('Parry') >= 0)
				title += " (" + game.i18n.localize("SPACE1889.Parry") + ")";
		}
		else if (data.reducedDefense == 'onlyPassive')
			title = game.i18n.localize("SPACE1889.PassiveDefense");
		else if (data.reducedDefense.indexOf('Block') >= 0)
			title = game.i18n.localize("SPACE1889.Block");
		else if (data.reducedDefense.indexOf('Parry') >= 0)
			title = game.i18n.localize("SPACE1889.Parry");

		let content = `<div><h2>${title}</h2></div>` + rollWithHtml.html;
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

		if (delta >= 0 && data.reducedDefense != "" && data.areaDamage > 0 && target.type != 'vehicle')
		{
			let sizeMod = Math.floor(Math.abs(target.actor.system.secondaries.size.total) / 2);
			const extraDice = Math.abs(target.actor.system.secondaries.size.total % 2);
			const factor = target.actor.system.secondaries.size.total > 0 ? -1 : 1;

			if (extraDice > 0)
			{
				let r = new Roll("1" + game.settings.get("space1889", "dice"));
				await r.evaluate({ async: true });
				sizeMod += factor * r.total;
			}
			const damageAmount = data.areaDamage + sizeMod;
			const itemId = await this.addDamageToActor(target.actor, data.actorName, data.attackName, damageAmount, data.damageType);
			SPACE1889RollHelper.doDamageChatMessage(target.actor, itemId, damageAmount, data.damageType);
		}
		else if (data.attackValue > rollWithHtml.roll.total)
		{
			let damageAmount = data.attackValue - rollWithHtml.roll.total;
			if (data.damageType == 'paralyse')
				SPACE1889RollHelper.doParalysisChatMessage(target.actor, data.actorName, damageAmount, target.actor.system.abilities.str.total);
			else
			{
				const itemId = await this.addDamageToActor(target.actor, data.actorName, data.attackName, damageAmount, data.damageType);
				SPACE1889RollHelper.doDamageChatMessage(target.actor, itemId, damageAmount, data.damageType);
			}
		}
		else if (delta < 0 && data.reducedDefense.indexOf('BlockRiposte') >= 0)
		{
			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackBlockRiposte", { attackerName: data.actorName, skill: combatSkill, damage: (delta * (-1)) })
			};
			ChatMessage.create(chatData, {});
			await SPACE1889RollHelper.addActorDamageAndNotify(data.actorTokenId, SPACE1889Helper.getTokenName(target.actor._id), game.i18n.localize("SPACE1889.TalentGegenschlag") + "(" + data.attackName + ")", (delta * (-1)), data.riposteDamageType);
		}
		else if (delta < 0 && data.reducedDefense.indexOf('ParryRiposte') >= 0 )
		{
			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackParryRiposte", { attackerName: data.actorName, skill: combatSkill, damage: (delta * (-1)), type: SPACE1889Helper.getDamageTypeAbbr(data.riposteDamageType) })
			};
			ChatMessage.create(chatData, {});
			await SPACE1889RollHelper.addActorDamageAndNotify(data.actorTokenId, SPACE1889Helper.getTokenName(target.actor._id), game.i18n.localize("SPACE1889.TalentRiposte") + "(" + data.attackName + ")", (delta * (-1)), data.riposteDamageType);
		}
		else if (delta < 0 && data.reducedDefense.indexOf('Parry') >= 0 && data.combatSkillId == 'waffenlos')
		{
			const chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: target.actor }),
				content: game.i18n.format("SPACE1889.AutoDefenseAttackParryBrawl", { attackerName: data.actorName, skill: combatSkill, damage: (delta * (-1)), type: SPACE1889Helper.getDamageTypeAbbr(data.riposteDamageType) })
			};
			ChatMessage.create(chatData, {});
			await SPACE1889RollHelper.addActorDamageAndNotify(data.actorTokenId, SPACE1889Helper.getTokenName(target.actor._id), game.i18n.localize("SPACE1889.Parry") + "(" + data.attackName + ")", (delta * (-1)), data.riposteDamageType);
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
	}

	static async addActorDamageFromSocket(tokenId, damageData)
	{
		await SPACE1889RollHelper.addActorDamageAndNotify(tokenId, damageData.causerName, damageData.attackName, damageData.damageAmount, damageData.damageType, false);
	}

	static async addActorDamageAndNotify(tokenId, causerName, attackName, damageAmount, damageType, useSocket = true )
	{
		const actorToken = game.scenes.viewed.tokens.get(tokenId);
		if (!actorToken || !actorToken.actor)
			return;
		
		if (actorToken.actor.isOwner)
		{
			const itemId = await SPACE1889RollHelper.addDamageToActor(actorToken.actor, causerName, attackName, damageAmount, damageType);
			SPACE1889RollHelper.doDamageChatMessage(actorToken.actor, itemId, damageAmount, damageType);
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


	static async rollDefenseAndAddDamageWithDialog(data, diceCount, modifierToolTipInfo)
	{
		const titelPartOne = game.i18n.localize("SPACE1889.ModifiedRoll");
		const inputDesc = game.i18n.localize("SPACE1889.NumberOfModificationDice");
		const diceDesc = game.i18n.localize("SPACE1889.ConfigDice");
		const titel = game.i18n.localize("SPACE1889.SecondaryAttributeDef");

		new Dialog(
			{ 
				title: `${titelPartOne}: ${titel} (${diceCount} ${diceDesc})`,
				content: `<p>${inputDesc}: <input type="number" id="anzahlDerWuerfel" value = "0"></p>`,
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
						label: 'Abbrechen',
						callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.NoAutoDefenseCancel")) },
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok"
			}).render(true);

		function myCallback(html)
		{
			const input = html.find('#anzahlDerWuerfel').val();
			let anzahl = input ? parseInt(input) : 0;
			const modToolTip = anzahl == 0 ? "" : game.i18n.format("SPACE1889.ChatModifier", { mod: SPACE1889Helper.getSignedStringFromNumber(anzahl) });
			if (modifierToolTipInfo.length == 0)
				modifierToolTipInfo = modToolTip;
			else
				modifierToolTipInfo += "\n" + modToolTip;
			anzahl += diceCount;
			SPACE1889RollHelper.rollDefenseAndAddDamageSub(data, anzahl, modifierToolTipInfo);
		}
	}

	static doParalysisChatMessage(actor, attackerName, virtualDamage, comparativeAttributeValue)
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
			SPACE1889Helper.addEffects(actor, effects);
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
}