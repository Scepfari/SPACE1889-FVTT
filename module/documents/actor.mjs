import SPACE1889Helper from "../helpers/helper.mjs";
import SPACE1889RollHelper from "../helpers/roll-helper.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Space1889Actor extends Actor
{

	/** @override */
	async _preCreate(data, options, user)
	{
		await super._preCreate(data, options, user);

		const actorData = this.data;

		if (data.type === "character")
		{
			let resourcePack = game.packs.get("space1889.ressourcen");
			let resources = await resourcePack.getDocuments();
			let toAddItems = [];
			for (let item of resources)
			{
				if (item.data.data.isBase && actorData.items.find(e => e.data.data.id == item.data.data.id) == undefined)
					toAddItems.push(item.toObject());
			}

			if (toAddItems.length > 0)
				actorData.update({ "items": toAddItems });
		}

		if (data.type === "creature" && actorData.items.size == 0)
		{
			let skillPack = game.packs.get("space1889.fertigkeiten");
			let skills = await skillPack.getDocuments();
			let toAddItems = [];
			for (let item of skills)
			{
				if (item.data.data.id == "waffenlos")
					toAddItems.push(item.toObject());
				else if (item.data.data.id == "heimlichkeit")
					toAddItems.push(item.toObject());
				else if (item.data.data.id == "ueberleben")
					toAddItems.push(item.toObject());
			}

			if (toAddItems.length > 0)
				actorData.update({ "items": toAddItems });
		}
	}

	/** @override */
	prepareData()
	{
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();
	}

	/** @override */
	prepareBaseData()
	{
		// Data modifications in this step occur before processing embedded
		// documents or derived data.
	}

	/**
	 * @override
	 * Augment the basic actor data with additional dynamic data. Typically,
	 * you'll want to handle most of your calculated/derived data in this step.
	 * Data calculated in this step should generally not exist in template.json
	 * (such as ability modifiers rather than ability scores) and should be
	 * available both inside and outside of character sheets (such as if an actor
	 * is queried and has a roll executed directly from it).
	 */
	prepareDerivedData()
	{
		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags.space1889 || {};

		// Was unterscheidet einen NSC von einem SC?
		// vermutlich nichts, au??er dass er in der Summe nicht so viele Fertigkeiten, Talente usw. hat
		// und somit einen kompakteren NSC Bogen ??hnlich dem Kreaturen bekommen kann
		// damit kann alle Akteure in einem prepare verarbeitet werden.
		// ToDo: NSC Bogen erstellen und beschr??nkungen rausnehmen
		this._prepareCharacterData(actorData);
	}

	/**
	 * Prepare Character type specific data
	 */
	_prepareCharacterData(actorData)
	{
		if (actorData.type !== 'character' && actorData.type !== 'npc' && actorData.type !== 'creature')
			return;

		// Make modifications to data here. For example:
		const data = actorData.data;
		const items = actorData.items;

		let primaereAttribute = [];

		for (let [key, ability] of Object.entries(data.abilities))
		{
			ability.talentBonus = this.getBonusFromTalents(key, "ability", items);
			ability.total = ability.value + ability.talentBonus;
			primaereAttribute.push(key);
		}
		actorData.data['primaereAttribute'] = primaereAttribute;

		const armorData = this.getArmorBonusMalus(items);
		if (armorData.malus > 0)
			data.abilities["dex"].total -= armorData.malus;
		data.armorTotal = armorData;

		const skills = [];
		const speciSkills = [];
		const talents = [];
		const weapons = [];
		const armors = [];
		const gear = [];
		const resources = [];
		const weakness = [];
		const language = [];
		const injuries = [];
		const money = [];
		for (let item of items)
		{
			if (item.data.type === 'skill')
			{
				item.data.data.talentBonus = this.getBonusFromTalents(item.data.data.id, item.data.type, items);
				skills.push(item.data);
			}
			// Append to specialization.
			else if (item.data.type === 'specialization')
			{
				item.data.data.talentBonus = this.getBonusFromTalents(item.data.data.id, item.data.type, items);
				speciSkills.push(item.data);
			}
			else if (item.data.type === 'talent')
				talents.push(item.data);
			else if (item.data.type === 'weapon')
				weapons.push(item.data);
			else if (item.data.type === 'armor')
				armors.push(item.data);
			else if (item.data.type === 'item')
				gear.push(item.data);
			else if (item.data.type === 'damage')
				injuries.push(item.data);
			else if (item.data.type === 'resource')
				resources.push(item.data);
			else if (item.data.type === 'weakness')
				weakness.push(item.data);
			else if (item.data.type === 'language')
				language.push(item.data);
			else if (item.data.type === 'currency')
				money.push(item.data);
		}

		SPACE1889Helper.sortByName(skills);
		SPACE1889Helper.sortByName(speciSkills);
		SPACE1889Helper.sortByName(talents);
		SPACE1889Helper.sortByName(resources);
		SPACE1889Helper.sortByName(weakness);
		SPACE1889Helper.sortByName(language);

		actorData.talents = talents;
		actorData.skills = skills;
		actorData.speciSkills = speciSkills;
		actorData.injuries = injuries;
		actorData.armors = armors;
		actorData.gear = gear;
		actorData.resources = resources;
		actorData.weakness = weakness;
		actorData.language = language;
		actorData.money = money;

		this.calcAndSetSecondaries(actorData)
		data.health.max = data.abilities.con.total + data.abilities.wil.total + data.secondaries.size.total + this.getBonusFromTalents("max", "health", items);

		this.calcAndSetSkillsAndSpecializations(actorData)

		this.prepareWeapons(actorData, weapons);
		actorData.weapons = weapons;

		for (let injury of injuries)
		{
			const isLethal = injury.data.damageType == "lethal";
			const healingDurationInDays = (isLethal ? 7 : 1) * injury.data.damage / injury.data.healingFactor;
			injury.data.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[injury.data.damageType]);
			injury.data.healingDuration = this.FormatHealingDuration(healingDurationInDays);
			injury.data.timeToNextCure = this.FormatHealingDuration(healingDurationInDays / injury.data.damage);
		}

		if (SPACE1889Helper.isCreature(actorData))
		{
			this.setCreatureMovementDisplay(actorData);
			this.CalcAndSetHealth(actorData);
			this.CalcAndSetEP(actorData);
		}
		else
		{
			const lists = [armors, gear];

			for (const list of lists)
			{
				for (let element of list)
				{
					let langIdAbbr = CONFIG.SPACE1889.storageLocationAbbreviations[element.data.location] ?? "";
					let longId = CONFIG.SPACE1889.storageLocations[element.data.location] ?? "";
					element.data.display = (langIdAbbr != "" ? game.i18n.localize(langIdAbbr) : "?");
					element.data.locationLong = (longId != "" ? game.i18n.localize(longId) : "?");
				}
			}

			this._CalcThings(actorData);
		}
	}

	/**
	 * 
	 * @param {object} actorData
	 */
	calcAndSetSecondaries(actorData)
	{
		const data = actorData.data;
		data.secondaries.move.value = data.abilities.str.total + data.abilities.dex.total;
		data.secondaries.move.talentBonus = this.getBonusFromTalents("move", "secondary", actorData.items);
		data.secondaries.move.total = data.secondaries.move.value + data.secondaries.move.talentBonus;
		data.secondaries.perception.value = data.abilities.int.total + data.abilities.wil.total;
		data.secondaries.perception.talentBonus = this.getBonusFromTalents("perception", "secondary", actorData.items);
		data.secondaries.perception.total = data.secondaries.perception.value + data.secondaries.perception.talentBonus;
		data.secondaries.initiative.value = data.abilities.dex.total + data.abilities.int.total;
		data.secondaries.initiative.talentBonus = this.getBonusFromTalents("initiative", "secondary", actorData.items);
		data.secondaries.initiative.total = data.secondaries.initiative.value + data.secondaries.initiative.talentBonus;
		data.secondaries.stun.value = Math.max(data.abilities.con.total, SPACE1889Helper.getTalentLevel(actorData, "dickkopf") > 0 ? data.abilities.wil.total : 0);
		data.secondaries.stun.talentBonus = this.getBonusFromTalents("stun", "secondary", actorData.items);
		data.secondaries.stun.total = data.secondaries.stun.value + data.secondaries.stun.talentBonus;
		data.secondaries.size.talentBonus = this.getBonusFromTalents("size", "secondary", actorData.items);
		data.secondaries.size.total = data.secondaries.size.value + data.secondaries.size.talentBonus;
		data.secondaries.defense.value = this.getPassiveDefence(actorData) + this.getActiveDefence(actorData) - data.secondaries.size.total;
		data.secondaries.defense.talentBonus = this.getBonusFromTalents("defense", "secondary", actorData.items);
		data.secondaries.defense.armorBonus = data.armorTotal.bonus;
		data.secondaries.defense.total = data.secondaries.defense.value + data.secondaries.defense.talentBonus + data.secondaries.defense.armorBonus;
	}

	calcAndSetCharacterNpcSiMoveUnits(actorData)
	{
		const siMoveDistance = actorData.data.secondaries.move.total * 1.5;
		const meter = "m";
		const meterWithSeparator = "m; ";
		const runFactor = SPACE1889Helper.getTalentLevel(actorData, "sprinter") > 0 ?  4 : 2;
		const sprintFactor = 4;
		let info =  game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
		info += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * runFactor).toString() + meterWithSeparator;
		info += game.i18n.localize("SPACE1889.Sprint") + ": " + (siMoveDistance * sprintFactor).toString() + meter;
		actorData.data.secondaries.move.inSiUnits = info;
	}


	/**
	 *
	 * @param {object} actorData
	 */
	calcAndSetSkillsAndSpecializations(actorData)
	{
		for (let skl of actorData.skills)
		{
			let underlyingAttribute = this._GetAttributeBase(actorData, skl);
			skl.data.basis = actorData.data.abilities[underlyingAttribute].total;
			skl.data.baseAbilityAbbr = game.i18n.localize(CONFIG.SPACE1889.abilityAbbreviations[underlyingAttribute]);
			let sizeMod = 0;
			if (skl.data.id == 'heimlichkeit' && actorData.data.secondaries.size.total != 0)
				sizeMod = actorData.data.secondaries.size.total;

			skl.data.rating = Math.max(0, skl.data.basis + skl.data.level + skl.data.talentBonus - sizeMod);
			if (skl.data.isSkillGroup && skl.data.skillGroupName.length > 0)
				skl.data.skillGroup = game.i18n.localize(CONFIG.SPACE1889.skillGroups[skl.data.skillGroupName]);

			if (skl.data.id == 'sportlichkeit' && skl.data.rating > actorData.data.secondaries.move.value)
			{
				actorData.data.secondaries.move.value = skl.data.rating;
				actorData.data.secondaries.move.total = skl.data.rating + actorData.data.secondaries.move.talentBonus;
			}

			for (let spe of actorData.speciSkills)
			{
				if (spe.data.underlyingSkillId == skl.data.id)
				{
					spe.data.basis = skl.data.rating;
					spe.data.rating = spe.data.basis + spe.data.level + spe.data.talentBonus;
				}
			}
		}

	}

	/**
	 * 
	 * @param {object} actorData
	 * @param {Array<object>} weapons
	 */
	prepareWeapons(actorData, weapons)
	{
		let sizeMod = (-1) * actorData.data.secondaries.size.total;
		for (let weapon of weapons)
		{
			if (weapon.data.skillId == "none" && weapon.data.isAreaDamage)
			{
				weapon.data.sizeMod = "-";
				weapon.data.skillRating = "-";
				weapon.data.attack = weapon.data.damage;
				weapon.data.attackAverage = (Math.floor(weapon.data.attack / 2)).toString() + (weapon.data.attack % 2 == 0 ? "" : "+");
			}
			else
			{
				weapon.data.sizeMod = sizeMod;
				weapon.data.skillRating = this._GetSkillLevel(actorData, weapon.data.skillId, weapon.data.specializationId);
				weapon.data.attack = Math.max(0, weapon.data.damage + weapon.data.skillRating + weapon.data.sizeMod);
				weapon.data.attackAverage = (Math.floor(weapon.data.attack / 2)).toString() + (weapon.data.attack % 2 == 0 ? "" : "+");
			}
			weapon.data.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[weapon.data.damageType]);
			if (!SPACE1889Helper.isCreature(actorData))
			{
				weapon.data.locationDisplay = game.i18n.localize(CONFIG.SPACE1889.storageLocationAbbreviations[weapon.data.location]);
				weapon.data.locationDisplayLong = game.i18n.localize(CONFIG.SPACE1889.storageLocations[weapon.data.location]);
			}
		}

		SPACE1889Helper.sortByName(weapons);
	}


	/**
	 * 
	 * @param {object} actorData
	 */
	setCreatureMovementDisplay(actorData)
	{
		if (actorData.type != "creature")
			return;

		const data = actorData.data;
		let movement = "";
		let siUnits = "";
		const siMoveDistance = data.secondaries.move.total * 1.5;
		const meter = "m";
		const meterWithSeparator = "m; ";
		switch (data.movementType)
		{
			case "amphibious":
			case "flying":
				const second = Math.floor(data.secondaries.move.total / 2);
				movement = data.secondaries.move.total.toString() + " (" + second.toString() + ")";
				siUnits = game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[data.movementType]) + ": ";
				siUnits += siMoveDistance.toString() + meterWithSeparator;
				siUnits += (data.movementType == "flying") ? game.i18n.localize("SPACE1889.OnTheGround") : game.i18n.localize("SPACE1889.OnLand") + ": ";
				siUnits += (siMoveDistance/2).toString() + meter;
				break;
			case "fossorial":
				movement = data.secondaries.move.total.toString() + " (" + (data.secondaries.move.total * 2).toString() + ")";
				siUnits = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * 2).toString() + meterWithSeparator;
				siUnits += game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[data.movementType]) + ": ";
				siUnits += (data.secondaries.move.total * 2 * 0.3).toString() + "m/h";
				break;
			case "jumper":
			case "manylegged":
				movement = data.secondaries.move.total.toString() + " (" + (data.secondaries.move.total * 2).toString() + ")";
				siUnits = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * 4).toString() + meter;
				break;
			case "swimming":
				movement = (data.secondaries.move.total * 2).toString() + " (0)";
				siUnits = game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[data.movementType]) + ": ";
				siUnits += (siMoveDistance * 2).toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.OnLand") + ": 0m";
				break;
			case "immobile":
				movement = "0";
				siUnits += game.i18n.localize("SPACE1889.CreatureMovementTypeImmobile") + ": 0m";
				break;
			default:
				movement = data.secondaries.move.total.toString();
				this.calcAndSetCharacterNpcSiMoveUnits(actorData)
				break;
		}

		data.secondaries.move.display = movement;
		if (data.movementType != "ground")
			data.secondaries.move.inSiUnits = siUnits;
	}

	/**
	 * @param {string} whatId
	 * @param {string} type
	 * @param {any} items
	 * @returns {number}
	 */
	getBonusFromTalents(whatId, type, items)
	{
		let bonus = 0;
		for (let item of items)
		{
			if (item.data.type != "talent")
				continue;

			if (item.data.data.bonusTargetType == type && item.data.data.bonusTarget == whatId)
			{
				let factor = item.data.data.level.value;
				if (item.data.data.bonusStartLevel > 1)
					factor = Math.max(0, item.data.data.level.value + 1 - item.data.data.bonusStartLevel);
				bonus += (factor * item.data.data.bonus);
			}
		}

		return bonus;
	}

	getActiveDefence(actorData)
	{
		let active = actorData.data.abilities.dex.total;

		for (let item of actorData.items)
		{
			if (item.data.type != 'talent')
				continue;

			if (item.data.data.id == 'berechneteAbwehr')
				active = actorData.data.abilities.int.total;
			else if (item.data.data.id == 'strahlendeAbwehr')
				active = actorData.data.abilities.cha.total;
		}

		return active;
	}

	getPassiveDefence(actorData)
	{
		let passive = actorData.data.abilities.con.total;

		for (let item of actorData.items)
		{
			if (item.data.type != 'talent')
				continue;

			if (item.data.data.id == 'kraftvolleAbwehr')
				passive = actorData.data.abilities.str.total;
			else if (item.data.data.id == 'ueberzeugteAbwehr')
				passive = actorData.data.abilities.wil.total;
		}

		return passive;
	}

	getArmorBonusMalus(items)
	{
		let dexMalus = 0;
		let defenseBonus = 0;
		for (let item of items)
		{
			if (item.data.type != "armor")
				continue;

			if (item.data.data.location == "koerper")
			{
				defenseBonus += item.data.data.defenseBonus;
				dexMalus += item.data.data.dexPenalty;
			}
		}
		const returnData = {
			bonus: defenseBonus,
			malus: dexMalus
		};
		return returnData;
	}


	/**
	 * 
	 * @param {Object} actorData
	 * @param {Object} skill
	 * @returns {string} abilityKey
	 */
	_GetAttributeBase(actorData, skill)
	{
		for (let talent of actorData.talents)
		{
			if (talent.data.changedSkill == skill.data.id && talent.data.newBase != "") //besser pr??fen obs eine der 6 prim??ren Attribute ist
				return talent.data.newBase;
		}
		return skill.data.underlyingAttribute
	}


	/**
	 * 
	 * @param {Object} actorData 
	 * @param {string} skillId 
	 * @param {string} specializationId
	 * @returns {number}
	 */
	_GetSkillLevel(actorData, skillId, specializationId)
	{
		for (let speci of actorData.speciSkills)
		{
			if (specializationId == speci.data.id)
				return speci.data.rating;
		}
		for (let skill of actorData.skills)
		{
			if (skillId == skill.data.id)
				return skill.data.rating;
		}
		return this.GetSkillRating(actorData, skillId, "");
	}

	_CalcThings(actorData)
	{
		actorData.data.foreignLanguageLimit = this.GetForeignLanguageLimit(actorData);
		this.CalcAndSetBlockData(actorData);
		this.CalcAndSetParryData(actorData);
		this.CalcAndSetEvasionData(actorData);
		this.CalcAndSetLoad(actorData);
		this.CalcAndSetEP(actorData);
		this.CalcAndSetHealth(actorData);
		this.calcAndSetCharacterNpcSiMoveUnits(actorData);
	}

	_GetId(item)
	{
		if (item != null)
			return item.data.data.id;
		return "";
	}

	GetForeignLanguageLimit(actorData)
	{
		let linguistikId = "linguistik";
		let underlyingAbility = "int";
		let rating = this.GetSkillRating(actorData, linguistikId, underlyingAbility);

		var isHausregel = game.settings.get("space1889", "improvedForeignLanguageCountCalculation");

		if (rating >= 10)
			return 16;
		if (rating >= 9)
			return (isHausregel ? 12 : 8);
		if (rating >= 8)
			return 8;
		if (rating >= 7)
			return (isHausregel ? 6 : 4);
		if (rating >= 6)
			return 4;
		if (rating >= 5)
			return (isHausregel ? 3 : 2);
		if (rating >= 4)
			return 2;
		if (rating >= 2)
			return 1;

		return 0;
	}


	CalcAndSetBlockData(actorData)
	{
		const id = "waffenlos";
		let underlyingAbility = "str";
		let rating = this.GetSkillRating(actorData, id, underlyingAbility);
		let instinctive = false;
		let riposte = false;
		rating += actorData.data.armorTotal.bonus;
		rating += actorData.data.secondaries.defense.talentBonus;

		for (let item of actorData.items)
		{
			if (item.data.type != "talent")
				continue;

			if (item.data.data.id == "blocken")
			{
				instinctive = true;
				rating += item.data.data.level.value;
			}
			else if (item.data.data.id == "gegenschlag" && item.data.data.level.value > 1)
			{
				rating += (item.data.data.level.value - 1) * 2;
				riposte = true;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			rating += this.getPassiveDefence(actorData);

		actorData.data.block.value = rating;
		actorData.data.block.instinctive = instinctive;
		actorData.data.block.riposte = riposte;
		actorData.data.block.info = "";
		const defence = actorData.data.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Block");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defence < rating)
				actorData.data.block.info = game.i18n.format("SPACE1889.UseInstinctiveBlockParry", { rating: rating.toString(), rating2: (rating - 2).toString(), attackType1: waffenlos, attackType2: nahkampf, defence: defence.toString()});
			else
				actorData.data.block.info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			if (defence + 4 < rating)
				actorData.data.block.info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defence + 4).toString(), talentName: name });
			else
				actorData.data.block.info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defence + 4).toString(), talentName: name });
		}
	}

	CalcAndSetParryData(actorData)
	{
		const id = "nahkampf";
		let skillRating = 0;
		for (let item of actorData.items)
		{
			if (item.data.type != "weapon")
				continue;
			if (item.data.data.skillId == id && item.data.data.skillRating > skillRating)
				skillRating = item.data.data.skillRating;
		}

		let instinctive = false;
		let riposte = false;
		skillRating += actorData.data.armorTotal.bonus;
		skillRating += actorData.data.secondaries.defense.talentBonus;

		for (let item of actorData.items)
		{
			if (item.data.type != "talent")
				continue;

			if (item.data.data.id == "parade")
			{
				instinctive = true;
				skillRating += item.data.data.level.value;
			}
			else if (item.data.data.id == "riposte" && item.data.data.level.value > 1)
			{
				skillRating += (item.data.data.level.value-1) * 2;
				riposte = true;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			skillRating += this.getPassiveDefence(actorData);

		actorData.data.parry.value = skillRating;
		actorData.data.parry.instinctive = instinctive;
		actorData.data.parry.riposte = riposte;
		actorData.data.parry.info = "";
		const defence = actorData.data.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Parry");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defence < skillRating)
				actorData.data.parry.info = game.i18n.format("SPACE1889.UseInstinctiveBlockParry", { rating: skillRating.toString(), rating2: skillRating.toString(), attackType1: nahkampf, attackType2: waffenlos, defence: defence.toString()});
			else
				actorData.data.parry.info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			if (defence + 4 < skillRating)
				actorData.data.parry.info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defence + 4).toString(), talentName: name });
			else
				actorData.data.parry.info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defence + 4).toString(), talentName: name });
		}
	}

	CalcAndSetEvasionData(actorData)
	{
		const id1 = "sportlichkeit";
		const id2 = "akrobatik";
		let underlyingAbility1 = "str";
		let underlyingAbility2 = "dex";
		let instinctive = false;
		let rating = this.GetSkillRating(actorData, id1, underlyingAbility1);
		rating = Math.max(rating, this.GetSkillRating(actorData, id2, underlyingAbility2));
		rating += actorData.data.armorTotal.bonus;
		rating += actorData.data.secondaries.defense.talentBonus;

		for (let item of actorData.items)
		{
			if (item.data.type != "talent")
				continue;

			if (item.data.data.id == "ausweichen")
			{
				instinctive = true;
				rating += item.data.data.level.value;
				break;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			rating += this.getPassiveDefence(actorData);

		actorData.data.evasion.value = rating;
		actorData.data.evasion.instinctive = instinctive;

		actorData.data.evasion.info = "";
		const defence = actorData.data.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Evasion");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defence < rating)
				actorData.data.evasion.info = game.i18n.format("SPACE1889.UseInstinctiveEvasion", { rating: rating.toString(), defence: defence.toString()});
			else
				actorData.data.evasion.info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			if (defence + 4 < rating)
				actorData.data.evasion.info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defence + 4).toString(), talentName: name });
			else
				actorData.data.evasion.info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defence + 4).toString(), talentName: name });
		}
	}

	CalcAndSetLoad(actorData)
	{
		let str = actorData.data.abilities["str"].total;

		for (let item of actorData.items)
		{
			if (item.data.type != "talent")
				continue;

			if (item.data.data.id == "packesel")
			{
				str += item.data.data.level.value;
				break;
			}
		}

		if (actorData.data.health.value < 0)
			str = Math.max(0, str + actorData.data.health.value);

		let levels = [4, 10, 20, 40, 100, 150, 250, 300, 350, 400, 450, 500];
		str = Math.max(str, 1);
		str = Math.min(str, 10);

		let loadBody = 0;
		let loadBackpack = 0;
		let loadStorage = 0;
		let itemWeight = 0;
		for (let item of actorData.items)
		{
			if (item.type == "item")
				itemWeight = item.data.data.weight * item.data.data.quantity;
			else if (item.type == "weapon" || item.type == "armor")
				itemWeight = item.data.data.weight;
			else
				continue;

			if (item.data.data.location == "koerper")
				loadBody += itemWeight;
			else if (item.data.data.location == "rucksack")
				loadBackpack += itemWeight;
			else
				loadStorage += itemWeight;
		}

		let bodyLoadLevel = this.GetLoadingLevel(loadBody, levels[str - 1], levels[str], levels[str + 1]);
		let bodyAndBackpackLoadLevel = this.GetLoadingLevel(loadBody + loadBackpack, levels[str - 1], levels[str], levels[str + 1]);

		let loadInfo = {
			bodyLoad: loadBody.toFixed(2),
			bodyLoadLevel: bodyLoadLevel,
			bodyLoadConsequence: bodyLoadLevel + "Consequence",
			backpackLoad: loadBackpack.toFixed(2),
			bodyAndBackpackLoad: (loadBody + loadBackpack).toFixed(2),
			bodyAndBackpackLoadLevel: bodyAndBackpackLoadLevel,
			bodyAndBackpackLoadConsequence: bodyAndBackpackLoadLevel + "Consequence",
			storageLoad: loadStorage.toFixed(2),
			lightLoad: levels[str - 1],
			mediumLoad: levels[str],
			havyLoad: levels[str + 1],
			maxLoad: 2 * levels[str + 1]
		}

		actorData.data.load = loadInfo;
	}

	/**
	 * 
	 * @param {number} load
	 * @param {number} lightLoad
	 * @param {number} mediumLoad
	 * @param {number} havyLoad
	 * @returns {string}
	 */
	GetLoadingLevel(load, lightLoad, mediumLoad, havyLoad)
	{
		if (load <= lightLoad)
			return "SPACE1889.LightLoad";
		if (load <= mediumLoad)
			return "SPACE1889.MediumLoad";
		if (load <= havyLoad)
			return "SPACE1889.HavyLoad";
		if (load <= (2 * havyLoad))
			return "SPACE1889.MaxLoad";
		return "SPACE1889.ImpossibleLoad";
	}

	/**
	* Falls der Skill im Charakter enthalten ist liefert die funktion das Rating zur??ck
	* Ist der Skill nicht enthalten dann wird auf das Prim??re Atribut zur??ckgeriffen und das Abz??glich 2 zur??ckgeliefert
	* @param {object} actorData
	* @param {string} skillId  
	* @param {string} underlyingAbility
	* @returns {number}
	*/
	GetSkillRating(actorData, skillId, underlyingAbility)
	{
		let rating = 0;

		let skill = actorData.skills.find(entry => entry.data.id == skillId);
		if (skill != null && skill != undefined)
			return skill.data.rating;

		if (underlyingAbility != "" && actorData.data.primaereAttribute.indexOf(underlyingAbility) >= 0)
			return Math.max(0, actorData.data.abilities[underlyingAbility].total - 2);

		let underlying = this.FindUnderlyingAbility(actorData, skillId);
		if (underlying != "")
			return Math.max(0, actorData.data.abilities[underlying].total - 2);
		return 0;
	}

	/**
	 * 
	 * @param actorData
	 * @param skillId
	 * @returns {string} 
	 */
	FindUnderlyingAbility(actorData, skillId)
	{
		//Talente ??berpr??fen ob ein rerouting auf ein anderes Attribut aktiv ist
		const talent = actorData.talents.find(t => t.data.changedSkill == skillId && t.data.newBase != "");
		if (talent != undefined)
			return talent.data.newBase;

		const element = CONFIG.SPACE1889.skillUnderlyingAttribute.find(e => e[0] === skillId);
		if (element != undefined)
			return element[1];

		ui.notifications.info("Fertigkeit " + skillId.toString() + " ist nicht im Compendium, darauf basierende Berechnungen der Waffenst??rke k??nnen falsch sein.");

		return "";

		//ToDo: f??r neue Benutzerfertigkeiten funktioniert das nicht, da die nicht in der Liste enthalten sind
		// ??ber die Game Items kann man zu dem Zeitpunkt noch nicht suchen, da die noch nicht angelegt sind
		// daf??r m??sste die funktion zu einem sp??teren Zeitpunkt noch aufgerufen werden
/*
		skill = game.items.find(entry => entry.data.data.id == skillId);
		if (skill != null && skill != undefined)
			return skill.data.data.underlyingAttribute;
		return "";*/
	}

	/**
	 * 
	 * @param actorData
	 */
	CalcAndSetEP(actorData)
	{
		let xp = 0;
		const baseXp = 15; //talent, resource
		const houseRoule = this.IsHouseRouleXpCalculationActive();
		let primaryBaseXp = houseRoule ? 10 : 5;

		xp += this.CalcPartialSum(actorData.data.abilities["con"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actorData.data.abilities["dex"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actorData.data.abilities["str"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actorData.data.abilities["cha"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actorData.data.abilities["int"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actorData.data.abilities["wil"].value) * primaryBaseXp;

		for (let item of actorData.items)
		{
			if (item.data.type == "skill")
			{
				xp += this.CalcPartialSum(item.data.data.level) * 2;
			}
			else if (item.data.type == "specialization")
			{
				if (houseRoule)
					xp += this.CalcPartialSum(item.data.data.level);
				else
					xp += item.data.data.level * 3;
			}
			else if (item.data.type == "talent")
			{
				xp += item.data.data.level.value * baseXp;
			}
			else if (item.data.type == "resource")
			{
				if (item.data.data.isBase)
				{
					if (item.data.data.level.value >= 1)
					{
						xp += 8 + ((item.data.data.level.value - 1) * baseXp);
					}
					else if (item.data.data.level.value <= -1)
					{
						xp += -8 + ((item.data.data.level.value + 1) * baseXp);
					}
				}
				else
				{
					if (item.data.data.level.value == 0)
						xp += 7;
					else
						xp += (item.data.data.level.value * baseXp);
				}
			}
		}

		if (actorData.type == 'character')
		{
			actorData.data.attributes.xp.used = xp;
			actorData.data.attributes.xp.available = actorData.data.attributes.xp.value - xp;
		}
		else 
			actorData.data.powerEquivalentInXp  = xp;
	}


	/**
	 * 
	 * @param {n} number ganze Zahl >= 1
	 * @returns {number} returns the so called triangular number https://en.wikipedia.org/wiki/Triangular_number
	 */
	CalcPartialSum(n)
	{
		n = Math.round(n);
		return (n * (n + 1)) / 2
	}

	IsHouseRouleXpCalculationActive()
	{
		// ToDo:  wie definiert man die Nulllinie f??r EP mit der Punktregel bei der Charaktererzeugung?

		return game.settings.get("space1889", "improvedEpCalculation");
	}

	CalcAndSetHealth(actorData)
	{
		let damage = 0;
		for (const injury of actorData.injuries)
		{
			damage += injury.data.damage;
		}
		const newHealth = actorData.data.health.max - damage;

		if (actorData.data.health.value != newHealth && this.isEditable)
			this.update({ "data.health.value": actorData.data.health.max - damage });

		actorData.data.health.value = newHealth;
		if (newHealth < 0)
		{
			actorData.data.secondaries.move.total = Math.max(0, actorData.data.secondaries.move.total + newHealth);
			this.CalcAndSetLoad(actorData);
		}
	}

	/**
	 * 
	 * @param {number} healingDurationInDays
	 * @returns {string}
	 */
	FormatHealingDuration(healingDurationInDays)
	{
		const days = Math.floor(healingDurationInDays);
		const hours = (healingDurationInDays - days) * 24;
		const completeHours = Math.floor(hours);
		const minutes = Math.floor((hours - completeHours) * 60);
		let duration = "";

		if (days > 0)
		{
			duration = days.toString() + "d ";
		}
		if (completeHours > 0)
		{
			duration += completeHours.toString() + "h ";
		}
		if (minutes > 0)
		{
			duration += minutes.toString() + "m ";
		}

		return duration;
	}


	/**
	 * Override getRollData() that's supplied to rolls.
	 */
	getRollData()
	{
		const data = super.getRollData();

		// Prepare character roll data.
		this._getCharacterRollData(data);
		this._getNpcRollData(data);

		return data;
	}

	/**
	 * Prepare character roll data.
	 */
	_getCharacterRollData(data)
	{
		if (this.data.type !== 'character') return;

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (data.abilities)
		{
			for (let [k, v] of Object.entries(data.abilities))
			{
				data[k] = foundry.utils.deepClone(v);
			}
		}

		// Add level for easier access, or fall back to 0.
		if (data.attributes.xp)
		{
			data.xp = data.attributes.xp.value ?? 0;
		}
	}

	/**
	 * Prepare NPC roll data.
	 */
	_getNpcRollData(data)
	{
		if (this.data.type !== 'npc') return;

		// Process additional NPC data here.
	}


	showAttributeInfo(name, key, whisper)
	{
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get('core', 'rollMode');
		let label = `<h2><strong>${name}</strong></h2>`;

		const langId = this.getLangId(key) + "Desc";

		let desc = game.i18n.localize(langId) ?? langId;

		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
			flavor: label,
			whisper: whisper ? [game.user.id] : [],
			content: desc ?? ''
		});

	}


	getLangId(key)
	{
		let langId = "";
		for (let [k, v] of Object.entries(CONFIG.SPACE1889.abilities)) 
		{
			if (k == key)
			{
				langId = v;
				break;
			}
		}
		if (langId == "")
		{
			for (let [k, v] of Object.entries(CONFIG.SPACE1889.secondaries)) 
			{
				if (k == key)
				{
					langId = v;
					break;
				}
			}
		}
		if (langId == "")
		{
			langId = "SPACE1889." + key.replace(/^(.)/, function (b) { return b.toUpperCase(); });
		}
		return langId;
	}


	isAbility(key)
	{
		for (let [k, v] of Object.entries(CONFIG.SPACE1889.abilities)) 
		{
			if (k == key)
			{
				return true;
			}
		}
		return false;
	}

	async addDamage(key)
	{
		const data = [{ name: 'Wunde in Bearbeitung', type: 'damage' }];
		const items = await Item.create(data, { parent: this });
		const item = items.shift();

		SPACE1889RollHelper.showDamageDialog(this, item, key == 'lethal')

		//ui.notifications.info(`Sorry, noch nicht implementiert. Kommt hoffentlich bald.`);
	}

	rollPrimary(key, event)
	{
		const dieCount = this.data.data.abilities[key]?.total;
		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(game.i18n.localize(CONFIG.SPACE1889.abilities[key]), key, evaluation.whisperInfo);

		return this.rollAttribute(dieCount, evaluation.showDialog, key, evaluation.specialDialog);
	}

	rollSecondary(key, event)
	{
		const dieCount = this.data.data.secondaries[key]?.total;
		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(game.i18n.localize(CONFIG.SPACE1889.secondaries[key]), key, evaluation.whisperInfo);

		return this.rollAttribute(dieCount, evaluation.showDialog, key);
	}

	rollSkill(key, event)
	{
		const item = this.data.skills.find(e => e.data.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItem(item, this, event);
		}
	}

	rollSpecialization(key, event)
	{
		const item = this.data.speciSkills.find(e => e.data.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItem(item, this, event);
		}
	}

	rollAttack(key, event)
	{
		const item = this.data.weapons.find(e => e.data.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItem(item, this, event);
		}
	}

	rollTalent(key, event)
	{
		const item = this.data.talents.find(e => e.data.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItem(item, this, event);
		}
	}

	rollDefence(key, event)
	{
		let dieCount = 0;
		let label = "";
		switch (key)
		{
			case 'block':
				dieCount = this.data.data.block.value;
				label = game.i18n.localize("SPACE1889.Block");
				break;
			case 'parry':
				dieCount = this.data.data.parry.value;
				label = game.i18n.localize("SPACE1889.Parry");
				break;
			case 'evasion':
				dieCount = this.data.data.evasion.value;
				label = game.i18n.localize("SPACE1889.Evasion");
				break;
			case 'defense':
				dieCount = this.data.data.secondaries.defense.total;
				label = game.i18n.localize("SPACE1889.SecondaryAttributeDef");
				break;
		}

		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(label, key, evaluation.whisperInfo);

		return this.rollAttribute(dieCount, evaluation.showDialog, key);
	}


	/**
	 * 
	 * @param dieCount 
	 * @param showDialog 
	*/
	rollAttribute(dieCount, showDialog, key, specialDialog = false)
	{
		const theActor = this;
		const langId = this.getLangId(key);
		const name = game.i18n.localize(langId) ?? "unbekannt";
		const titelPartOne = game.i18n.localize("SPACE1889.ModifiedRoll");
		const inputDesc = game.i18n.localize("SPACE1889.NumberOfModificationDice");
		const diceDesc = game.i18n.localize("SPACE1889.ConfigDice");

		let info = game.i18n.localize("SPACE1889.Probe") ?? "Probe";
		info += ":";

		const isAbility = this.isAbility(key);
		if (isAbility && !specialDialog)
			dieCount *= 2;
		

		if (showDialog)
		{
			let dialogue = new Dialog(
				{
					title: `${titelPartOne}: ${name} (${dieCount} ${diceDesc})`,
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
							callback: () => { ui.notifications.info("Auch gut, dann wird nicht gew??rfelt...") },
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
			let messageContent = `<div><h2>${name}</h2></div>`;
			const dieType = SPACE1889RollHelper.getDieType();
			messageContent += `${info} <b>[[${wurfelAnzahl}${dieType}]] von ${wurfelAnzahl}</b> <br>`;
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

