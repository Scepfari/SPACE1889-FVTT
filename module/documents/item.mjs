import SPACE1889RollHelper from "../helpers/roll-helper.js";
import SPACE1889Helper from "../helpers/helper.js";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Space1889Item extends Item {
	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	prepareData() {
		// As with the actor class, items are documents that can have their data
		// preparation methods overridden (such as prepareBaseData()).
		super.prepareData();
		this.checkAndSetId();
	}

	checkAndSetId() 
	{
		try 
		{
			const item = this;
			if (item.name.length > 0 && item.system.id == "")
				item.system.id = this.createId(item.name);
			
			if (item.type == "skill" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Skill", true);
				this.setFightingSkill(item);
			}
			else if (item.type == "specialization" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "SpeciSkill", true);
			}
			else if (item.type == "talent")
			{
				if (item.system.id !== "")
				{
					this.setLangIdAndLabel(item, "Talent", true, true);
				}

				if (item.system.bonusTarget != "")
				{
					const base = item.system.bonusTargetType != "" ? item.system.bonusTargetType.replace(/^(.)/, function (c) { return c.toUpperCase(); }) : "Skill";
					item.system.bonusTargetLangId = 'SPACE1889.' + base + item.system.bonusTarget.replace(/^(.)/, function (b) { return b.toUpperCase(); });
					if (this.ShowTalentDetail(item))
					{
						item.system.showDetail = true;
						const bonusTarget = game.i18n.localize(item.system.bonusTargetLangId);
						if (bonusTarget != item.system.bonusTargetLangId)
							item.system.label += " (" + bonusTarget + ")";
					}
				}

				if (this.IsTalentRollable(item))
					item.system.isRollable = true;

			}
			else if (item.type == "weakness" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Weakness", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/paralysis.svg";
			}
			else if (item.type == "resource" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Resource", true, true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/card-joker.svg";
			}
			else if (item.type == "weapon" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Weapon", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/sword.svg";
			}
			else if (item.type == "ammunition" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Ammunition", true);
			}
			else if (item.type == "armor" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Armor", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/shield.svg";
			}
			else if (item.type == "item")
			{
				this.setLangIdAndLabel(item, "Item", true);
			}
			else if (item.type == "language" && item.system.id !== "")
			{
				this.setLangIdAndLabel(item, "Language", false);
				item.system.origin = game.i18n.localize(CONFIG.SPACE1889.languageOrigins[item.system.originId]);
				item.system.family = game.i18n.localize(CONFIG.SPACE1889.familyOflanguages[item.system.familyId]);
				item.system.dialect = game.i18n.localize(CONFIG.SPACE1889.languages[item.system.isDialectSourceId]);
				item.system.oldInfo = item.system.old ? game.i18n.localize('SPACE1889.OldLanguageInfo') : "";
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/sound.svg";
			}
			else if (item.type == "currency")
			{
				this.setLangIdAndLabel(item, "Currency", false, false);
				const abbrLangId = item.system.nameLangId + "Abbr";
				item.system.abbr = game.i18n.localize(abbrLangId);
				if (item.system.abbr == "" || item.system.abbr == abbrLangId)
					item.system.abbr = item.system.label;
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/coins.svg";

				item.system.exchangeValue = SPACE1889Helper.getExchangeValue(item);
			}
			else if (item.type == "container")
			{
				this.setLangIdAndLabel(item, "Item", true);
			}

			if (item.type == "weapon" )
			{
				item.system.effectDuration = SPACE1889Helper.formatTime(SPACE1889Helper.getCombatTurnsInSeconds(item.system.effectDurationCombatTurns));
			}
		}
		catch (error) 
		{
			console.error(error);
		}
	}

	/**
	 * 
	 * @param {object} item
	 * @returns {boolean}
	 */
	IsTalentRollable(item)
	{
		if (item.system.id == "geschaerfterSinn"
			|| item.system.id == "paralysierenderSchlag"
			|| item.system.id == "assassine"
			|| item.system.id == "eigenartigerKampfstil")
		{
			return true;
		}
		return false;
	}

	isAttackTalent()
	{
		if (this.type == "talent" &&
			(this.system.id == "paralysierenderSchlag" || this.system.id == "assassine" ))
			return true;

		return false;
	}

	getDefenceTypeAgainstThisTalant()
	{
		const noType = "";
		if (this.type != "talent")
			return noType;

		if (this.system.id == "assassine")
			return "onlyPassive";

		if (this.system.id == "paralysierenderSchlag")
			return "onlyActiveParalyse";
		return noType;
	}

	/**
	 *
	 * @param {object} item
	 * @returns {boolean}
	 */
	ShowTalentDetail(item)
	{
		if (item.system.id == "geschaerfterSinn"
			|| item.system.id == "begabung"
			|| item.system.id == "eigenartigerKampfstil")
		{
			return true;
		}
		return false;
	}

	/**
	 *
	 * @param {object} item
	 * @param {string} base
	 * @param {boolean} setDescription
	 * @param {boolean} setInfo
	 */
	setLangIdAndLabel(item, base, setDescription, setInfo = false)
	{
		if (item == undefined || item.system.id == undefined || item.system.id == "")
			return;

		const upperCaseId = item.system.id.replace(/^(.)/, function(b){return b.toUpperCase();});
		item.system.nameLangId = 'SPACE1889.' + base + upperCaseId;
		if (setDescription)
		{
			if (item.type == "skill" && item.system.isSkillGroup && item.system.skillGroupName.length > 0)
				item.system.descriptionLangId = CONFIG.SPACE1889.skillGroupDescriptions[item.system.skillGroupName];
			else
				item.system.descriptionLangId = 'SPACE1889.' + base + 'Desc' + upperCaseId;
		}
		if (setInfo)
		{
			item.system.infoLangId = 'SPACE1889.' + base + 'Info' + upperCaseId;
			if (base == "Talent")
			{
				const toolTip = game.i18n.localize(item.system.infoLangId);
				item.system.toolTip = item.system.info != "" && toolTip == item.system.infoLangId ? item.system.info : toolTip;
			}
		}

		item.system.label = game.i18n.localize(item.system.nameLangId) ?? item.name;
		if (item.system.label == item.system.nameLangId)
			item.system.label = item.name;

		if (item.system.unlockIdForUser == undefined)
			item.system.unlockIdForUser = false;
	}


	createId(str)
	{
		if (str == null || str == undefined)
			return "";

		return this.replaceUmlaute(str.toLowerCase())
			.replace(/\(/g, '')
			.replace(/\)/g, '')
			.replace(/\s(.)/g, function(a) {
				return a.toUpperCase();
			})
			.replace(/\s+/g, '')
			.replace(/\.+/g,'')
			.replace(/-/g, '')
			.replace(/\,+/g, '')
			.replace(/["']/g, '');			;
	}

	replaceUmlaute(str) 
	{
		return str.replace(/([\u00fc|\u00e4|\u00f6|\u00df])/g, function(a){
			return CONFIG.SPACE1889.umlautMap[a];
		});
	};


	_getItemId(ev) {
		return $(ev.currentTarget).parents(".item").attr("data-item-id")
	}


	setFightingSkill(item)
	{
		let fightingSkills = ["geschuetze", "nahkampf", "primitiverFernkampf", "schusswaffen", "sprengstoffe", "Waffenlos"];
		item.system.isFightingSkill = fightingSkills.includes(item.system.id);
	}

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	 getRollData() {
		// If present, return the actor's roll data.
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = foundry.utils.deepClone(this.system);

		return rollData;
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll(event) {
		const item = this;

		if (!this.system.formula)
		{
			SPACE1889RollHelper.rollItemInfo(item, this.actor, !event?.shiftKey && !event?.ctrlKey);
			return;
		}


		if (this.system.formula)
		{
			// Initialize chat data.
			const speaker = ChatMessage.getSpeaker({ actor: this.actor });
			const rollMode = game.settings.get('core', 'rollMode');
			let label = `[${item.type}] ${item.name}`;
			let desc = item.system.description;
			// Retrieve roll data.
			const rollData = this.getRollData();

			// Invoke the roll and submit it to chat.
			const roll = new Roll(rollData.item.formula, rollData);
			// If you need to store the value first, uncomment the next line.
			// let result = await roll.roll({async: true});
			roll.toMessage({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
			});
			return roll;
		}
	}

	/**
	 * 
	 * @param {number} dieCount 
	 * @param {boolean} showDialog 
	*/
	async rollSpecial(dieCount, showDialog) 
	{
		SPACE1889RollHelper.rollItem(this, this.actor, dieCount, showDialog);
	}

	/**
	* 
	* @param {number} dieCount 
	* @param {boolean} showDialog 
	*/
	async rollSpecialTalent(dieCount, showDialog) 
	{
		SPACE1889RollHelper.rollItem(this, this.actor, dieCount, showDialog);
	}

	getInfoText(forChat)
	{
		try
		{
			const type = this._getTypeText();

			if (this.type === "skill" || this.type === "specialization" || this.type === "weakness")
			{
				let desc = game.i18n.localize(this.system.descriptionLangId);
				if (desc === this.system.descriptionLangId && this.system.description !== "")
					desc = this.system.description;

				const fullDesc = this._ComposeHtmlTextInfo("", this.name, type, desc, forChat);
				return fullDesc;
			}

			if (this.type === "talent")
			{
				let desc = game.i18n.localize(this.system.descriptionLangId);
				if (desc === this.system.descriptionLangId && this.system.description !== "")
					desc = this.system.description;

				let secondHeader = "";
				if (this.system.showDetail)
					secondHeader = game.i18n.localize(this.system.bonusTargetLangId);

				const fullDesc = this._ComposeHtmlTextInfo2("", this.name, secondHeader, type, desc, forChat);
				return fullDesc;
			}

			if (this.type === "resource")
			{
				let desc = "<p>" + this._addLine("SPACE1889.Level", this.system.level.value, "", false);
				if (this.system.noEp)
					desc += `<br>${game.i18n.localize("SPACE1889.IsCampaingnEffect")}`;

				desc += "</p>";
				if (this.system.description !== "")
					desc += this.system.description;

				const idDesc = game.i18n.localize(this.system.descriptionLangId);
				if (idDesc !== this.system.descriptionLangId)
					desc += idDesc;

				const fullDesc = this._ComposeHtmlTextInfo("", this.system.label, type, desc, forChat);
				return fullDesc;
			}

			if (this.type === "item" || this.type === "container" || this.type === "armor")
			{
				let desc = game.i18n.localize(this.system.descriptionLangId);
				if (desc === this.system.descriptionLangId)
					desc = "";
				if (this.system.description !== "")
					desc += (desc === "" ? "" : "<br>") + this.system.description;

				const image = this._getImageIfNotDefault(forChat);
				const fullDesc = this._ComposeHtmlTextInfo(image, this.name, type, desc, forChat);
				return fullDesc;
			}

			if (this.type === "weapon")
			{
				return this._getWeaponInfoText(type, forChat);
			}
			if (this.type === "ammunition")
			{
				let desc = this._addLineFromToIds("SPACE1889.DamageType", CONFIG.SPACE1889.damageTypes[this.system.damageType], false);

				desc += this._addLineFromToIds("SPACE1889.AmmunitionType", CONFIG.SPACE1889.weaponAmmunitionTypes[this.system.type]);

				if (this.system.caliber !== "")
					desc += this._addLine("SPACE1889.Caliber", this.system.caliber);

				if (this.system.capacityType != "default")
				{
					desc += this._addLineFromToIds("SPACE1889.CapacityTypeLong", CONFIG.SPACE1889.ammunitionCapacityTypes[this.system.capacityType]);
					desc += this._addLine("SPACE1889.Capacity", this.system.capacity.toString());
				}

				if (this.system.damageModifikator !== 0)
					desc += this._addLine("SPACE1889.AmmunitionDamageModifier", this.system.damageModifikator);
				if (this.system.rangeModFactor !== 1)
					desc += this._addLine("SPACE1889.AmmunitionRangeModifierFactor", this.system.rangeModFactor);
				if (this.system.description !== "")
					desc += this.system.description;

				const image = this._getImageIfNotDefault(forChat);
				const fullDesc = this._ComposeHtmlTextInfo(image, this.name, type, desc, forChat);
				return fullDesc;
			}
			if (this.type === "language")
			{
				let desc = this._addLine("SPACE1889.LanguageOrigin", this.system.origin, "", false);
				desc += this._addLine("SPACE1889.FamilyOfLanguages", this.system.family);
				if (this.system.isDialectSourceId !== "no")
					desc += this._addLine("SPACE1889.IsDialectFrom", this.system.dialect);
				if (this.system.old)
					desc += "<br>" + this.system.oldInfo;

				const fullDesc = this._ComposeHtmlTextInfo("", this.system.label, type, desc, forChat);
				return fullDesc;
			}
			if (this.type === "currency")
			{
				let desc = "";
				if (this.system.type !== "money")
				{
					const typeId = CONFIG.SPACE1889.moneyTypes[this.system.type];
					if (typeId != undefined)
					{
						const typename = game.i18n.localize(typeId);
						if (typename !== "" && typename !== typeId)
							desc = "<small>" + typename + "</small><br>";
					}
				}

				desc += this.system.quantity.toString() + " " + this.system.abbr + " ~ " + this.system.exchangeValue + "<br>";
				desc += game.i18n.localize("SPACE1889.ExchangeRate") + ": ";
				desc += "1 " + game.i18n.localize("SPACE1889.CurrencyBritishPoundsAbbr") + " = " + this.system.exchangeRateForOnePound.toString() + " " + this.system.abbr;

				const fullDesc = this._ComposeHtmlTextInfo("", this.system.label, type, desc, forChat);
				return fullDesc;
			}

			// fall back for all other types
			const image = this._getImageIfNotDefault(forChat);
			const fullDesc = this._ComposeHtmlTextInfo(image, this.name, type, this.system.description, forChat);
			return fullDesc;
		}
		catch (e)
		{
			return game.i18n.format("SPACE1889.ErrorInFunction", {name : "getInfoText"});
		}
	}

	_getWeaponInfoText(type, forChat = false)
	{
		const item = this;
		const hasAmmo = item.system.ammunition.currentItemId !== "";
		let desc = "";
		if (item.system.specializationId !== "none")
			desc += this._addLineFromToIds("SPACE1889.CombatSpecialization", CONFIG.SPACE1889.combatSpecializations[item.system.specializationId], false);

		if (hasAmmo)
			desc += this._addLine("SPACE1889.Ammunition", item.system.ammunition.name, "", desc.length > 0);

		const ammoBonus = hasAmmo && item.system.ammunition?.damageMod ? item.system.ammunition.damageMod : 0;

		desc += this._addLine("SPACE1889.Damage", (item.system.damage + ammoBonus).toString(),  item.system.damageTypeDisplay, desc.length > 0);

		if (item.system.range !== "")
		{
			desc += this._addLine("SPACE1889.Range", item.system.calculatedRange.toString(), "m");
			if (item.system.templateConeAngle)
				desc += this._addLine("SPACE1889.ConeAngle", item.system.templateConeAngle, "&deg;");
			if (item.system.capacityType && item.system.capacityType === "" && CONFIG.SPACE1889.weaponCapacityTypesAbbr[item.system.capacityType])
				desc += this._addLine("SPACE1889.Capacity", item.system.capacity, " " + game.i18n.localize(CONFIG.SPACE1889.weaponCapacityTypesAbbr[item.system.capacityType]));
		}
		desc += this._addLine("SPACE1889.Weight", item.system.weight?.toString(), "kg");

		if (item.system.location === "mounted")
		{
			desc += this._addLine("SPACE1889.SecondaryAttributeSiz", item.system.size);
			desc += this._addLineFromToIds("SPACE1889.WeaponGunPosition", CONFIG.SPACE1889.weaponMountSpots[item.system.vehicle.spot]);

			if (item.system.vehicle.isSwivelMounted)
				desc += this._addLine("SPACE1889.WeaponSwivelingRange", item.system.vehicle.swivelingRange, "&deg;");
			else
				desc += "<br>" + game.i18n.localize("SPACE1889.WeaponIsRigidlyMounted");
		}

		if (item.system.description !== "")
			desc += this._addLine("SPACE1889.Description", item.system.description);

		const image = this._getImageIfNotDefault(forChat);
		const fullDesc = this._ComposeHtmlTextInfo(image, this.system.label, type, desc, forChat);
		return fullDesc;
	}

	_getTypeText()
	{
		let type = this.type === "skill" && this.system.isSkillGroup 
			? game.i18n.localize("SPACE1889.SkillGroup") + " " + this.system.skillGroup
			: game.i18n.localize(CONFIG.SPACE1889.itemTypes[this.type]);

		if (this.type === "specialization")
		{
			const skillLangId = 'SPACE1889.Skill' + this.system.underlyingSkillId.replace(/^(.)/, function (b) { return b.toUpperCase(); });
			let skillName = game.i18n.localize(skillLangId);
			if (skillName === skillLangId)
				skillName = this.system.underlyingSkillId;

			type = skillName + " " + type;
		}
		return type;
	}

	_getImageIfNotDefault(forChat)
	{
		if (!SPACE1889RollHelper.showItemImage(this))
			return "";

		if (forChat)
			return SPACE1889Helper.getItemChatImageHtml(this.img, SPACE1889RollHelper.isSmallItemImage(this));
		else
			return SPACE1889Helper.getItemChatImageHtml(this.img, true, 150);
	}

	_addLineFromToIds(langId, secLangId, addLineBreak = true)
	{
		const line = (addLineBreak ? "<br>" : "") + game.i18n.localize(langId) + ": " + game.i18n.localize(secLangId);
		return line;
	}

	_addLine(langId, value, unit="", addLineBreak = true)
	{
		const line = (addLineBreak ? "<br>" : "") + game.i18n.localize(langId) + ": " + (value ? value : "") + unit;
		return line;
	}

	_ComposeHtmlTextInfo(image, name, type, desc, forChat)
	{
		return this._ComposeHtmlTextInfo2(image, name, "", type, desc, forChat);
	}

	_ComposeHtmlTextInfo2(image, name, secondHeader, type, desc, forChat)
	{
		const headerClass = forChat ? "" : "class=\"itemTooltipH3\"";
		const textClass = forChat ? "" : "itemTooltip";
		const second = secondHeader === "" ? "" : `<h3 ${headerClass}>${secondHeader}</h3>`;

		const composition =
			`${image}<h3 ${headerClass}><strong>${name}</strong> <small>[${type}]</small></h3>${second}<div class="${textClass}">${desc}</div>`;
		return composition;
	}
}


	