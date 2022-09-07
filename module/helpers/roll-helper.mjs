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

	static rollItem(itemData, actor, event)
	{
		if (itemData == undefined)
			return;

		const evaluation = this.getEventEvaluation(event);
		const dieCount = this.getDieCount(itemData, actor);
		if (evaluation.showInfoOnly)
			return this.rollItemInfo(itemData, actor, evaluation.whisperInfo);

		if (itemData.type == 'talent')
			return this.rollSpecialTalent(itemData, actor, dieCount, evaluation.showDialog)
		return this.rollSpecial(itemData, actor, dieCount, evaluation.showDialog);
	}

	static getDieCount(itemData, actor)
	{
		if (itemData.type == 'skill')
			return itemData.data.rating;
		if (itemData.type == 'specialization')
			return itemData.data.rating;
		if (itemData.type == 'weapon')
			return itemData.data.attack;
		if (itemData.type == 'talent' && itemData.data.isRollable)
			return this.getTalentDieCount(itemData, actor);

		return 0;
	}

	static getTalentDieCount(itemData, actor)
	{
		if (itemData.type == "talent" && itemData.data.isRollable)
		{
			if (itemData.data.id == "geschaerfterSinn")
				return Math.max(actor.data.data.secondaries.perception.total + Number(itemData.data.bonus), 0);
			else if (itemData.data.id == "paralysierenderSchlag")
			{
				const skillItem = actor.items.find(e => e.data.data.id == "waffenlos");
				if (skillItem != undefined)
					return Math.max(0, skillItem.data.data.rating + ((itemData.data.level.value - 1) * 2));
			}
			else if (itemData.data.id == "assassine")
			{
				const skillItem = actor.items.find(e => e.data.data.id == "heimlichkeit");
				if (skillItem != undefined)
				{
					return Math.max(0, skillItem.data.data.rating + ((itemData.data.level.value - 1) * 2));
				}
			}
			else if (itemData.data.id == "eigenartigerKampfstil")
			{
				const defense = actor.data.data.secondaries.defense.total;
				return (defense + (Number(itemData.data.level.value) * 2));
			}
			return 0;
		}
	}

	/**
	 *
	 * @param {object} itemData
	 * @param {object} actor
	 * @param {number} dieCount
	 * @param {boolean} showDialog
	*/
	static rollSpecial(itemData, actor, dieCount, showDialog)
	{

		if (itemData.type == "weapon" || itemData.type == "skill" || itemData.type == "specialization")
		{
			let attackString = "";
			if (itemData.type == "weapon")
			{
				if (actor.data.type == "vehicle")
					attackString = itemData.data.vehicleInfo + '<br>'; 

				if (game.user.targets.size > 0)
					attackString += game.i18n.format("SPACE1889.AttackOn", { targetName: game.user.targets.first().name });
				else
					attackString += game.i18n.localize("SPACE1889.Attack") ?? "Attack";
			}

			const info = attackString != "" ? attackString : game.i18n.localize("SPACE1889.Probe") ?? "Probe";
			this.rollSubSpecial(itemData, actor, dieCount, showDialog, info);
		}
	}

	/**
	* 
	* @param {object} itemData
	* @param {object} actor
	* @param {number} dieCount 
	* @param {boolean} showDialog 
	*/
	static rollSpecialTalent(itemData, actor, dieCount, showDialog)
	{
		if (itemData.type == "talent")
		{
			let info = "";
			if (itemData.data.id == "geschaerfterSinn")
				info = game.i18n.localize("SPACE1889.Probe") ?? "Probe";
			else if (itemData.data.id == "eigenartigerKampfstil")
				info = game.i18n.localize("SPACE1889.SecondaryAttributeDef");
			else if (game.user.targets.size > 0)
				info = game.i18n.format("SPACE1889.AttackOn", { targetName: game.user.targets.first().name });
			else
				info = game.i18n.localize("SPACE1889.Attack") ?? "Attack";

			this.rollSubSpecial(itemData, actor, dieCount, showDialog, info, true);
		}
	}

	/**
	 *
	 * @param {object} itemData
	 * @param {object} actor
	 * @param {number} dieCount
	 * @param {boolean} showDialog
	 * @param {string} titelInfo
	*/
	static rollSubSpecial(itemData, actor, dieCount, showDialog, titelInfo, withExtraInfo = false)
	{
		const extraInfo = withExtraInfo ? game.i18n.localize(itemData.data.infoLangId) : "";
		const titelPartOne = game.i18n.localize("SPACE1889.ModifiedRoll");
		const inputDesc = game.i18n.localize("SPACE1889.NumberOfModificationDice");
		const diceDesc = game.i18n.localize("SPACE1889.ConfigDice");

		let info = titelInfo + ":";
		if (showDialog)
		{
			let dialogue = new Dialog(
				{
					title: `${titelPartOne}: ${itemData.data.label} (${dieCount} ${diceDesc})`,
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
			const von = game.i18n.localize("SPACE1889.Of");
			const dieType = game.settings.get("space1889", "dice");
			let messageContent = `<div><h2>${itemData.data.label}</h2></div>`;
			if (withExtraInfo)
				messageContent += `${extraInfo} <br>`;
			messageContent += `${info} <b>[[${wurfelAnzahl}${dieType}]] ${von}  ${wurfelAnzahl}</b> <br>`;
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
	 * @param {object} item itemData
	 * @param {object} actor
	 * @param {boolean} whisper
	 */
	static rollItemInfo(item, actor, whisper)
	{
		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: actor });
		const rollMode = game.settings.get('core', 'rollMode');
		let label = `[${item.type}] ${item.name}`;
		let desc = item.data.description;
		if (item.type == "skill")
		{
			const fertigkeit = game.i18n.localize("SPACE1889.Skill") ?? item.type;
			desc = game.i18n.localize(item.data.descriptionLangId);
			if (desc == item.data.descriptionLangId && item.data.description != "")
				desc = item.data.description;
			if (item.data.isSkillGroup)
			{
				const skillGroup = game.i18n.localize("SPACE1889.SkillGroup");
				const gruppe = game.i18n.localize(CONFIG.SPACE1889.skillGroups[item.data.skillGroupName]);
				label = `<h2><strong>${gruppe}</strong></h2> <h3>[${skillGroup}]</h3>`;
			}
			else
				label = `<h2><strong>${item.data.label}</strong> [${fertigkeit}]</h2>`;
		}
		else if (item.type == "specialization")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			const skillName = game.i18n.localize(item.data.nameLangId = 'SPACE1889.Skill' + item.data.underlyingSkillId.replace(/^(.)/, function (b) { return b.toUpperCase(); }));
			const specialization = game.i18n.localize("SPACE1889.Specialization") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong></h2> <h3>[${skillName} ${specialization}]</h3>`;
		}
		else if (item.type == "talent")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			if (desc == item.data.descriptionLangId && item.data.description != "")
				desc = item.data.description;
			const talent = game.i18n.localize("SPACE1889.Talent") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${talent}]</h2>`;
		}
		else if (item.type == "weakness")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			if (desc == item.data.descriptionLangId && item.data.description != "")
				desc = item.data.description;
			const weakness = game.i18n.localize("SPACE1889.Weakness") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${weakness}]</h2>`;
		}
		else if (item.type == "resource")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			const weakness = game.i18n.localize("SPACE1889.Resource") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${weakness}]</h2>`;
		}
		else if (item.type == "weapon")
		{
			desc = "";
			const weapon = game.i18n.localize("SPACE1889.Weapon") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${weapon}]</h2>`;
			if (item.data.specializationId != "none")
				desc += game.i18n.localize("SPACE1889.CombatSpecialization") + ": " + game.i18n.localize(CONFIG.SPACE1889.combatSpecializations[item.data.specializationId]) + "<br>";
			desc +=  game.i18n.localize("SPACE1889.Damage") + ": " + item.data.damage.toString() + " " + item.data.damageTypeDisplay;
			if (item.data.range != "")
			{
				desc += "<br>" + game.i18n.localize("SPACE1889.Range") + ": " + item.data.range;
				desc += "<br>" + game.i18n.localize("SPACE1889.Capacity") + ": " + item.data.capacity + " " + game.i18n.localize(CONFIG.SPACE1889.weaponCapacityTypes[item.data.capacityType] + "Abbr");
			}

			desc += "<br>" + game.i18n.localize("SPACE1889.Weight") + ": " + item.data.weight.toString() + "kg";
			desc += "<br>" + game.i18n.localize("SPACE1889.Price") + ": " + item.data.price;

			if (item.data.location == "mounted")
			{
				desc += "<br>" + game.i18n.localize("SPACE1889.SecondaryAttributeSiz") + ": " + item.data.size;
				const mountPos = game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[item.data.vehicle.spot]);
				desc += "<br>" + game.i18n.localize("SPACE1889.WeaponGunPosition") + ": " + mountPos;

				if (item.data.vehicle.isSwivelMounted)
					desc += "<br>" + game.i18n.localize("SPACE1889.WeaponSwivelingRange") + ": " + item.data.vehicle.swivelingRange + "&deg;";
				else
					desc += "<br>" + game.i18n.localize("SPACE1889.WeaponIsRigidlyMounted");
			}


			if (item.data.description != "")
				desc += "<br>" + game.i18n.localize("SPACE1889.Description") + ": " + jQuery(item.data.description).text();
			console.log(item.data.description);
		}
		else if (item.type == "armor")
		{
			const armor = game.i18n.localize("SPACE1889.Armor") ?? item.type;
			label = `[${armor}] ${item.data.label}`;
			desc = game.i18n.localize(item.data.descriptionLangId);
			if (desc == item.data.descriptionLangId && item.data.description != "")
				desc = item.data.description;
			else if (item.data.description != "")
				desc += "<br>" + item.data.description;
		}
		else if (item.type == "language")
		{
			const language = game.i18n.localize("SPACE1889.Language") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${language}]</h2>`;
			desc = game.i18n.localize("SPACE1889.LanguageOrigin") + ": " + item.data.origin + "<br>"
				+ game.i18n.localize("SPACE1889.FamilyOfLanguages") + ": " + item.data.family;
			if (item.data.isDialectSourceId != "no")
				desc += "<br>" + game.i18n.localize("SPACE1889.IsDialectFrom") + " " + item.data.dialect;
			if (item.data.old)
				desc += "<br>" + item.data.oldInfo;
		}
		else if (item.type == "currency")
		{
			const currency = game.i18n.localize("ITEM.TypeCurrency") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${currency}]</h2>`;
			desc = "";
			if (item.data.type != "money")
			{
				const typeId = CONFIG.SPACE1889.moneyTypes[item.data.type];
				if (typeId != undefined)
				{
					const typename = game.i18n.localize(typeId);
					if (typename != "" && typename != typeId)
						desc = "<small>" + typename + "</small><br>";
				}
			}

			desc += item.data.quantity.toString() + " " + item.data.abbr + " ~ " + item.data.exchangeValue + "<br>";
			desc += game.i18n.localize("SPACE1889.ExchangeRate") + ": ";
			desc += "1 " + game.i18n.localize("SPACE1889.CurrencyBritishPoundsAbbr") + " = " + item.data.exchangeRateForOnePound.toString() + " " + item.data.abbr;
		}
		else
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			if (desc == item.data.descriptionLangId)
			{
				if (item.data.description != "")
					desc = item.data.description;
				else
					desc = game.i18n.format("SPACE1889.NoLanguageEntry", { langId: item.data.descriptionLangId });
			}
			else if (item.data.description != "")
				desc += "<br>" + item.data.description;

			const type = game.i18n.localize("SPACE1889.Item") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${type}]</h2>`;
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
		let actorData = actor.data;

		optionen += '<option value="lethal"' + (isLethal ? ' selected="selected">' : '>') + game.i18n.localize("SPACE1889.Lethal") + '</option>';
		optionen += '<option value="nonLethal"' + (!isLethal ? ' selected="selected">' : '>') + game.i18n.localize("SPACE1889.NonLethal") + '</option>';
		if (actorData.type == "vehicle")
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
			title: `${actorData.name} : ${damageLabel}`,
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
				if (selectedOption && actorData.items.get(item.data._id) != undefined)
				{
					let useInputName = actorData.type != "creature";
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

					actor.updateEmbeddedDocuments("Item", [{ _id: item.data._id, "data.damageType": selectedOption, "name": userInputName, "img": path, "data.damage": damageAmountInt }]);
					SPACE1889RollHelper.doDamageChatMessage(actor, item.data._id, damageAmountInt, selectedOption, (useInputName ? userInputName : ""));
				}
				else if (actorData.items.get(item.data._id) != undefined)
				{
					actor.deleteEmbeddedDocuments("Item", [item.data._id]);
					ui.notifications.info(game.i18n.format("SPACE1889.ChatInfoUndoDamage", { name: actorData.name }));
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
		const isCharakter = actor.data.type == "character";
		const isVehicle = actor.data.type == "vehicle";
		let stun = isVehicle ? 1000 : actor.data.data.secondaries.stun.total;
		let str = isVehicle ? 1000 : actor.data.data.abilities.str.total;
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
		if (recoil > 0)
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Recoil") + ":</b> " + recoil.toString() + "m<br>";
		if (liegend)
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Knockdown") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoKnockdown", { actorName: actor.data.name }) + "<br>";
		if (unconsciousStrike > 0)
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Unconscious") + ":</b> " + game.i18n.format("SPACE1889.ChatInfoDuration", { count: unconsciousStrike.toString() }) + "<br>";
		else if (stunned)
			trefferInfo += "<b>" + game.i18n.localize("SPACE1889.Stunned") + ":</b> " + game.i18n.localize("SPACE1889.ChatInfoStunned") + "<br>";

		let damageTuple = SPACE1889Helper.getDamageTuple(actor.data, itemId);
		if (dmgType == "lethal")
			damageTuple.lethal += dmg;
		else
			damageTuple.nonLethal += dmg;

		const maxHealth = actor.data.data.health.max;
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
			gesamtInfo += "<b>" + game.i18n.localize("SPACE1889.Vanquished") + "!</b>";

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

		for (let item of actor.data.weapons)
		{
			if (item.data.location == 'lager')
				continue;

			const info = item.name + " " + item.data.damage.toString() + game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[item.data.damageType]) +
				' (' + game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[item.data.vehicle.spot]) + ')';
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
		const actorData = actor.data.data;

		const manoeuvreAndName = game.i18n.localize("SPACE1889.VehicleManoeuvre") + ": " + game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvres[key]);
		const modifierText = game.i18n.localize("SPACE1889.Modifier");
		const modifierLabel = modifierText + " (" + game.i18n.localize("SPACE1889.EnvironmentModifier") + ", " + game.i18n.localize("SPACE1889.SpaceDisadvantage") + ", " + game.i18n.localize("SPACE1889.etc") + ")";

		const labelSkill = game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvresToSkill[key]);
		let skillWithSpezAndValue = labelSkill;

		const isTotalDefense = key == "totalDefense"
		const isDefense = key == "defense" || isTotalDefense;

		if (isDefense && actorData.health.value > 0 && actorData.positions.pilot.staffed)
			skillWithSpezAndValue += " + " + game.i18n.localize("SPACE1889.VehiclePassiveDefense") + " + " + game.i18n.localize("SPACE1889.VehicleManeuverability");
		else if (isDefense)
		{
			skillWithSpezAndValue = game.i18n.localize("SPACE1889.VehiclePassiveDefense") + " + " + game.i18n.localize("SPACE1889.VehicleNegativeStructure");
		}
		skillWithSpezAndValue += isTotalDefense ? " + 4" : "";

		const posKey = CONFIG.SPACE1889.vehicleManoeuvresToPosition[key];
		const isManeuverabilitySkill = posKey == "pilot" && !isDefense;
		let maneuverability = 0;

		if (isManeuverabilitySkill)
		{
			const disabled = game.i18n.localize("SPACE1889.VehicleManeuverabilityDisabledAbbr");
			if (actorData.maneuverability.value == disabled)
			{
				ui.notifications.info(game.i18n.format("SPACE1889.VehicleManoeuvreNotPossible", { name: actor.data.name, manoeuvreName: game.i18n.localize(CONFIG.SPACE1889.vehicleManoeuvres[key]) }));
				return; 
			}
			maneuverability = Number(actorData.maneuverability.value);
		}

		if (posKey == "gunner" && actorData.weaponLoad.isOverloaded)
		{
			let text = game.i18n.format("SPACE1889.VehicleExceedingOverloadMax", { name: actor.data.name });
			text += "<br>" + game.i18n.format("SPACE1889.VehicleExceedingOverloadMaxInfo", { max: actorData.weaponLoad.maxWithOverload, current: actorData.weaponLoad.value });
			ui.notifications.info(text);
			return;
		}
		else if (posKey == "gunner" && !actorData.positions.gunner.staffed)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.VehicleNoGunner"));
			return;
		}

		const skillValueBase = actorData.positions[posKey]?.total + (actorData.health.value < 0 ? actorData.health.value : 0);
		let skillValue = skillValueBase;

		if (isDefense)
			skillValue = actorData.secondaries.defense.total + (isTotalDefense ? 4 : 0);

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
				let isTemplatePosition = actorData.positions[positionKey] != undefined;
				let canDo = isTemplatePosition ? actorData.positions[positionKey].staffed && actorData.positions[positionKey].total >= 4 : true;
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

		let actorInfo = "[" + labelSkill + " " + actor.data.data.positions[posKey]?.actorName + "]";
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
				const weaponItem = actor.data.weapons.find(e => e._id == id);
				if (weaponItem != undefined)
				{
					const gunner = game.actors.get(actor.data.data.positions.gunner.actorId);
					const spezialisation = gunner?.data.speciSkills.find(j => j.data.id == weaponItem.data.specializationId);
					
					if (spezialisation != undefined)
					{
						const spezName = game.i18n.localize(spezialisation.data.nameLangId);
						const spezLevel = spezialisation.data.level;
						skillValue = skillValueBase + spezLevel;
						skillWithSpezAndValue = labelSkill + " (" + spezName + "): " + skillValue.toString();
						actorInfo = "[" + spezName + " " + actor.data.data.positions[posKey]?.actorName + "]";
					}
					else
					{
						skillValue = skillValueBase;
						skillWithSpezAndValue = labelSkill + ": " + skillValue.toString();
						actorInfo = "[" + labelSkill + " " + actor.data.data.positions[posKey]?.actorName + "]";
					}

					weaponDamage = weaponItem.data.damage;
					diceInfo = weaponItem.name + ' (' + game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[weaponItem.data.vehicle.spot]) + ')<br>';
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
							const grund = manoeuvreAndName;

							let messageContent = `<div><h2>${grund}</h2></div>`;
							messageContent += `<p>${diceInfo}</p>`;
							messageContent += `<b>[[${anzahl}${dieType}]] von ${anzahl}</b> <br>`;
							let chatData =
							{
								user: game.user.id,
								speaker: ChatMessage.getSpeaker({ actor: this.actor }),
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