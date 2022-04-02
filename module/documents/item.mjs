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
			const item = this.data;
			if (item.name.length > 0 && item.data.id == "")
				item.data.id = this.createId(item.name);
			
			if (item.type == "skill" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "Skill", true);
				this.setFightingSkill(item);
			}
			else if (item.type == "specialization" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "SpeciSkill", true);
			}
			else if (item.type == "talent")
			{
				if (item.data.id !== "")
				{
					this.setLangIdAndLabel(item, "Talent", true, true);
				}

				if (item.data.bonusTargetLangId != "" && item.data.bonusTarget != "" && item.data.bonusTargetType != "")
				{
					item.data.bonusTargetLangId = 'SPACE1889.' + item.data.bonusTargetType.replace(/^(.)/, function (c) { return c.toUpperCase(); }) + item.data.bonusTarget.replace(/^(.)/, function (b) { return b.toUpperCase(); });
					if (this.ShowTalentDetail(item))
					{
						item.data.showDetail = true;
						const bonusTarget = game.i18n.localize(item.data.bonusTargetLangId);
						if (bonusTarget != item.data.bonusTargetLangId)
							item.data.label += " (" + bonusTarget + ")";
					}
				}

				if (this.IsTalentRollable(item))
					item.data.isRollable = true;

			}
			else if (item.type == "weakness" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "Weakness", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/paralysis.svg";
			}
			else if (item.type == "resource" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "Resource", true, true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/card-joker.svg";
			}
			else if (item.type == "weapon" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "Weapon", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/sword.svg";
			}
			else if (item.type == "armor" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "Armor", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/shield.svg";
			}
			else if (item.type == "item")
			{
				this.setLangIdAndLabel(item, "Item", true);
			}
			else if (item.type == "language" && item.data.id !== "")
			{
				this.setLangIdAndLabel(item, "Language", false);
				item.data.origin = game.i18n.localize(CONFIG.SPACE1889.languageOrigins[item.data.originId]);
				item.data.family = game.i18n.localize(CONFIG.SPACE1889.familyOflanguages[item.data.familyId]);
				item.data.dialect = game.i18n.localize(CONFIG.SPACE1889.languages[item.data.isDialectSourceId]);
				item.data.oldInfo = item.data.old ? game.i18n.localize('SPACE1889.OldLanguageInfo') : "";
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/sound.svg";
			}
			else if (item.type == "currency")
			{
				this.setLangIdAndLabel(item, "Currency", false, false);
				const abbrLangId = item.data.nameLangId + "Abbr";
				item.data.abbr = game.i18n.localize(abbrLangId);
				if (item.data.abbr == "" || item.data.abbr == abbrLangId)
					item.data.abbr = item.data.label;
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/coins.svg";

				item.data.exchangeValue = SPACE1889Helper.getExchangeValue(item);
			}
			
		}
		catch (error) 
		{
			console.error(error);
		}
	}

	/**
	 * 
	 * @param {object} itemData
	 * @returns {boolean}
	 */
	IsTalentRollable(itemData)
	{
		if (itemData.data.id == "geschaerfterSinn"
			|| itemData.data.id == "paralysierenderSchlag"
			|| itemData.data.id == "assassine")
		{
			return true;
		}
		return false;
	}

	/**
	 *
	 * @param {object} itemData
	 * @returns {boolean}
	 */
	ShowTalentDetail(itemData)
	{
		if (itemData.data.id == "geschaerfterSinn"
			|| itemData.data.id == "begabung")
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
		if (item == undefined || item.data.id == undefined || item.data.id == "")
			return;

		const upperCaseId = item.data.id.replace(/^(.)/, function(b){return b.toUpperCase();});
		item.data.nameLangId = 'SPACE1889.' + base + upperCaseId;
		if (setDescription)
			item.data.descriptionLangId = 'SPACE1889.' + base + 'Desc' + upperCaseId;
		if (setInfo)
		{
			item.data.infoLangId = 'SPACE1889.' + base + 'Info' + upperCaseId;
			if (base == "Talent")
			{
				const toolTip = game.i18n.localize(item.data.infoLangId);
				item.data.toolTip = item.data.info != "" && toolTip == item.data.infoLangId ? item.data.info : toolTip;
			}
		}

		item.data.label = game.i18n.localize(item.data.nameLangId) ?? item.name;
		if (item.data.label == item.data.nameLangId)
			item.data.label = item.name;
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
			.replace(/\,+/g, '');
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
		item.data.isFightingSkill = fightingSkills.includes(item.data.id);
	}

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	 getRollData() {
		// If present, return the actor's roll data.
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = foundry.utils.deepClone(this.data.data);

		return rollData;
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll() {
		const item = this.data;

		if (!this.data.data.formula)
		{
			SPACE1889RollHelper.rollItemInfo(item, this.actor);
			return;
		}


		if (this.data.data.formula)
		{
			// Initialize chat data.
			const speaker = ChatMessage.getSpeaker({ actor: this.actor });
			const rollMode = game.settings.get('core', 'rollMode');
			let label = `[${item.type}] ${item.name}`;
			let desc = item.data.description;
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
		SPACE1889RollHelper.rollSpecial(this.data, this.actor, dieCount, showDialog);
	}

	/**
	* 
	* @param {number} dieCount 
	* @param {boolean} showDialog 
	*/
	async rollSpecialTalent(dieCount, showDialog) 
	{
		SPACE1889RollHelper.rollSpecialTalent(this.data, this.actor, dieCount, showDialog);
	}
}


	