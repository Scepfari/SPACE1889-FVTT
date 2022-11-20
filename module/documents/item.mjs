import SPACE1889RollHelper from "../helpers/roll-helper.mjs";
import SPACE1889Helper from "../helpers/helper.mjs";

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
				if (item.system.specializationId == "schrotgewehr")
					item.system.templateConeAngle = SPACE1889Helper.getConeAngle(item);
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
		SPACE1889RollHelper.rollSpecial(this, this.actor, dieCount, showDialog);
	}

	/**
	* 
	* @param {number} dieCount 
	* @param {boolean} showDialog 
	*/
	async rollSpecialTalent(dieCount, showDialog) 
	{
		SPACE1889RollHelper.rollSpecialTalent(this, this.actor, dieCount, showDialog);
	}
}


	