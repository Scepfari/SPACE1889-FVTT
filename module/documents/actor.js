import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";
import SPACE1889Healing from "../helpers/healing.js";


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
	}

	/** @override */
	async _onCreate(data, options, userId)
	{
		super._onCreate(data, options, userId);

		const actor = this;

		if (actor.type === "character" && actor.isOwner)
		{
			actor.update({ "prototypeToken.actorLink": true })
		}

		if (actor.type === "character" || actor.type === "npc")
		{
			let resourcePack = game.packs.get("space1889.ressourcen");
			let resources = await resourcePack.getDocuments();
			let toAddItems = [];
			for (let item of resources)
			{
				if (item.system.isBase && actor.items.find(e => e.system.id == item.system.id) == undefined)
					toAddItems.push(item.toObject());
			}

			if (toAddItems.length > 0 && actor.isOwner)
				actor.update({ "items": toAddItems });
		}

		if (actor.type === "creature" && actor.items.size == 0)
		{
			let skillPack = game.packs.get("space1889.fertigkeiten");
			let skills = await skillPack.getDocuments();
			let toAddItems = [];
			for (let item of skills)
			{
				if (item.system.id == "waffenlos")
					toAddItems.push(item.toObject());
				else if (item.system.id == "heimlichkeit")
					toAddItems.push(item.toObject());
				else if (item.system.id == "ueberleben")
					toAddItems.push(item.toObject());
			}

			if (toAddItems.length > 0 && actor.isOwner)
				actor.update({ "items": toAddItems });
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
		const actor = this;
		const flags = actor.flags.space1889 || {};

		if (actor.type == 'vehicle')
			this._prepareVehicleData(actor);
		else
			this._prepareCharacterData(actor);
	}


	/**
	 * Prepare Character type specific data
	 */
	_prepareVehicleData(actor)
	{
		if (actor.type !== 'vehicle')
			return;

		// Make modifications to data here. For example:
		const items = actor.items;

		actor.system.talents = [];
		actor.system.skills = [];
		actor.system.speciSkills = [];
		actor.system.secondaries.defense.total = 0; //toDo mit was sinnvollem füllen
		actor.system.secondaries.perception.total = 0;


		const useCustomValue = actor.system.crew.experience == "custom";
		const defaultValue = useCustomValue ? actor.system.crew.experienceValue : SPACE1889Helper.getCrewExperienceValue(actor.system.crew.experience);
		const mod = SPACE1889Helper.getCrewTemperModificator(actor.system.crew.temper);

		for (let [key, position] of Object.entries(actor.system.positions))
		{
			position.actorName = game.i18n.localize("SPACE1889.VehicleCrew") + " (" + game.i18n.localize(CONFIG.SPACE1889.vehicleCrewPositions[key]) + ")";
			if (position.actorId != "" && game.actors != undefined && position.staffed)
			{
				const posActor = game.actors.get(position.actorId);
				if (posActor)
				{
					position.total = this._GetVehiclePositionSkillValue(actor, key, posActor);
					position.actorName = posActor.name;
					position.mod = 0;
				}
				else
				{
					position.actorName = game.i18n.localize("SPACE1889.VehicleNoActorName");
					position.mod = 0;
					position.total = 0;
				}
			}
			else if (!position.staffed)
			{
				position.actorName = "";
				position.mod = 0;
				position.total = 0;
			}
			else if (useCustomValue)
			{
				if (position.value == 0)
					position.value = defaultValue;
				position.mod = mod;
				position.total = Math.max(0, position.value + mod);
			}
			else
			{
				position.mod = mod;
				position.total = Math.max(0, defaultValue + mod);
			}
			position.label = game.i18n.localize(CONFIG.SPACE1889.vehicleCrewPositions[key]);
		}

		if (actor.system.isStrengthBasedTempo)
		{
			let strValue = Math.round(actor.system.positions.pilot.total / 2);
			if (actor.system.positions.pilot.actorId != "" && game.actors != undefined)
			{
				const pilot = game.actors.get(actor.system.positions.pilot.actorId);
				strValue = pilot.system.abilities.str.total;
			}
			actor.system.speed.max = strValue * actor.system.strengthTempoFactor.value;
		}

		const weapons = [];
		const injuries = [];
		for (let item of items)
		{
			if (item.type === 'weapon')
				weapons.push(item);
			else if (item.type === 'damage')
				injuries.push(item);
		}

		actor.system.injuries = injuries;

		this.prepareVehicleWeapons(actor, weapons);
		actor.system.weapons = weapons;

		for (let injury of injuries)
		{
			const isLethal = injury.system.damageType == "lethal";
			injury.system.remainingDamage = SPACE1889Healing.calcRemainingDamage(injury);
			const healingDurationInDays = (isLethal ? 7 : 1) * injury.system.remainingDamage / injury.system.healingFactor;
			injury.system.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.vehicleDamageTypeAbbreviations[injury.system.damageType]);
			injury.system.healingDuration = this.FormatHealingDuration(healingDurationInDays);
			injury.system.timeToNextCure = (injury.system.remainingDamage != 0 ? this.FormatHealingDuration(healingDurationInDays / injury.system.remainingDamage) : game.i18n.localize("SPACE1889.Repaired"));
		}

		this._CalcVehicleThings(actor);
	}

	_GetVehiclePositionSkillValue(vehicle, position, actorOnPosition)
	{
		if (actorOnPosition == undefined || actorOnPosition == null || actorOnPosition.type == "vehicle")
			return 0;

		if (position == "pilot" || position == "copilot")
		{
			// toDo: Spezialisierung beachten
			if (vehicle.system.pilotSkill == "fahren" || vehicle.system.pilotSkill == "reiten")
				return this.getSkillLevel(actorOnPosition, vehicle.system.pilotSkill, "");

			return this.getSkillLevel(actorOnPosition, vehicle.system.pilotSkill, "", "spezielleFahrzeuge");
		}

		if (position == "captain")
		{
			const first = this.getSkillLevel(actorOnPosition, "diplomatie", "fuehrungsstaerke");
			const second = this.getSkillLevel(actorOnPosition, "einschuechtern", "befehle");
			return Math.max(first, second);
		}
		if (position == "gunner")
		{
			return this.getSkillLevel(actorOnPosition, "geschuetze", "");
		}
		if (position == "signaler")
		{
			return this.getSkillLevel(actorOnPosition, "linguistik", "codes");
		}
		if (position == "lookout")
		{
			return actorOnPosition.system.secondaries.perception.total;
		}
		if (position == "mechanic")
		{
			return this.getSkillLevel(actorOnPosition, "mechaniker", "", "handwerk");
			// alternativ andere Handwerk-Fertigkeiten
		}
		if (position == "medic")
		{
			return this.getSkillLevel(actorOnPosition, "medizin", "ersteHilfe");
		}
		return 0;
	}

	_CalcVehicleThings(actor)
	{
		const crewMax = actor.system.crew.max;
		const crewCurrent = actor.system.crew.value;
		const disabled = game.i18n.localize("SPACE1889.VehicleManeuverabilityDisabledAbbr");
		let isDisabled = false;

		this.CalcAndSetHealth(actor);

		let malus = SPACE1889Helper.getStructureMalus(actor.system.health.value, actor.system.health.max, actor.system.speed.max, actor.system.health.controlDamage, actor.system.health.propulsionDamage);

		actor.system.weaponLoad.max = actor.system.isAirship ? actor.system.size / 2 : actor.system.size;
		actor.system.weaponLoad.maxWithOverload = actor.system.health.max;

		actor.system.weaponLoad.value = this.getWeaponLoad(actor);
		actor.system.weaponLoad.maneuverabilityMalus = 0;
		actor.system.weaponLoad.isOverloaded = false;
		if (actor.system.weaponLoad.value > actor.system.weaponLoad.max)
		{
			actor.system.weaponLoad.maneuverabilityMalus = (actor.system.weaponLoad.max - actor.system.weaponLoad.value) * (actor.system.isAirship ? 2 : 1);
			//ui.notifications?.info(game.i18n.format("SPACE1889.VehicleIsOverloaded", {name: actor.name}));
		}
		if (actor.system.weaponLoad.value > actor.system.weaponLoad.maxWithOverload)
		{
			actor.system.weaponLoad.isOverloaded = true;
			ui.notifications?.info(game.i18n.format("SPACE1889.VehicleExceedingOverloadMax", { name: actor.name }));
		}

		const rate = crewCurrent / crewMax;
		let mod = (-1) * malus.maneuverability;
		if (rate < 1)
		{
			if (rate >= 0.75)
				mod += -1;
			else if (rate >= 0.5)
				mod += -2;
			else if (rate >= 0.25)
				mod += -4;
		}

		if (rate < 0.25 || actor.system.health.value <= 0)
		{
			actor.system.maneuverability.value = disabled;
			isDisabled = true;
		}
		else
			actor.system.maneuverability.value = actor.system.maneuverability.max + mod + actor.system.weaponLoad.maneuverabilityMalus;

		actor.system.speed.value = actor.system.speed.max - malus.speed;

		actor.system.secondaries.initiative.total = isDisabled ? 0 : actor.system.positions.pilot.total + Number(actor.system.maneuverability.value);

		if (!isDisabled && actor.system.positions.copilot.staffed && actor.system.positions.copilot.total >= 4 &&
			(actor.system.positions.copilot.actorId == "" || actor.system.positions.copilot.actorId != actor.system.positions.pilot.actorId))
			actor.system.secondaries.initiative.total += 2;
		if (!isDisabled && actor.system.positions.captain.staffed && actor.system.positions.captain.total >= 4 &&
			(actor.system.positions.captain.actorId == "" || actor.system.positions.captain.actorId != actor.system.positions.pilot.actorId))
			actor.system.secondaries.initiative.total += 2;

		actor.system.secondaries.defense.passiveTotal = this.getPassiveDefense(actor);
		actor.system.secondaries.defense.value = actor.system.secondaries.defense.passiveTotal;
		if (actor.system.maneuverability.value == disabled)
			actor.system.secondaries.defense.total = actor.system.secondaries.defense.passiveTotal;
		else
		{
			actor.system.secondaries.defense.total = actor.system.secondaries.defense.passiveTotal + actor.system.positions.pilot.total + actor.system.maneuverability.value;
			actor.system.secondaries.defense.total = Math.max(actor.system.secondaries.defense.total, actor.system.secondaries.defense.passiveTotal);
		}
		actor.system.secondaries.defense.totalDefense = actor.system.secondaries.defense.total + this.getTotalDefenseBonus(actor);
	}

	getWeaponLoad(actor)
	{
		let load = 0;
		for (let weapon of actor.system.weapons)
		{
			if (weapon.system.location == "lager")
				continue;
			load += weapon.system.size;
		}
		return load;
	}

	/**
	 * Prepare Character type specific data
	 */
	_prepareCharacterData(actor)
	{
		if (actor.type !== 'character' && actor.type !== 'npc' && actor.type !== 'creature')
			return;

		// Make modifications to data here. For example:
		const items = actor.items;

		let primaereAttribute = [];

		// Item Effekte der Talente vorbereiten
		for (let item of items)
		{
			if (item.type === 'talent')
			{
				item.system.level.effectBonus = SPACE1889Helper.getBonusFromEffects("system.level.effectBonus", item.effects);
				item.system.level.total = SPACE1889Helper.constrain(item.system.level.value + this.getAsNumber(item.system.level.effectBonus), item.system.level.min, item.system.level.max);
			}
		}

		for (let [key, ability] of Object.entries(actor.system.abilities))
		{
			ability.talentBonus = this.getBonusFromTalents(key, "ability", items);
			ability.bonus = ability.talentBonus + this.getAsNumber(ability?.effectBonus);
			ability.bonusInfo = this.GetBonusInfo(ability);
			ability.total = ability.value + ability.bonus;
			primaereAttribute.push(key);
		}
		actor.system['primaereAttribute'] = primaereAttribute;

		const armorData = this.getArmorBonusMalus(items);
		if (armorData.malus > 0)
		{
			actor.system.abilities["dex"].bonus -= armorData.malus;
			actor.system.abilities["dex"].total = Math.max(0, actor.system.abilities["dex"].total - armorData.malus);
			actor.system.abilities["dex"].bonusInfo = this.AddBonusInfo("Rüstung", (-1) * armorData.malus, actor.system.abilities["dex"].bonusInfo);
		}
		actor.system.armorTotal = armorData;

		const skills = [];
		const speciSkills = [];
		const talents = [];
		const weapons = [];
		const ammunitions = [];
		const armors = [];
		const gear = [];
		const resources = [];
		const weakness = [];
		const language = [];
		const injuries = [];
		const money = [];
		const containers = [];
		const extendedRolls = [];

		for (let item of items)
		{
			if (item.type === 'skill')
			{
				item.system.talentBonus = this.getBonusFromTalents(item.system.id, item.type, items) + this.getAsNumber(item.system.effectBonus);
				skills.push(item);
			}
			// Append to specialization.
			else if (item.type === 'specialization')
			{
				item.system.talentBonus = this.getBonusFromTalents(item.system.id, item.type, items) + this.getAsNumber(item.system.effectBonus);
				speciSkills.push(item);
			}
			else if (item.type === 'talent')
				talents.push(item);
			else if (item.type === 'weapon')
				weapons.push(item);
			else if (item.type === 'ammunition')
				ammunitions.push(item);
			else if (item.type === 'armor')
				armors.push(item);
			else if (item.type === 'item')
				gear.push(item);
			else if (item.type === 'container')
				containers.push(item);
			else if (item.type === 'damage')
				injuries.push(item);
			else if (item.type === 'resource')
				resources.push(item);
			else if (item.type === 'weakness')
				weakness.push(item);
			else if (item.type === 'language')
				language.push(item);
			else if (item.type === 'currency')
				money.push(item);
			else if (item.type === 'extended_action')
				extendedRolls.push(item);
		}

		SPACE1889Helper.sortByName(skills);
		SPACE1889Helper.sortByName(speciSkills);
		SPACE1889Helper.sortByName(talents);
		SPACE1889Helper.sortByName(resources);
		SPACE1889Helper.sortByName(weakness);
		SPACE1889Helper.sortByName(language);
		SPACE1889Helper.sortByName(ammunitions);
		SPACE1889Helper.sortBySortFlag(gear);
		SPACE1889Helper.sortBySortFlag(containers);
		SPACE1889Helper.sortBySortFlag(money);
		SPACE1889Helper.sortBySortFlag(armors);

		actor.system.talents = talents;
		actor.system.skills = skills;
		actor.system.speciSkills = speciSkills;
		actor.system.injuries = injuries;
		actor.system.armors = armors;
		actor.system.gear = gear;
		actor.system.resources = resources;
		actor.system.weakness = weakness;
		actor.system.language = language;
		actor.system.money = money;
		actor.system.ammunitions = ammunitions;
		actor.system.containers = containers;
		actor.system.weapons = weapons;
		actor.system.extendedRolls = extendedRolls;

		this.CalcAndSetHealth(actor);
		this.CalcContainerLoad(actor);
		this.CalcAndSetLoad(actor);
		if (actor.system.load.dexAndMoveMalus > 0)
		{
			actor.system.abilities["dex"].bonus -= actor.system.load.dexAndMoveMalus;
			actor.system.abilities["dex"].total = Math.max(0, actor.system.abilities["dex"].total - actor.system.load.dexAndMoveMalus);
			actor.system.abilities["dex"].bonusInfo = this.AddBonusInfo("Überladung", (-1) * actor.system.load.dexAndMoveMalus, actor.system.abilities["dex"].bonusInfo);
		}

		actor.system.healthDeduction = 0;

		const deductionTh = SPACE1889Helper.getHealthDeductionThreshold(actor);
		if (deductionTh > actor.system.health.value)
			actor.system.healthDeduction = deductionTh - actor.system.health.value;

		this.calcAndSetSecondaries(actor);

		this.calcAndSetSkillsAndSpecializations(actor)

		this.prepareAmmunition(ammunitions, actor);
		this.prepareWeapons(actor, weapons);
		actor.system.weapons = weapons;

		for (let injury of injuries)
		{
			const isLethal = injury.system.damageType == "lethal";
			const healingDurationInDays = (isLethal ? 7 : 1) * injury.system.remainingDamage / injury.system.healingFactor;
			injury.system.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[injury.system.damageType]);
			injury.system.healingDuration = this.FormatHealingDuration(healingDurationInDays);
			if (injury.system.remainingDamage > 0)
			{
				if (SPACE1889Helper.isDead(actor))
				{
					injury.system.timeToNextCure = game.i18n.localize("SPACE1889.DeadDoNotHeal");
					injury.system.healingDuration = "∞";
				}
				else if (actor.system.healing.currentHealingDamageId != injury.id)
					injury.system.timeToNextCure = game.i18n.localize("SPACE1889.Paused");
				else
				{
					const timeInSeconds = SPACE1889Healing.getHealingTimeInSecondsForNextHealthPoint(injury, actor.system.healing.currentHealingDamageId, actor.system.healing.startOfHealingTimeStamp);
					injury.system.timeToNextCure = this.FormatDuration(timeInSeconds);
				}
			}
			else
				injury.system.timeToNextCure = game.i18n.localize("SPACE1889.HealedOut");
			
			if (actor.system.healing.currentHealingDamageId != injury.id)
			{
				injury.system.tooltipInfo = game.i18n.format("SPACE1889.ActorInjuryToolTip", {
					name: injury.name,
					origDamage: injury.system.damage,
					spReduction: injury.system.stylePointDamageReduction,
					firstAid: (injury.system.firstAidApplied ? injury.system.firstAidHealing : game.i18n.localize("SPACE1889.notCarriedOut")),
					healing: Math.round(injury.system.completedHealingProgress * 10000) / 10000
				});
			}
			else
			{
				const progress = SPACE1889Healing.getHealingProgressOnActivePoint(actor, injury);
				const prozent = Math.round(progress * 10000) / 100;

				injury.system.tooltipInfo = game.i18n.format("SPACE1889.ActorActiveInjuryToolTip", {
					name: injury.name,
					origDamage: injury.system.damage,
					spReduction: injury.system.stylePointDamageReduction,
					firstAid: (injury.system.firstAidApplied ? injury.system.firstAidHealing : game.i18n.localize("SPACE1889.notCarriedOut")),
					healing: Math.floor(injury.system.completedHealingProgress),
					healingProgress: prozent
				});
			}
		}

		if (SPACE1889Helper.isCreature(actor))
		{
			this.setCreatureMovementDisplay(actor);
			this.CalcAndSetEP(actor);
		}
		else
		{
			const lists = [armors, gear];

			for (const list of lists)
			{
				for (let element of list)
				{
					const locationNames = this.getLocation(actor, element.system.containerId);
					element.system.display = locationNames.shortName;
					element.system.locationLong = locationNames.name;
				}
			}

			this._CalcThings(actor);
		}
	}

	/**
	 * 
	 * @param {object} actor
	 */
	calcAndSetSecondaries(actor)
	{
		const system = actor.system;
		system.secondaries.move.value = system.abilities.str.total + system.abilities.dex.total;
		this.fillSecondaryBonus("move", actor, system.secondaries.move);
		system.secondaries.move.total = Math.max(0, system.secondaries.move.value + system.secondaries.move.bonus);

		system.secondaries.perception.value = system.abilities.int.total + system.abilities.wil.total;
		this.fillSecondaryBonus("perception", actor, system.secondaries.perception);
		system.secondaries.perception.total = Math.max(0, system.secondaries.perception.value + system.secondaries.perception.bonus);

		system.secondaries.initiative.value = system.abilities.dex.total + system.abilities.int.total;
		this.fillSecondaryBonus("initiative", actor, system.secondaries.initiative);
		system.secondaries.initiative.total = Math.max(0, system.secondaries.initiative.value + system.secondaries.initiative.bonus);

		system.secondaries.stun.value = Math.max(system.abilities.con.total, SPACE1889Helper.getTalentLevel(actor, "dickkopf") > 0 ? system.abilities.wil.total : 0);
		this.fillSecondaryBonus("stun", actor, system.secondaries.stun);
		system.secondaries.stun.total = Math.max(0, system.secondaries.stun.value + system.secondaries.stun.bonus);

		this.fillSecondaryBonus("size", actor, system.secondaries.size);
		system.secondaries.size.total = system.secondaries.size.value + system.secondaries.size.bonus;

		system.secondaries.defense.value = this.getPassiveDefense(actor) + this.getActiveDefense(actor) - system.secondaries.size.total;
		system.secondaries.defense.armorBonus = system.armorTotal.bonus;
		this.fillSecondaryBonus("defense", actor, system.secondaries.defense);
		system.secondaries.defense.passiveTotal = Math.max(0, this.getPassiveDefense(actor) - system.secondaries.size.total + system.secondaries.defense.armorBonus + this.getAsNumber(system.secondaries.defense?.effectBonus));
		system.secondaries.defense.activeTotal = Math.max(0, this.getActiveDefense(actor) - system.secondaries.size.total - system.healthDeduction);
		const total = system.secondaries.defense.value + system.secondaries.defense.bonus;
		system.secondaries.defense.total = Math.max(0, total);
		system.secondaries.defense.totalDefense = Math.max(0, total + this.getTotalDefenseBonus(actor));
	}

	getAsNumber(value)
	{
		return SPACE1889Helper.getAsNumber(value);
	}

	fillSecondaryBonus(secondaryAttrib, actor, secondaryReference)
	{
		const talentBonus = this.getBonusFromTalents(secondaryAttrib, "secondary", actor.items);
		const effectBonus = this.getAsNumber(secondaryReference?.effectBonus);
		let healthBonus = 0;
		let loadBonus = 0;
		let armorBonus = (secondaryAttrib == "defense" ? secondaryReference.armorBonus : 0);
		if (secondaryAttrib == "move")
		{
			loadBonus -= actor.system.load.dexAndMoveMalus;
			if (actor.system.health.value < 0)
				healthBonus = actor.system.health.value;
		}
		else if (secondaryAttrib != "size" && secondaryAttrib != "stun")
		{
			healthBonus -= actor.system.healthDeduction;
		}

		const bonus = talentBonus + effectBonus + healthBonus + loadBonus + armorBonus;
		let bonusInfo = "";
		if (armorBonus != 0)
			bonusInfo = this.AddBonusInfo(game.i18n.localize("SPACE1889.Armor"), armorBonus, bonusInfo);
		if (talentBonus != 0)
			bonusInfo = this.AddBonusInfo(game.i18n.localize("SPACE1889.TalentPl"), talentBonus, bonusInfo);
		if (effectBonus != 0)
			bonusInfo = this.AddBonusInfo(game.i18n.localize("SPACE1889.EffectPl"), effectBonus, bonusInfo);
		if (healthBonus != 0)
			bonusInfo = this.AddBonusInfo(game.i18n.localize("SPACE1889.Health"), healthBonus, bonusInfo);
		if (loadBonus != 0)
			bonusInfo = this.AddBonusInfo(game.i18n.localize("SPACE1889.LoadingLevel"), loadBonus, bonusInfo);

		secondaryReference.bonus = bonus;
		secondaryReference.bonusInfo = bonusInfo;
	}

	calcAndSetCharacterNpcSiMoveUnits(actor)
	{
		const siMoveDistance = actor.system.secondaries.move.total * 1.5;
		const meter = "m";
		const meterWithSeparator = "m; ";
		const runFactor = SPACE1889Helper.getTalentLevel(actor, "sprinter") > 0 ? 4 : 2;
		const sprintFactor = 4;
		let info = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
		info += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * runFactor).toString() + meterWithSeparator;
		info += game.i18n.localize("SPACE1889.Sprint") + ": " + (siMoveDistance * sprintFactor).toString() + meter;
		actor.system.secondaries.move.inSiUnits = info;
	}


	/**
	 *
	 * @param {object} actor
	 */
	calcAndSetSkillsAndSpecializations(actor)
	{
		for (let skl of actor.system.skills)
		{
			let underlyingAttribute = this._GetAttributeBase(actor, skl);
			skl.system.basis = actor.system.abilities[underlyingAttribute].total;
			skl.system.baseAbilityAbbr = game.i18n.localize(CONFIG.SPACE1889.abilityAbbreviations[underlyingAttribute]);
			let deduction = actor.system.healthDeduction;
			if (skl.system.id == 'heimlichkeit' && actor.system.secondaries.size.total != 0)
				deduction += actor.system.secondaries.size.total;

			if (deduction > 0)
				skl.system.talentBonus -= deduction;

			const rating = skl.system.basis + skl.system.level + skl.system.talentBonus;
			skl.system.rating = Math.max(0, rating);
			if (skl.system.isSkillGroup && skl.system.skillGroupName.length > 0)
				skl.system.skillGroup = game.i18n.localize(CONFIG.SPACE1889.skillGroups[skl.system.skillGroupName]);

			if (skl.system.id == 'sportlichkeit' && skl.system.rating > actor.system.secondaries.move.value)
			{
				actor.system.secondaries.move.value = skl.system.rating;
				actor.system.secondaries.move.total = skl.system.rating + actor.system.secondaries.move.bonus;
			}

			for (let spe of actor.system.speciSkills)
			{
				if (spe.system.underlyingSkillId == skl.system.id)
				{
					spe.system.basis = rating;
					spe.system.rating = Math.max(0, spe.system.basis + spe.system.level + spe.system.talentBonus);
				}
			}
		}

	}

	getLocation(actor, containerId)
	{
		if (containerId && actor)
		{
			for (const container of actor.system.containers)
			{
				if (container._id == containerId)
				{
					const short = container.name.substr(0, 3);
					return { name: container.name, shortName: short };
				}
			}
		}
		return { name: game.i18n.localize("SPACE1889.StorageLocationKoerper"), shortName: game.i18n.localize("SPACE1889.StorageLocationKoerperAbbr") };
	}

	prepareAmmunition(ammunitions, actor)
	{
		for (let ammu of ammunitions)
		{
			const locationNames = this.getLocation(actor, ammu.system.containerId);
			ammu.system.locationDisplay = locationNames.shortName;
			ammu.system.locationDisplayLong = locationNames.name;
			ammu.system.typeDisplay = game.i18n.localize(CONFIG.SPACE1889.weaponAmmunitionTypes[ammu.system.type]);
			ammu.system.capacityTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.ammunitionCapacityTypes[ammu.system.capacityType]);
		}
	}

	/**
	 * 
	 * @param {object} actor
	 * @param {Array<object>} weapons
	 */
	prepareWeapons(actor, weapons)
	{
		let sizeMod = (-1) * actor.system.secondaries.size.total;
		for (let weapon of weapons)
		{
			weapon.system.isRangeWeapon = SPACE1889Helper.isRangeWeapon(weapon);

			this.prepareWeaponAmmunition(weapon, actor);

			if (weapon.system.isRangeWeapon)
			{
				weapon.system.calculatedRange = parseFloat(SPACE1889Helper.replaceCommaWithPoint(weapon.system.range));
				if (weapon.system.ammunition.rangeModFactor > 0)
					weapon.system.calculatedRange *= weapon.system.ammunition.rangeModFactor;

				weapon.system.coneRange = weapon.system.calculatedRange; // wird weder von Talenten noch von Zielfernrohren beeinflusst
				if ((weapon.system.specializationId == "schrotgewehr" && weapon.system.ammunition.currentItemId == "") || weapon.system.ammunition.isShotgunLike)
					weapon.system.templateConeAngle = SPACE1889Helper.getConeAngle(weapon);

				if (weapon.system.hasTelescopicSight && weapon.system.skillId == "schusswaffen")
					weapon.system.calculatedRange *= 2;
				if (SPACE1889Helper.getTalentLevel(actor, "scharfschuetze") > 0)
					weapon.system.calculatedRange *= 2;

				if (weapon.system.capacity == weapon.system.ammunition.remainingRounds)
					weapon.system.ammunition.loadStateDisplay = game.i18n.localize("SPACE1889.InfoWeaponIsReady");
				else if (weapon.system.ammunition.remainingRounds > 0)
					weapon.system.ammunition.loadStateDisplay = game.i18n.localize("SPACE1889.InfoReloadPart");
				else
					weapon.system.ammunition.loadStateDisplay = game.i18n.localize("SPACE1889.InfoReload");

				weapon.system.ammunition.autoReloadRate = SPACE1889Helper.getAutoReloadRate(weapon);

				if (weapon.system.ammunition.currentItemId != "")
					weapon.system.rangeInfo = game.i18n.format("SPACE1889.WeaponRangeInfo", { range: weapon.system.calculatedRange, ammoName: weapon.system.ammunition.name });
				else
				{
					let ammoType = game.i18n.localize(CONFIG.SPACE1889.weaponAmmunitionTypes[weapon.system.ammunition.type]);
					if (weapon.system.ammunition.caliber != "")
						ammoType += " (" + weapon.system.ammunition.caliber + ")";
					weapon.system.rangeInfo = game.i18n.format("SPACE1889.WeaponRangeInfo2", { range: weapon.system.calculatedRange, ammo: ammoType });
				}
			}

			if (weapon.system.skillId == "none" && weapon.system.isAreaDamage)
			{
				weapon.system.sizeMod = "-";
				weapon.system.skillRating = "-";
				weapon.system.attack = weapon.system.damage;
				weapon.system.attackAverage = (Math.floor(weapon.system.attack / 2)).toString() + (weapon.system.attack % 2 == 0 ? "" : "+");
			}
			else
			{
				weapon.system.sizeMod = sizeMod;
				weapon.system.skillRating = this.getSkillLevel(actor, weapon.system.skillId, weapon.system.specializationId);
				const attackBonusFromDamage = (weapon.system.isAreaDamage && actor.type != 'vehicle') ? 0 : weapon.system.damage;
				const ammoBonus = weapon.system.ammunition?.damageMod ? weapon.system.ammunition.damageMod : 0;
				let offhandMod = ((actor.type == "character" || actor.type == "npc") && weapon.system.usedHands == "offHand" && SPACE1889Helper.getTalentLevel(this, "beidhaendig") == 0) ? -2 : 0;
				weapon.system.attack = Math.max(0, attackBonusFromDamage + weapon.system.skillRating + weapon.system.sizeMod + ammoBonus + offhandMod);
				weapon.system.attackAverage = (Math.floor(weapon.system.attack / 2)).toString() + (weapon.system.attack % 2 == 0 ? "" : "+");
			}
			const damageType = weapon.system.ammunition?.damageType ? weapon.system.ammunition.damageType : weapon.system.damageType;
			weapon.system.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[damageType]);
			if (!SPACE1889Helper.isCreature(actor))
			{
				const locationNames = this.getLocation(actor, weapon.system.containerId);
				weapon.system.locationDisplay = locationNames.shortName;
				weapon.system.locationDisplayLong = locationNames.name;
				weapon.system.usedHandsInfo = game.i18n.localize(CONFIG.SPACE1889.weaponHand[weapon.system.usedHands]);
				weapon.system.usedHandsIcon = game.i18n.localize(CONFIG.SPACE1889.weaponHandIcon[weapon.system.usedHands]);
			}
		}

		SPACE1889Helper.sortBySortFlag(weapons);
	}

	prepareWeaponAmmunition(weapon, actor)
	{
		if (!weapon || !weapon.system.ammunition)
			return;

		delete weapon.system.ammunition.damageMod;
		delete weapon.system.ammunition.rangeModFactor;
		delete weapon.system.ammunition.damageType;
		delete weapon.system.ammunition.isShotgunLike;

		if (!actor || !actor.system.ammunitions || actor.system.ammunitions.length == 0 || !weapon.system.isRangeWeapon)
			return;

		let list = [];
		for (let ammo of actor.system.ammunitions)
		{
			let capacityType = SPACE1889Helper.getAmmunitionCapacityType(weapon);
			if (weapon.system.ammunition.type == ammo.system.type && capacityType == ammo.system.capacityType && weapon.system.ammunition.caliber == ammo.system.caliber)
				list.push(ammo);
		}

		weapon.system.ammunition.ammos = list;
		weapon.system.ammunition.display = "";

		let currentAmmo = weapon.system.ammunition.ammos.find(x => x._id == weapon.system.ammunition.currentItemId);
		if (currentAmmo)
		{
			weapon.system.ammunition.damageMod = currentAmmo.system.damageModifikator;
			weapon.system.ammunition.rangeModFactor = currentAmmo.system.rangeModFactor;
			weapon.system.ammunition.damageType = currentAmmo.system.damageType;
			weapon.system.ammunition.isShotgunLike = currentAmmo.system.isConeAttack;
			weapon.system.ammunition.display = "(" + currentAmmo.system.quantity.toString() + "x) " + currentAmmo.name;
			weapon.system.ammunition.name = currentAmmo.name;
		}
		else
			weapon.system.ammunition.currentItemId = "";
	}

	/**
	 * 
	 * @param {object} actor
	 * @param {Array<object>} weapons
	 */
	prepareVehicleWeapons(actor, weapons)
	{
		let gunner = null;
		if (actor.system.positions.gunner.actorId != "" && game.actors != undefined)
			gunner = game.actors.get(actor.system.positions.gunner.actorId);

		const useGunner = gunner != undefined && gunner != null;

		for (let weapon of weapons)
		{
			weapon.system.calculatedRange = parseFloat(SPACE1889Helper.replaceCommaWithPoint(weapon.system.range));
			if (weapon.system.skillId == "none" && weapon.system.isAreaDamage)
			{
				weapon.system.sizeMod = "-";
				weapon.system.skillRating = "-";
				weapon.system.attack = weapon.system.damage;
				weapon.system.attackAverage = (Math.floor(weapon.system.attack / 2)).toString() + (weapon.system.attack % 2 == 0 ? "" : "+");
			}
			else
			{
				weapon.system.sizeMod = 0;
				weapon.system.skillRating = useGunner ? this.getSkillLevel(gunner, weapon.system.skillId, weapon.system.specializationId) : actor.system.positions.gunner.total;
				weapon.system.attack = Math.max(0, weapon.system.damage + weapon.system.skillRating);
				weapon.system.attackAverage = (Math.floor(weapon.system.attack / 2)).toString() + (weapon.system.attack % 2 == 0 ? "" : "+");
			}
			weapon.system.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[weapon.system.damageType]);

			if (weapon.system.location != "lager" && weapon.system.location != "mounted")
				weapon.system.location = "mounted";

			weapon.system.locationDisplay = game.i18n.localize(CONFIG.SPACE1889.allStorageLocationsAbbreviations[weapon.system.location]);
			weapon.system.locationDisplayLong = game.i18n.localize(CONFIG.SPACE1889.allStorageLocations[weapon.system.location]);

			if (weapon.system.location == "mounted")
			{
				const mountPos = game.i18n.localize(CONFIG.SPACE1889.weaponMountSpots[weapon.system.vehicle.spot]);
				if (weapon.system.vehicle.isSwivelMounted)
					weapon.system.vehicleInfo = game.i18n.format("SPACE1889.VehicleInfoSwivelMountPos", { spot: mountPos, swivelingRange: weapon.system.vehicle.swivelingRange });
				else
					weapon.system.vehicleInfo = game.i18n.format("SPACE1889.VehicleInfoRigidlyMountPos", { spot: mountPos });
			}
			else
			{
				weapon.system.vehicleInfo = game.i18n.localize("SPACE1889.VehicleInfoNotMounted");
			}
		}

		SPACE1889Helper.sortByName(weapons);
	}


	/**
	 * 
	 * @param {object} actor
	 */
	setCreatureMovementDisplay(actor)
	{
		if (actor.type != "creature")
			return;

		const system = actor.system;
		let movement = "";
		let siUnits = "";
		const siMoveDistance = system.secondaries.move.total * 1.5;
		const meter = "m";
		const meterWithSeparator = "m; ";
		switch (system.movementType)
		{
			case "amphibious":
			case "flying":
				{
					const second = Math.floor(system.secondaries.move.total / 2);
					movement = system.secondaries.move.total.toString() + " (" + second.toString() + ")";
					siUnits = game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[system.movementType]) + ": ";
					siUnits += siMoveDistance.toString() + meterWithSeparator;
					siUnits += ((system.movementType == "flying") ? game.i18n.localize("SPACE1889.OnTheGround") : game.i18n.localize("SPACE1889.OnLand")) + ": ";
					siUnits += (siMoveDistance / 2).toString() + meter;
				}
				break;
			case "fossorial":
				movement = system.secondaries.move.total.toString() + " (" + (system.secondaries.move.total * 2).toString() + ")";
				siUnits = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * 2).toString() + meterWithSeparator;
				siUnits += game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[system.movementType]) + ": ";
				siUnits += (system.secondaries.move.total * 2 * 0.3).toString() + "m/h";
				break;
			case "jumper":
			case "manylegged":
				movement = system.secondaries.move.total.toString() + " (" + (system.secondaries.move.total * 2).toString() + ")";
				siUnits = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * 4).toString() + meter;
				break;
			case "swimming":
				movement = (system.secondaries.move.total * 2).toString() + " (0)";
				siUnits = game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[system.movementType]) + ": ";
				siUnits += (siMoveDistance * 2).toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.OnLand") + ": 0m";
				break;
			case "immobile":
				movement = "0";
				siUnits += game.i18n.localize("SPACE1889.CreatureMovementTypeImmobile") + ": 0m";
				break;
			default:
				movement = system.secondaries.move.total.toString();
				this.calcAndSetCharacterNpcSiMoveUnits(actor)
				break;
		}

		system.secondaries.move.display = movement;
		if (system.movementType != "ground")
			system.secondaries.move.inSiUnits = siUnits;
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
			if (item.type != "talent")
				continue;

			if (item.system.bonusTargetType == type && item.system.bonusTarget == whatId)
			{
				const level = item.system.level.total ?? item.system.level.value;
				let factor = level;
				if (item.system.bonusStartLevel > 1)
					factor = Math.max(0, level + 1 - item.system.bonusStartLevel);
				bonus += (factor * item.system.bonus);
			}
		}

		return bonus;
	}

	GetBonusInfo(ability)
	{
		const effectBonus = this.getAsNumber(ability?.effectBonus);
		if (ability.talentBonus == 0 && effectBonus == 0)
			return "";

		let info = "";
		if (ability.talentBonus != 0)
			info = this.AddBonusInfo(game.i18n.localize("SPACE1889.TalentPl"), ability.talentBonus, info);
		if (effectBonus != 0)
			info = this.AddBonusInfo(game.i18n.localize("SPACE1889.EffectPl"), effectBonus, info);

		return info;
	}

	AddBonusInfo(name, value, baseInfo)
	{
		const info = (baseInfo.length > 0 ? baseInfo + "\n" : "") + name + ": " + SPACE1889Helper.getSignedStringFromNumber(value);
		return info;
	}

	getActiveDefense(actor)
	{
		let active = actor.system.abilities.dex.total;

		if (this.HasNoActiveDefense(actor))
			active = 0;
		else
		{
			for (let item of actor.items)
			{
				if (item.type != 'talent')
					continue;

				if (item.system.id == 'berechneteAbwehr')
					active = actor.system.abilities.int.total;
				else if (item.system.id == 'strahlendeAbwehr')
					active = actor.system.abilities.cha.total;
			}
		}

		return active;
	}

	getPassiveDefense(actor)
	{
		if (actor.type != "vehicle")
		{
			let passive = actor.system.abilities.con.total;

			for (let item of actor.items)
			{
				if (item.type != 'talent')
					continue;

				if (item.system.id == 'kraftvolleAbwehr')
					passive = actor.system.abilities.str.total;
				else if (item.system.id == 'ueberzeugteAbwehr')
					passive = actor.system.abilities.wil.total;
			}
			return passive;
		}
		else
		{
			if (actor.system.health.value < 0)
				return actor.system.passiveDefense + actor.system.health.value;
			else
				return actor.system.passiveDefense;
		}
	}

	getTotalDefenseBonus(actor)
	{
		return this.HasNoActiveDefense(actor) ? 0 : 4;
	}

	getArmorBonusMalus(items)
	{
		let dexMalus = 0;
		let defenseBonus = 0;
		for (let item of items)
		{
			if (item.type != "armor")
				continue;

			if (item.system.containerId == null)
			{
				defenseBonus += item.system.defenseBonus;
				dexMalus += item.system.dexPenalty;
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
	 * @param {Object} actor
	 * @param {Object} skill
	 * @returns {string} abilityKey
	 */
	_GetAttributeBase(actor, skill)
	{
		for (let talent of actor.system.talents)
		{
			if (talent.system.changedSkill === skill.system.id && talent.system.newBase !== "") //besser prüfen obs eine der 6 primären Attribute ist
				return talent.system.newBase;
		}
		return skill.system.underlyingAttribute;
	}


	/**
	 * 
	 * @param {Object} actor 
	 * @param {string} skillId 
	 * @param {string} specializationId
	 * @param {string} skillGroupId
	 * @returns {number}
	 */
	getSkillLevel(actor, skillId, specializationId, skillGroupId = "")
	{
		if (actor.system.speciSkills)
		{
			for (let speci of actor.system.speciSkills)
			{
				if (specializationId === speci.system.id)
					return speci.system.rating;
			}
		}

		let skillGroups = [];
		if (actor.system.skills)
		{
			for (let skill of actor.system.skills)
			{
				if (skillId === skill.system.id)
					return skill.system.rating;
				if (skill.system.isSkillGroup && skillGroupId === skill.system.skillGroupName)
					skillGroups.push(skill);
			}
		}

		if (skillGroupId !== "")
		{
			let rating = 0;

			if (skillGroups.length === 0)
			{
				// kein Fachbereich aus der Fertigkeitsgruppe gelernt
				const uni = actor.system.talents?.find(v => v.system.id === "universalist");
				if (uni != undefined && uni != null)
				{
					rating = this.GetSkillRating(actor, skillId, "");  // Funktion behandelt fertigkeitsgruppen wie fertigkeiten
					rating += (uni.system.level - 1);
				}
				return rating;
			}

			for (let skill of skillGroups)
			{
				if (skill.system.rating > rating)
					rating = skill.system.rating;
			}

			const vielseitigId = "vielseitig" + skillGroupId.replace(/^(.)/, function (b) { return b.toUpperCase(); });
			const talent = actor.system.talents.find(v => v.system.id == vielseitigId);
			let malus = 2;
			if (talent != undefined && talent != null)
				malus = 0;

			return Math.max(0, rating - malus);
		}

		return this.GetSkillRating(actor, skillId, "");
	}

	_CalcThings(actor)
	{
		actor.system.foreignLanguageLimit = this.GetForeignLanguageLimit(actor);
		this.CalcAndSetBlockData(actor);
		this.CalcAndSetParryData(actor);
		this.CalcAndSetEvasionData(actor);
		this.CalcAndSetEP(actor);
		this.calcAndSetCharacterNpcSiMoveUnits(actor);
	}

	_GetId(item)
	{
		if (item != null)
			return item.system.id;
		return "";
	}

	GetForeignLanguageLimit(actor)
	{
		let linguistikId = "linguistik";
		let underlyingAbility = "int";
		let rating = this.GetSkillRating(actor, linguistikId, underlyingAbility);

		var isHausregel = game.settings.get("space1889", "improvedForeignLanguageCountCalculation");

		if (rating >= 10)
			return ((rating - 10) * 4) + 16;
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


	HasNoActiveDefense(actor)
	{
		const statusIds = SPACE1889RollHelper.getActiveEffectStates(actor);
		return statusIds.includes("paralysis") || statusIds.includes("noActiveDefense") || statusIds.includes("unconscious");
	}

	isStunned()
	{
		const statusIds = SPACE1889RollHelper.getActiveEffectStates(this);
		return statusIds.includes("stun");
	}

	CalcAndSetBlockData(actor)
	{
		if (this.HasNoActiveDefense(actor))
		{
			actor.system.block.value = 0;
			actor.system.block.instinctive = false;
			actor.system.block.riposte = false;
			actor.system.block.info = game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.format("SPACE1889.Block") });
			return;
		}

		const id = "waffenlos";
		let underlyingAbility = "str";
		let rating = this.GetSkillRating(actor, id, underlyingAbility);
		let instinctive = false;
		let riposte = false;
		rating += actor.system.armorTotal.bonus;

		for (let item of actor.items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.id == "blocken")
			{
				instinctive = true;
				rating += item.system.level.total;
			}
			else if (item.system.id == "gegenschlag" && item.system.level.total > 0)
			{
				rating += (item.system.level.total - 1) * 2;
				riposte = true;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			rating += this.getPassiveDefense(actor);

		rating = Math.max(0, rating);
		actor.system.block.value = rating;
		actor.system.block.instinctive = instinctive;
		actor.system.block.riposte = riposte;
		actor.system.block.info = "";
		const defense = actor.system.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Block");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defense < rating)
				actor.system.block.info = game.i18n.format("SPACE1889.UseInstinctiveBlockParry", { rating: rating.toString(), rating2: (rating - 2).toString(), attackType1: waffenlos, attackType2: nahkampf, defence: defense.toString() });
			else
				actor.system.block.info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			const tdb = this.getTotalDefenseBonus(actor);
			if (defense + tdb < rating)
				actor.system.block.info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defense + tdb).toString(), talentName: name });
			else
				actor.system.block.info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defense + tdb).toString(), talentName: name });
		}
	}

	CalcAndSetParryData(actor)
	{
		if (this.HasNoActiveDefense(actor))
		{
			actor.system.parry.value = 0;
			actor.system.parry.instinctive = false;
			actor.system.parry.riposte = false;
			actor.system.parry.info = game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.format("SPACE1889.Parry") });
			return;
		}

		const id = "nahkampf";
		let skillRating = 0;
		let riposteDamageType = "nonLethal";
		for (let weapon of actor.system.weapons)
		{
			if (weapon.system.usedHands == "none")
				continue;
			if (weapon.system.skillId == id && weapon.system.skillRating > skillRating)
			{
				skillRating = weapon.system.skillRating;
				riposteDamageType = weapon.system.ammunition?.damageType ? weapon.system.ammunition.damageType : weapon.system.damageType;
			}
		}

		const noWeapon = skillRating == 0;
		let instinctive = false;
		let riposte = false;
		if (!noWeapon)
		{
			skillRating += actor.system.armorTotal.bonus;

			for (let item of actor.items)
			{
				if (item.type != "talent")
					continue;

				if (item.system.id == "parade")
				{
					instinctive = true;
					skillRating += item.system.level.total;
				}
				else if (item.system.id == "riposte" && item.system.level.total > 0)
				{
					skillRating += (item.system.level.total - 1) * 2;
					riposte = true;
				}
			}

			if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
				skillRating += this.getPassiveDefense(actor);
		}

		skillRating = Math.max(0, skillRating);
		actor.system.parry.value = skillRating;
		actor.system.parry.instinctive = instinctive;
		actor.system.parry.riposte = riposte;
		actor.system.parry.riposteDamageType = riposteDamageType;
		actor.system.parry.info = "";
		const defense = actor.system.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Parry");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defense < skillRating)
				actor.system.parry.info = game.i18n.format("SPACE1889.UseInstinctiveBlockParry", { rating: skillRating.toString(), rating2: skillRating.toString(), attackType1: nahkampf, attackType2: waffenlos, defence: defense.toString() });
			else
				actor.system.parry.info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			const tdb = this.getTotalDefenseBonus(actor);
			if (noWeapon)
				actor.system.parry.info = game.i18n.localize("SPACE1889.NoParryWithoutWeapon");
			else if (defense + tdb < skillRating)
				actor.system.parry.info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defense + tdb).toString(), talentName: name });
			else
				actor.system.parry.info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defense + tdb).toString(), talentName: name });
		}
	}

	CalcAndSetEvasionData(actor)
	{
		if (this.HasNoActiveDefense(actor))
		{
			actor.system.evasion.value = 0;
			actor.system.evasion.instinctive = false;
			actor.system.evasion.info = game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.format("SPACE1889.Evasion") });
			return;
		}

		const id1 = "sportlichkeit";
		const id2 = "akrobatik";
		let underlyingAbility1 = "str";
		let underlyingAbility2 = "dex";
		let instinctive = false;
		let rating = this.GetSkillRating(actor, id1, underlyingAbility1);
		rating = Math.max(rating, this.GetSkillRating(actor, id2, underlyingAbility2));
		rating += actor.system.armorTotal.bonus;

		for (let item of actor.items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.id == "ausweichen")
			{
				instinctive = true;
				rating += item.system.level.total;
				break;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			rating += this.getPassiveDefense(actor);

		rating = Math.max(0, rating);
		actor.system.evasion.value = rating;
		actor.system.evasion.instinctive = instinctive;

		actor.system.evasion.info = "";
		const defense = actor.system.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Evasion");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defense < rating)
				actor.system.evasion.info = game.i18n.format("SPACE1889.UseInstinctiveEvasion", { rating: rating.toString(), defence: defense.toString() });
			else
				actor.system.evasion.info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			const tdb = this.getTotalDefenseBonus(actor);
			if (defense + tdb < rating)
				actor.system.evasion.info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defense + tdb).toString(), talentName: name });
			else
				actor.system.evasion.info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defense + tdb).toString(), talentName: name });
		}
	}

	async CalcContainerLoad(actor)
	{
		if (!SPACE1889Helper.hasOwnership(actor))
			return;

		for (let container of actor.system.containers)
		{
			let load = 0;
			const quantityLists = [actor.system.gear, actor.system.ammunitions];
			for (let list of quantityLists)
			{
				for (let item of list)
				{
					if (item.system.containerId == container._id)
						load += item.system.weight * item.system.quantity;
				}
			}
			const nonQuantityLists = [actor.system.armors, actor.system.weapons];
			for (let liste of nonQuantityLists)
			{
				for (let item of liste)
				{
					if (item.system.containerId == container._id)
						load += item.system.weight;
				}
			}
			const total = load + container.system.weight;
			if (container.system.payloadWeight != load || container.system.totalWeight != total)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: container._id, "system.payloadWeight": load, "system.totalWeight": total }]);
			}
		}
	}

	CalcAndSetLoad(actor)
	{
		const gravity = SPACE1889Helper.getGravity();
		actor.system.gravity = gravity;
		const gravityFactor = actor.system.gravity.gravityFactor;

		let str = actor.system.abilities["str"].total;

		for (let item of actor.items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.id == "packesel")
			{
				str += item.system.level.total;
				break;
			}
		}

		if (actor.system.health.value < 0)
			str = Math.max(0, str + actor.system.health.value);

		let levels = [4, 10, 20, 40, 100, 150, 250, 300, 350, 400, 450, 500];
		str = Math.max(str, 1);
		str = Math.min(str, 10);

		let loadBody = 0;
		let loadCarriedBackpack = 0;
		let loadStorage = 0;
		let itemWeight = 0;
		for (let item of actor.items)
		{
			if (item.type == "item" || item.type == "ammunition")
				itemWeight = item.system.weight * item.system.quantity;
			else if (item.type == "weapon" && item.system.skillId == "geschuetze" && item.system.location == 'mounted')
				continue;
			else if (item.type == "weapon" || item.type == "armor")
				itemWeight = item.system.weight;
			else
				continue;

			if (item.system.containerId == null)
				loadBody += itemWeight;
		}
		itemWeight *= gravityFactor;
		loadBody *= gravityFactor;

		for (let container of actor.system.containers)
		{
			if (!container.system.portable)
				loadStorage += container.system.totalWeight;
			else
			{
				if (container.system.carried)
					loadCarriedBackpack += container.system.totalWeight;
				else
					loadStorage += container.system.totalWeight;
			}
		}
		
		loadCarriedBackpack *= gravityFactor;

		let bodyLoadLevel = this.GetLoadingLevel(loadBody, levels[str - 1], levels[str], levels[str + 1]);
		let bodyAndBackpackLoadLevel = this.GetLoadingLevel(loadBody + loadCarriedBackpack, levels[str - 1], levels[str], levels[str + 1]);

		let loadInfo = {
			bodyLoad: loadBody.toFixed(2),
			bodyLoadLevel: bodyLoadLevel,
			bodyLoadConsequence: bodyLoadLevel + "Consequence",
			backpackLoad: loadCarriedBackpack.toFixed(2),
			bodyAndBackpackLoad: (loadBody + loadCarriedBackpack).toFixed(2),
			bodyAndBackpackLoadLevel: bodyAndBackpackLoadLevel,
			dexAndMoveMalus: this.GetMalusFromLoadLevel(bodyAndBackpackLoadLevel),
			bodyAndBackpackLoadConsequence: bodyAndBackpackLoadLevel + "Consequence",
			storageLoad: loadStorage.toFixed(2),
			lightLoad: levels[str - 1],
			mediumLoad: levels[str],
			havyLoad: levels[str + 1],
			maxLoad: 2 * levels[str + 1]
		}

		actor.system.load = loadInfo;
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

	GetMalusFromLoadLevel(loadLevel)
	{
		if (loadLevel == "SPACE1889.MediumLoad")
			return 1;
		if (loadLevel == "SPACE1889.HavyLoad")
			return 2;
		if (loadLevel == "SPACE1889.MaxLoad")
			return 4;
		if (loadLevel == "SPACE1889.ImpossibleLoad")
			return 100;
		return 0;
	}

	/**
	* Falls der Skill im Charakter enthalten ist liefert die funktion das Rating zurück
	* Ist der Skill nicht enthalten dann wird auf das Primäre Atribut zurückgeriffen und das Abzüglich 2 zurückgeliefert
	* @param {object} actor
	* @param {string} skillId  
	* @param {string} underlyingAbility
	* @returns {number}
	*/
	GetSkillRating(actor, skillId, underlyingAbility)
	{
		let rating = 0;

		let skill = actor.system.skills?.find(entry => entry.system.id == skillId);
		if (skill != null && skill != undefined)
			return skill.system.rating;

		if (underlyingAbility != "" && actor.system.primaereAttribute?.indexOf(underlyingAbility) >= 0)
			return Math.max(0, actor.system.abilities[underlyingAbility].total - 2);

		let underlying = this.FindUnderlyingAbility(actor, skillId);
		if (underlying != "")
			return Math.max(0, actor.system.abilities[underlying].total - 2);
		return 0;
	}

	/**
	 * 
	 * @param actor
	 * @param skillId
	 * @returns {string} 
	 */
	FindUnderlyingAbility(actor, skillId)
	{
		//Talente überprüfen ob ein rerouting auf ein anderes Attribut aktiv ist
		const talent = actor.system.talents?.find(t => t.system.changedSkill == skillId && t.system.newBase != "");
		if (talent != undefined)
			return talent.system.newBase;

		const element = CONFIG.SPACE1889.skillUnderlyingAttribute?.find(e => e[0] === skillId);
		if (element != undefined)
			return element[1];

		ui.notifications?.info("Fertigkeit " + skillId.toString() + " ist nicht im Compendium, darauf basierende Berechnungen der Waffenstärke können falsch sein.");

		return "";

		//ToDo: für neue Benutzerfertigkeiten funktioniert das nicht, da die nicht in der Liste enthalten sind
		// über die Game Items kann man zu dem Zeitpunkt noch nicht suchen, da die noch nicht angelegt sind
		// dafür müsste die funktion zu einem späteren Zeitpunkt noch aufgerufen werden
		/*
				skill = game.items.find(entry => entry.system.id == skillId);
				if (skill != null && skill != undefined)
					return skill.system.underlyingAttribute;
				return "";*/
	}

	/**
	 * @returns {boolean} 
	 */
	isSwarm()
	{
		return undefined !== this.system.talents?.find(t => t.system.id == "schwarm");
	}

	/**
	 * 
	 * @param actor
	 */
	CalcAndSetEP(actor)
	{
		let xp = 0;
		const baseXp = 15; //talent, resource
		const houseRoule = this.IsHouseRouleXpCalculationActive();
		let primaryBaseXp = houseRoule ? 10 : 5;

		xp += this.CalcPartialSum(actor.system.abilities["con"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actor.system.abilities["dex"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actor.system.abilities["str"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actor.system.abilities["cha"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actor.system.abilities["int"].value) * primaryBaseXp;
		xp += this.CalcPartialSum(actor.system.abilities["wil"].value) * primaryBaseXp;

		for (let item of actor.items)
		{
			if (item.type == "skill")
			{
				xp += this.CalcPartialSum(item.system.level) * 2;
			}
			else if (item.type == "specialization")
			{
				if (houseRoule)
					xp += this.CalcPartialSum(item.system.level);
				else
					xp += item.system.level * 3;
			}
			else if (item.type == "talent")
			{
				xp += item.system.level.value * baseXp;
			}
			else if (item.type == "resource")
			{
				if (item.system.noEp)
					continue;
				if (item.system.isBase)
				{
					if (item.system.level.value >= 1)
					{
						xp += 8 + ((item.system.level.value - 1) * baseXp);
					}
					else if (item.system.level.value <= -1)
					{
						xp += -8 + ((item.system.level.value + 1) * baseXp);
					}
				}
				else
				{
					if (item.system.level.value == 0)
						xp += 7;
					else
						xp += (item.system.level.value * baseXp);
				}
			}
		}

		if (actor.type == 'character')
		{
			actor.system.attributes.xp.used = xp;
			actor.system.attributes.xp.available = actor.system.attributes.xp.value - xp;
		}
		else
			actor.system.powerEquivalentInXp = xp;
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
		// ToDo:  wie definiert man die Nulllinie für EP mit der Punktregel bei der Charaktererzeugung?

		return game.settings.get("space1889", "improvedEpCalculation");
	}

	CalcAndSetHealth(actor)
	{
		let damage = 0;
		let controlDamage = 0;
		let propulsionDamage = 0;
		let gunDamage = 0;

		for (const injury of actor.system.injuries)
		{
			injury.system.remainingDamage = SPACE1889Healing.calcRemainingDamage(injury);
			const healthOrStructureDamage = this.GetDamageFromType(injury.system.remainingDamage, injury.system.damageType, actor.type);

			damage += healthOrStructureDamage;

			if (actor.type == "vehicle")
			{
				switch (injury.system.damageType)
				{
					case "controls":
						controlDamage += (2 * injury.system.remainingDamage) - healthOrStructureDamage;
						break;
					case "propulsion":
						propulsionDamage += (2 * injury.system.remainingDamage) - healthOrStructureDamage;
						break;
					case "guns":
						gunDamage += damage;
						break;
					case "crew":
						crewDamage += injury.system.remainingDamage;
						break;
				}
			}
		}

		if (actor.type != "vehicle")
		{
			const sizeTotal = actor.system.secondaries.size.value + this.getBonusFromTalents("size", "secondary", actor.items);
			actor.system.health.max = actor.system.abilities.con.total + actor.system.abilities.wil.total + sizeTotal + this.getBonusFromTalents("max", "health", actor.items);
		}
		const newHealth = actor.system.health.max - damage;

		actor.system.health.value = newHealth;
		if (actor.type == "vehicle")
		{
			actor.system.health.controlDamage = controlDamage;
			actor.system.health.propulsionDamage = propulsionDamage;
			actor.system.health.gunDamage = gunDamage;
		}
	}

	GetDamageFromType(damage, damageType, actorType)
	{
		if (actorType != "vehicle" || damageType == "lethal")
			return damage;

		return Math.floor(damage / 2);
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
		const seconds = Math.floor((((hours - completeHours) * 60) - minutes) * 60);
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
		if (seconds > 0)
		{
			duration += seconds.toString() + "s";
		}

		return duration;
	}

	FormatDuration(durationInSeconds)
	{
		const days = Math.abs(Math.trunc(durationInSeconds / 86400));
		let restTime = durationInSeconds - (days * 86400);
		const hours = Math.abs(Math.trunc(restTime / 3600));
		restTime -= hours * 3600;
		const minutes = Math.abs(Math.trunc(restTime / 60));
		restTime -= minutes * 60;
		const seconds = Math.abs(Math.round(restTime));
		let duration = "";

		if (days > 0)
			duration = days.toString() + "d ";
		if (hours > 0 )
			duration += hours.toString() + "h ";
		if (minutes > 0)
			duration += minutes.toString() + "m ";
		if (seconds > 0)
			duration += seconds.toString() + "s";

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
		if (this.type !== 'character') return;

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
		if (this.type !== 'npc') return;

		// Process additional NPC data here.
	}

	getAbilityInfoText(key, forChat = false)
	{
		const headerClass = forChat ? "" : "class=\"itemTooltipH3\"";
		const textClass = forChat ? "" : "itemTooltip";
		const langId = this.getLangId(key) + "Desc";
		const desc = game.i18n.localize(langId) ?? langId;
		const name = game.i18n.localize(CONFIG.SPACE1889.abilities[key]);
		const type = game.i18n.localize("SPACE1889.PreConTypePrimary");

		const composition =
			`<h3 ${headerClass}><strong>${name}</strong> <small>[${type}]</small></h3><div class="${textClass}">${desc}</div>`;
		return composition;
	}

	getSecondaryInfoText(key, forChat = false)
	{
		const headerClass = forChat ? "" : "class=\"itemTooltipH3\"";
		const textClass = forChat ? "" : "itemTooltip";
		const langId = this.getLangId(key) + "Desc";
		const desc = game.i18n.localize(langId) ?? langId;
		const name = game.i18n.localize(CONFIG.SPACE1889.secondaries[key]);
		const type = game.i18n.localize("SPACE1889.PreConTypeSecondary");
		let moveExtra = "";

		if (key === "move")
			moveExtra = `<h3 ${headerClass}>${this.system.secondaries.move.inSiUnits}</h3>`;

		const composition =
			`<h3 ${headerClass}><strong>${name}</strong> <small>[${type}]</small></h3>${moveExtra}<div class="${textClass}">${desc}</div>`;
		return composition;
	}

	getOtherInfoText(key, forChat = false)
	{
		const headerClass = forChat ? "" : "class=\"itemTooltipH3\"";
		const textClass = forChat ? "" : "itemTooltip";
		const langId = "SPACE1889." + key + "Desc";
		const desc = game.i18n.localize(langId) ?? langId;
		const name = game.i18n.localize("SPACE1889." + key);

		const composition =
			`<h3 ${headerClass}><strong>${name}</strong></h3><div class="${textClass}">${desc}</div>`;
		return composition;
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
				return v;
			}
		}
		for (let [k, v] of Object.entries(CONFIG.SPACE1889.secondaries)) 
		{
			if (k == key)
			{
				return v;
			}
		}

		for (let [k, v] of Object.entries(CONFIG.SPACE1889.vehicleCrewPositions))
		{
			if (k == key)
			{
				return v;
			}
		}

		if (key == 'totalDefense')
			return "SPACE1889.TotalDefense";
		if (key == 'passiveDefense')
			return "SPACE1889.PassiveDefense";
		if (key == 'activeDefense')
			return "SPACE1889.ActiveDefense";
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

	/**
	 * 
	 * @param {number} attackInCombatRound
	 */
	getDefenseMalus(attackInCombatRound)
	{
		if (attackInCombatRound <= 1 || this.type == "vehicle")
			return 0;

		const sizeBonus = this.system.secondaries.size.value > 0 ? Math.floor(this.system.secondaries.size.value / 2) : 0;
		const noMalusDefenses = SPACE1889Helper.getTalentLevel(this, "beweglicheAbwehr") + 1 + sizeBonus;
		if (attackInCombatRound <= noMalusDefenses)
			return 0;
		return (attackInCombatRound - noMalusDefenses) * (-2);
	}

	async addDamage(key)
	{
		const data = [{ name: 'Wunde in Bearbeitung', type: 'damage' }];
		const items = await Item.create(data, { parent: this });
		const item = items.shift();

		SPACE1889RollHelper.showDamageDialog(this, item, key == 'lethal')
	}

	async addDamageWithData(damageData)
	{
		const items = await Item.create(damageData, { parent: this });
		const item = items.shift();
		return item;
	}

	rollPrimary(key, event)
	{
		const dieCount = this.system.abilities[key]?.total;
		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(game.i18n.localize(CONFIG.SPACE1889.abilities[key]), key, evaluation.whisperInfo);

		const showDialog = evaluation.showDialog || game.settings.get("space1889", "showDialogForAllAttributeRolls");

		return this.rollAttribute(dieCount, showDialog, key, evaluation.specialDialog);
	}

	rollSecondary(key, event)
	{
		const dieCount = this.system.secondaries[key]?.total;
		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(game.i18n.localize(CONFIG.SPACE1889.secondaries[key]), key, evaluation.whisperInfo);

		return this.rollAttribute(dieCount, evaluation.showDialog, key);
	}

	rollSkill(key, event)
	{
		const item = this.system.skills.find(e => e.system.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItemFromEvent(item, this, event);
		}
	}

	rollSpecialization(key, event)
	{
		const item = this.system.speciSkills.find(e => e.system.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItemFromEvent(item, this, event);
		}
	}

	rollAttack(key, event)
	{
		const item = this.system.weapons.find(e => e.system.id == key);
		if (item != undefined)
		{
			if (this.type == "vehicle")
				SPACE1889RollHelper.rollManoeuver("Attack", this, event, item._id);
			else
				SPACE1889RollHelper.rollItemFromEvent(item, this, event);
		}
	}

	rollTalent(key, event)
	{
		const item = this.system.talents.find(e => e.system.id == key);
		if (item != undefined)
			SPACE1889RollHelper.rollItemFromEvent(item, this, event);
	}

	rollDefense(key, event)
	{
		let dieCount = 0;
		let label = "";
		switch (key)
		{
			case 'block':
				dieCount = this.system.block.value;
				label = game.i18n.localize("SPACE1889.Block");
				break;
			case 'parry':
				dieCount = this.system.parry.value;
				label = game.i18n.localize("SPACE1889.Parry");
				break;
			case 'evasion':
				dieCount = this.system.evasion.value;
				label = game.i18n.localize("SPACE1889.Evasion");
				break;
			case 'defense':
				dieCount = this.system.secondaries.defense.total;
				label = game.i18n.localize("SPACE1889.SecondaryAttributeDef");
				break;
			case 'activeDefense':
				dieCount = this.system.secondaries.defense.activeTotal;
				label = game.i18n.localize("SPACE1889.ActiveDefense");
				break;
			case 'passiveDefense':
				dieCount = this.system.secondaries.defense.passiveTotal;
				label = game.i18n.localize("SPACE1889.PassiveDefense");
				break;
			case 'totalDefense':
				dieCount = this.system.secondaries.defense.total + this.getTotalDefenseBonus(this);
				label = game.i18n.localize("SPACE1889.TalentVolleAbwehr");
				break;
		}

		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(label, key, evaluation.whisperInfo);

		if (this.type == "vehicle" && key != 'passiveDefense')
			return SPACE1889RollHelper.rollManoeuver(key, this, event);
		else
			return this.rollAttribute(dieCount, evaluation.showDialog, key);
	}

	rollManoeuvre(key, event)
	{
		if (key === "Board")
		{
			const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
			if (evaluation.showInfoOnly)
				SPACE1889RollHelper.showManoeuverInfo(key, this, evaluation.whisperInfo);
			else
				SPACE1889RollHelper.showManoeuverInfo(key, this, true);
		}
		else
		{
			SPACE1889RollHelper.rollManoeuver(key, this, event);
		}
	}

	/**
	 * 
	 * @param dieCount
	 * @param showDialog
	 * @param key
	 * @param specialDialog
	 */
	rollAttribute(dieCount, showDialog, key, specialDialog = false)
	{
		const theActor = this;
		let singleOnly = specialDialog;

		const baseValue = dieCount;
		let attributValue = baseValue;
		const isAbility = this.isAbility(key);
		if (isAbility && !specialDialog)
			attributValue = baseValue * 2;

		let info = game.i18n.localize("SPACE1889.Probe") ?? "Probe";
		info += ":";

		let deduction = 0;
		if ((key == "str" || key == "dex") && theActor.system.healthDeduction > 0)
		{
			deduction = theActor.system.healthDeduction;
			attributValue -= deduction;
			const deductionInfo = '<p>' + game.i18n.format("SPACE1889.HealthDeductionRollInfo", { value: theActor.system.healthDeduction }) + '</p>';
			info = deductionInfo + info;
		}

		const langId = this.getLangId(key);
		const name = game.i18n.localize(langId) ?? "unbekannt";

		const titleName = isAbility ? game.i18n.localize("SPACE1889.PrimaryAttributeRoll") : game.i18n.localize("SPACE1889.SecondaryAttributeRoll"); 
		const modifierText = game.i18n.localize("SPACE1889.Modifier");
		const attributeName = name;
		const modifierLabel = modifierText;
		const labelNumberOfDice = game.i18n.localize("SPACE1889.NumberOfDice");

		let chatOption = "public";
		let gmId = "";
		for (let user of game.users)
		{
			if (user.isGM)
			{
				gmId = user.id;
				break;
			}
		}
		const userId = game.user.id;


		if (showDialog)
		{
			let checkbox = '<li class="flexrow">';
			checkbox += '<div class="item flexrow flex-group-left">';
			checkbox += '<input type="' + (isAbility ? "checkbox" : "hidden") + '" id="selected" class="einfachCheckbox" text-align="left"' + (singleOnly ? " checked>" : ">");
			if (isAbility)
				checkbox += '<div class="item-name">  ' + game.i18n.localize("SPACE1889.SingleValueOnly") + '</div > ';
			checkbox += '</div></li>'

			let chatOptions = '<option value="selfAndGm">' + game.i18n.localize("CHAT.RollPrivate") + '</option>';
			chatOptions += '<option value="self">' + game.i18n.localize("CHAT.RollSelf") + '</option>';
			chatOptions += '<option value="public" selected="selected">' + game.i18n.localize("CHAT.RollPublic") + '</option>';

			function Recalc()
			{
				singleOnly = $('#selected')[0].checked;
				let mod = Number($("#modifier")[0].value);

				attributValue = getDiceCount(singleOnly, mod, deduction);

				$("#anzahlDerWuerfel")[0].value = attributValue;
			}

			function handleRender(html)
			{
				html.on('change', '.einfachCheckbox', () =>
				{
					Recalc();
				});

				html.on('change', '.modInput', () =>
				{
					Recalc();
				});
				Recalc();
			}

			let dialogue = new Dialog(
				{
					title: `${titleName}`,
					content: `
			<form>
			<h2>${attributeName}: ${baseValue}</h2>
			<ul>
				${checkbox}
				<li class="flexrow">
					<div class="item flexrow flex-group-left">
						<div>${modifierLabel}:</div> <input type="number" class="modInput" id="modifier" value = "0">
					</div>
				</li>
				<hr>
				<h4>
				<div>
					<li class="flexrow">
						<div class="item flexrow flex-group-left">
							<label for="anzahlDerWuerfel">${labelNumberOfDice}</label>
							<input id="anzahlDerWuerfel" value = "0" disabled="true" visible="false">
						</div>
					</li>
				</div>
				</h4>
				</ul>
				<hr>
				<p><select id="choices" name="choices">${chatOptions}</select></p>
			</form>`,
					buttons:
					{
						ok:
						{
							icon: '',
							label: 'Los!',
							callback: (html) => 
							{
								const mod = parseInt(html.find('#modifier').val());
								const single = html.find('#selected').is(":checked");
								const chatoption = html.find('#choices').val();
								attributValue = getDiceCount(single, mod, deduction);

								ChatMessage.create(getChatData(attributValue, mod, chatoption), {});
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
				});
			dialogue.render(true)
		}
		else
		{
			ChatMessage.create(getChatData(attributValue, 0, chatOption), {});
		}

		function getDiceCount(isSingleOnly, modificator, healthDeduction)
		{
			return Math.max(0, ((isSingleOnly || !isAbility) ? baseValue : baseValue * 2) + modificator - healthDeduction);
		}

		function getIds(option)
		{
			let ids = [];
			if (option == "selfAndGm")
				ids = gmId != userId ? [gmId, userId] : [userId];
			else if (option == "self")
				ids = [userId];

			return ids;
		}

		function getChatData(wurfelAnzahl, mod, theChatOption)
		{
			let unmodifiedValue = getDiceCount(singleOnly, 0, 0);
			let wert = game.i18n.localize("SPACE1889.Rating");
			let tooltipInfo = (mod && mod != 0) || deduction ? unmodifiedValue.toString() + "[" + wert + "]" : "";
			if (mod && mod != 0)
			{
				tooltipInfo += (mod > 0 ? " +" : " ") + mod.toString() + "[mod] ";
			}
			if (deduction != 0)
			{
				tooltipInfo += " -" + deduction.toString() + "[" + game.i18n.localize("SPACE1889.NegativeHealth") + "]";
			}

			let attribNameAddition = "";
			if (isAbility)
				attribNameAddition = ` (${wert} ${baseValue})`;

			const anzahl = Math.max(0, wurfelAnzahl);
			let messageContent = `<div><h2><strong>${attributeName}</strong>${attribNameAddition}</h2></div>`;
			const dieType = SPACE1889RollHelper.getDieType();
			messageContent += `${info} <b>[[${anzahl}${dieType}]] von <a data-tooltip="${tooltipInfo}"> ${wurfelAnzahl}</a></b> <br>`;

			let ids = getIds(theChatOption);

			let chatData =
			{
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: theActor }),
				whisper: ids,
				content: messageContent
			};

			return chatData;
		}
	}
}
