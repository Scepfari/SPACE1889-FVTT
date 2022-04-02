import SPACE1889Helper from "../helpers/helper.mjs";

export default class SPACE1889RollHelper
{
    static getEventEvaluation(event)
    {
        const showDialog = (event?.shiftKey || event?.ctrlKey);
        const showInfoOnly = !showDialog && event?.altKey;
        return { showDialog: showDialog, showInfoOnly: showInfoOnly };
    }

    static rollItem(itemData, actor, event)
    {
        if (itemData == undefined)
            return;

        const evaluation = this.getEventEvaluation(event);
        const dieCount = this.getDieCount(itemData, actor);
        if (evaluation.showInfoOnly)
            return this.rollItemInfo(itemData, actor);

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
            const info = itemData.type == "weapon" ? game.i18n.localize("SPACE1889.Attack") ?? "Attack" : game.i18n.localize("SPACE1889.Probe") ?? "Probe";
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
            const isAttack = itemData.data.id != "geschaerfterSinn";
            const info = isAttack ? game.i18n.localize("SPACE1889.Attack") ?? "Attack" : game.i18n.localize("SPACE1889.Probe") ?? "Probe";
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

        let info = titelInfo + ":";
        if (showDialog)
        {
            let dialogue = new Dialog(
                {
                    title: `Modifizierter Wurf: ${itemData.data.label}`,
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
            let messageContent = `<div><h2>${itemData.data.label}</h2></div>`;
            if (withExtraInfo)
                messageContent += `${extraInfo} <br>`;
            messageContent += `${info} <b>[[${wurfelAnzahl}d6odd]] ${von}  ${wurfelAnzahl}</b> <br>`;
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
     * @param {object} rollData
     */
    static rollItemInfo(item, actor)
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
            label = `<h2><strong>${item.data.label}</strong> [${weapon}]</h2>`;
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
            const type = game.i18n.localize("SPACE1889.Item") ?? item.type;
            label = `<h2><strong>${item.data.label}</strong> [${type}]</h2>`;
        }


		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
			flavor: label,
			content: desc ?? ''
		});

    }


    static async showDamageDialog(actor, item, isLethal)
    {
        let optionen = '';
        let actorData = actor.data;

        optionen += '<option value="lethal"' + (isLethal ? ' selected="selected">' : '>') + game.i18n.localize("SPACE1889.Lethal") + '</option>';
        optionen += '<option value="nonLethal"' + (!isLethal ? ' selected="selected">' : '>') + game.i18n.localize("SPACE1889.NonLethal") + '</option>';

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
        const isCharakter = actor.data.type == "character"
        let stun = actor.data.data.secondaries.stun.total;
        let str = actor.data.data.abilities.str.total;
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

        let info = "<small>" + (dmgName != "" ? "durch <i>" + dmgName + "</i> und " : "");
        info += game.i18n.format("SPACE1889.ChatInfoHealth", { health: (isCharakter ? newHealth.toString() : Math.round(100 * newHealth / maxHealth).toString() + "%") });
        if (damageTuple.nonLethal > 0)
            info += " " + game.i18n.format("SPACE1889.ChatInfoHealthLethalDamageOnly", { lethalHealth: lethalValue.toString() });
        info += "</small><br>";

        if (trefferInfo != "")
            info += "<b>" + game.i18n.localize("SPACE1889.StrikeEffect") + ":</b> <br>" + trefferInfo;
        if (gesamtInfo != "")
            info += (trefferInfo != "" ? "<br>" : "") + "<b>" + game.i18n.localize("SPACE1889.OverallEffect") + ":</b> <br>" + gesamtInfo;

        const titel = game.i18n.format("SPACE1889.ChatInfoDamage", { damage: dmg.toString(), damageType: dmgTypeLabel });
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
}