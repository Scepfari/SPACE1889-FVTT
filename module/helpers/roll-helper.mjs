import SPACE1889Helper from "../helpers/helper.mjs";

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

	static rollItem(item, actor, event)
	{
		if (item == undefined)
			return;

		const evaluation = this.getEventEvaluation(event);
		const dieCount = this.getDieCount(item, actor);
		if (evaluation.showInfoOnly)
			return this.rollItemInfo(item, actor, evaluation.whisperInfo);

		if (item.type == 'talent')
			return this.rollSpecialTalent(item, actor, dieCount, evaluation.showDialog)
		return this.rollSpecial(item, actor, dieCount, evaluation.showDialog);
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
					return Math.max(0, skillItem.system.rating + ((item.system.level.value - 1) * 2));
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

	/**
	 *
	 * @param {object} item
	 * @param {object} actor
	 * @param {number} dieCount
	 * @param {boolean} showDialog
	 * @param {string} titelInfo
	*/
	static rollSubSpecial(item, actor, dieCount, showDialog, titelInfo, withExtraInfo = false)
	{
		const extraInfo = withExtraInfo ? game.i18n.localize(item.system.infoLangId) : "";
		const titelPartOne = game.i18n.localize("SPACE1889.ModifiedRoll");
		const inputDesc = game.i18n.localize("SPACE1889.NumberOfModificationDice");
		const diceDesc = game.i18n.localize("SPACE1889.ConfigDice");

		let info = titelInfo + ":";
		if (showDialog)
		{
			let dialogue = new Dialog(
				{
					title: `${titelPartOne}: ${item.system.label} (${dieCount} ${diceDesc})`,
					content: `<p>${inputDesc}: <input type="number" id="anzahlDerWuerfel" value = "0"></p>`,
					buttons:
					{
						ok:
						{
							icon: '',
							label: 'Los!',
							callback: (html) => myCallback(html)
						},
						abbruch:
						{
							label: 'Abbrechen',
							callback: () => { ui.notifications.info("Auch gut, dann wird nicht gewürfelt...") },
							icon: `<i class="fas fa-times"></i>`
						}
					},
					default: "ok"
				}).render(true);

			function myCallback(html)
			{
				const input = html.find('#anzahlDerWuerfel').val();
				let anzahl = input ? parseInt(input) : 0;
				anzahl += dieCount;
				ChatMessage.create(getChatData(anzahl), {});
			}
		}
		else
		{
			ChatMessage.create(getChatData(dieCount), {});
		}

		function getChatData(wurfelAnzahl)
		{
			const anzahl = Math.max(0, wurfelAnzahl);
			const von = game.i18n.localize("SPACE1889.Of");
			const dieType = game.settings.get("space1889", "dice");
			let messageContent = `<div><h2>${item.system.label}</h2></div>`;
			if (withExtraInfo)
				messageContent += `${extraInfo} <br>`;
			messageContent += `${info} <b>[[${anzahl}${dieType}]] ${von}  ${wurfelAnzahl}</b> <br>`;
			let chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: actor }),
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
			console.log(item.system.description);
		}
		else if (item.type == "armor")
		{
			const armor = game.i18n.localize("SPACE1889.Armor") ?? item.type;
			label = `[${armor}] ${item.system.label}`;
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
		else
		{
			desc = game.i18n.localize(item.system.descriptionLangId);
			if (desc == item.system.descriptionLangId)
			{
				if (item.system.description != "")
					desc = item.system.description;
				else
					desc = game.i18n.format("SPACE1889.NoLanguageEntry", { langId: item.system.descriptionLangId });
			}
			else if (item.system.description != "")
				desc += "<br>" + item.system.description;

			const type = game.i18n.localize("SPACE1889.Item") ?? item.type;
			label = `<h2><strong>${item.system.label}</strong> [${type}]</h2>`;
		}

		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
			flavor: label,
			whisper: whisper ? [game.user.id] : [],
			content: desc ?? ''
		});
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
		let damageType = game.i18n.localize("SPACE1889.DamageType");
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

					actor.updateEmbeddedDocuments("Item", [{ _id: item._id, "system.damageType": selectedOption, "name": userInputName, "img": path, "system.damage": damageAmountInt }]);
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
		let effectNames = [];
		if (recoil > 0)
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Recoil") + ":</b> " + recoil.toString() + "m<br>";
		if (liegend)
		{
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Knockdown") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoKnockdown", { actorName: actor.name }) + "<br>";
			effectNames.push("prone");
		}
		if (unconsciousStrike > 0)
		{
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Unconscious") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoDuration", { count: unconsciousStrike.toString() }) + "<br>";
			effectNames.push("unconscious");
		}
		else if (stunned)
		{
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Stunned") + ":</b> " + game.i18n.localize("SPACE1889.ChatInfoStunned") + "<br>";
			effectNames.push("stun");
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
		let unconscious = damageTuple.nonLethal > 0 && nonLethalValue < incapacitateThreshold && lethalValue > deathThreshold;
		let gesamtInfo = "";

		if (isCharakter)
		{
			if (lethalValue == incapacitateThreshold)
			{
				gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Incapacitate") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoIncapacitate", { damageTypeAbbr: game.i18n.localize("SPACE1889.LethalAbbr") }) + "<br>";
			}
			if (lethalValue < 0 && lethalValue > deathThreshold)
			{
				gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.DangerOfDeath") + ":</b> ";
				if (autoStabilize)
					gesamtInfo += game.i18n.localize("SPACE1889.ChatInfoDangerOfDeathAutoSuccess") + "<br>";
				else
					gesamtInfo += game.i18n.localize("SPACE1889.ChatInfoDangerOfDeath") + "<br>";
				if (lethalValue < incapacitateThreshold)
					unconscious = true;
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
				effectNames.push("dead");
			}
			if (damageTuple.nonLethal > 0)
			{
				if (nonLethalValue == incapacitateThreshold)
				{
					gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Exhausted") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoIncapacitate", { damageTypeAbbr: game.i18n.localize("SPACE1889.NonLethalAbbr") }) + "<br>";
				}
			}
		}
		else if (newHealth <= 0)
		{
			gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Vanquished") + "!</b>";
			effectNames.push("dead");
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
		if (effectNames.length > 0)
			SPACE1889Helper.addEffects(actor, effectNames);
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
						label: 'Los!',
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
}