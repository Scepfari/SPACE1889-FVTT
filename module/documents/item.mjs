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
			
			if (item.type == "skill" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "Skill", true);
				this.setFightingSkill(item);
			}
			else if (item.type == "specialization" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "SpeciSkill", true);
			}
			else if (item.type == "talent")
			{
				if (item.data.id !=="")
				{
					this.setLangIdAndLabel(item, "Talent", true, true);
				}

				if (item.data.bonusTargetLangId != "" && item.data.bonusTarget != "" && item.data.bonusTargetType != "")
				{
					item.data.bonusTargetLangId = 'SPACE1889.' + item.data.bonusTargetType.replace(/^(.)/, function (c) { return c.toUpperCase(); }) + item.data.bonusTarget.replace(/^(.)/, function (b) { return b.toUpperCase(); });
					if (this.ShowTalentDetail(item))
						item.data.label += " (" + game.i18n.localize(item.data.bonusTargetLangId) + ")";
				}

				if (this.IsTalentRollable(item))
					item.data.isRollable = true;

			}
			else if (item.type == "weakness" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "Weakness", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/paralysis.svg";
			}
			else if (item.type == "resource" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "Resource", true, true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/card-joker.svg";
			}
			else if (item.type == "weapon" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "Weapon", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/sword.svg";
			}
			else if (item.type == "armor" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "Armor", true);
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/shield.svg";
			}
			else if (item.type == "item")
			{
				this.setLangIdAndLabel(item, "Item", true);
			}
			else if (item.type == "language" && item.data.id !=="")
			{
				this.setLangIdAndLabel(item, "Language", false);
				item.data.origin = game.i18n.localize(CONFIG.SPACE1889.languageOrigins[item.data.originId]);        
				item.data.family = game.i18n.localize(CONFIG.SPACE1889.familyOflanguages[item.data.familyId]);
				item.data.dialect = game.i18n.localize(CONFIG.SPACE1889.languages[item.data.isDialectSourceId]);
				item.data.oldInfo = item.data.old ? game.i18n.localize('SPACE1889.OldLanguageInfo') : "";
				if (item.img == "icons/svg/item-bag.svg")
					item.img = "icons/svg/sound.svg";
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
			|| itemData.data.id == "paralysierenderSchlag")
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
			item.data.infoLangId = 'SPACE1889.' + base + 'Info' + upperCaseId;
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

		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get('core', 'rollMode');
		let label = `[${item.type}] ${item.name}`;
		let desc = item.data.description;
		if (item.type == "skill")
		{
			const fertigkeit = game.i18n.localize("SPACE1889.Skill") ?? item.type;
			desc = game.i18n.localize(item.data.descriptionLangId);
			if (item.data.isSkillGroup)
			{
				const gruppe = game.i18n.localize(CONFIG.SPACE1889.skillGroups[item.data.skillGroupName]);
				label = `<h2><strong>${item.data.label}</strong></h2> <h3>${gruppe} [${fertigkeit}]</h3>`;
			}
			else
				label = `<h2><strong>${item.data.label}</strong> [${fertigkeit}]</h2>`;
		}
		else if (item.type == "specialization")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			const skillName = game.i18n.localize(item.data.nameLangId = 'SPACE1889.Skill' + item.data.underlyingSkillId.replace(/^(.)/, function(b){return b.toUpperCase();}));
			const specialization = game.i18n.localize("SPACE1889.Specialization") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong></h2> <h3>[${skillName} ${specialization}]</h3>`;
		}
		else if (item.type == "talent")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
			const talent = game.i18n.localize("SPACE1889.Talent") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${talent}]</h2>`;
		}
		else if (item.type == "weakness")
		{
			desc = game.i18n.localize(item.data.descriptionLangId);
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
			const weapon = game.i18n.localize("SPACE1889.Weapon") ?? item.type;
			label = `[${weapon}] ${item.data.label}`;
		}
		else if (item.type == "armor")
		{
			const armor = game.i18n.localize("SPACE1889.Armor") ?? item.type;
			label = `[${armor}] ${item.data.label}`;
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
			const type = game.i18n.localize("SPACE1889.Item") ?? item.type;
			label = `<h2><strong>${item.data.label}</strong> [${type}]</h2>`;
		}


		// If there's no roll data, send a chat message.
		if (!this.data.data.formula) {
			ChatMessage.create({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
				content: desc ?? ''
			});
		}
		// Otherwise, create a roll and send a chat message from it.
		else {
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
		const item = this.data;

		if (item.type == "weapon" || item.type == "skill" || item.type == "specialization")
		{
			const info = item.type == "weapon" ? game.i18n.localize("SPACE1889.Attack") ?? "Attack" : game.i18n.localize("SPACE1889.Probe") ?? "Probe";
			this.rollSubSpecial(dieCount, showDialog, info);
		}
	}

	/**
	* 
	* @param {number} dieCount 
	* @param {boolean} showDialog 
	*/
	async rollSpecialTalent(dieCount, showDialog) 
	{
		const item = this.data;

		if (item.type == "talent")
		{
			const info = item.data.id == "paralysierenderSchlag" ? game.i18n.localize("SPACE1889.Attack") ?? "Attack" : game.i18n.localize("SPACE1889.Probe") ?? "Probe";
			this.rollSubSpecial(dieCount, showDialog, info);
		}
	}
    /**
	 *
	 * @param {number} dieCount
	 * @param {boolean} showDialog
	 * @param {string} titelInfo
	*/
	async rollSubSpecial(dieCount, showDialog, titelInfo)
	{
        const item = this.data;
        const theActor = this.actor;

        let info = titelInfo + ":";
        if (showDialog)
        {
            let dialogue = new Dialog(
                {
                    title: `Modifizierter Wurf: ${item.data.label}`,
                    content: `<p>Anzahl der Modifikations-Würfel: <input type="number" id="anzahlDerWuerfel" value = "0"></p>`,
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
            let messageContent = `<div><h2>${item.data.label}</h2></div>`;
            messageContent += `${info} <b>[[${wurfelAnzahl}d6odd]] ${von}  ${wurfelAnzahl}</b> <br>`;
            let chatData =
            {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: theActor }),
                content: messageContent
            };
            return chatData;
        }
	}
}


	