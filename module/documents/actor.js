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

	_getDerivedSpace1889Data()
	{
		this.derived ??= {};
		return this.derived;
	}

	_getActorDerivedSpace1889Data(actor)
	{
		if (actor === this)
			return this._getDerivedSpace1889Data();

		actor.derived ??= {};
		return actor.derived;
	}

	_getDerivedGravity(actor)
	{
		const derivedData = this._getActorDerivedSpace1889Data(actor);
		derivedData.gravity ??= this.calculateGravity(actor);
		return derivedData.gravity;
	}

	_getDerivedLoad(actor)
	{
		const derivedData = this._getActorDerivedSpace1889Data(actor);
		if (!derivedData.load)
		{
			const gravity = this._getDerivedGravity(actor);
			derivedData.load = this.calculateLoad(actor, gravity);
		}
		return derivedData.load;
	}

	_getDerivedDefenseData(actor, key)
	{
		const derivedData = this._getActorDerivedSpace1889Data(actor);
		if (!derivedData[key])
		{
			switch (key)
			{
				case "block":
					derivedData.block = this.calculateBlockData(actor);
					break;
				case "parry":
					derivedData.parry = this.calculateParryData(actor);
					break;
				case "evasion":
					derivedData.evasion = this.calculateEvasionData(actor);
					break;
			}
		}
		return derivedData[key] ?? {};
	}

	_getDerivedCollection(actor, key)
	{
		const derivedData = this._getActorDerivedSpace1889Data(actor);
		derivedData[key] ??= [];
		return derivedData[key];
	}

	get talents()
	{
		return this._getDerivedCollection(this, "talents");
	}

	get skills()
	{
		return this._getDerivedCollection(this, "skills");
	}

	get speciSkills()
	{
		return this._getDerivedCollection(this, "speciSkills");
	}

	get injuries()
	{
		return this._getDerivedCollection(this, "injuries");
	}

	get armors()
	{
		return this._getDerivedCollection(this, "armors");
	}

	get shields()
	{
		return this._getDerivedCollection(this, "shields");
	}

	get gear()
	{
		return this._getDerivedCollection(this, "gear");
	}

	get resources()
	{
		return this._getDerivedCollection(this, "resources");
	}

	get weakness()
	{
		return this._getDerivedCollection(this, "weakness");
	}

	get language()
	{
		return this._getDerivedCollection(this, "language");
	}

	get money()
	{
		return this._getDerivedCollection(this, "money");
	}

	get ammunitions()
	{
		return this._getDerivedCollection(this, "ammunitions");
	}

	get containers()
	{
		return this._getDerivedCollection(this, "containers");
	}

	get weapons()
	{
		return this._getDerivedCollection(this, "weapons");
	}

	get extendedRolls()
	{
		return this._getDerivedCollection(this, "extendedRolls");
	}

	get lightSources()
	{
		return this._getDerivedCollection(this, "lightSources");
	}

	get visions()
	{
		return this._getDerivedCollection(this, "visions");
	}

	get block()
	{
		return this._getDerivedDefenseData(this, "block");
	}

	get parry()
	{
		return this._getDerivedDefenseData(this, "parry");
	}

	get evasion()
	{
		return this._getDerivedDefenseData(this, "evasion");
	}

	get healthDeduction()
	{
		const derivedData = this._getDerivedSpace1889Data();
		derivedData.healthDeduction ??= 0;
		return derivedData.healthDeduction;
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
			let resources = await SPACE1889Helper.getPackItemsFromFolder("space1889.charaktermerkmale", "BnDW0s7p77BlkNkO")

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
			let skills = await SPACE1889Helper.getPackItemsFromFolder("space1889.charaktermerkmale", "PQcq8W9wotfKFWOf")

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

		super.prepareBaseData(); // resets _completedActiveEffectPhases via _clearData()
		const legacySystem = this._source?.system ?? {};
		if ((this.type === "character" || this.type === "npc") && !this.system.weight && legacySystem["weight "])
		{
			this.system.weight = legacySystem["weight "];
		}
		if (this.type === "vehicle" && this.system.weight2 != null)
		{
			this.system.weight2 = String(this.system.weight2);
		}
		if (game.release.generation >= 14)
		{
			this.overrides ??= {};
		}
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
		const derivedData = this._getActorDerivedSpace1889Data(actor);

		derivedData.talents = [];
		derivedData.skills = [];
		derivedData.speciSkills = [];
		derivedData.secondaries = actor.system.secondaries;
		derivedData.secondaries.defense.total = 0; //toDo mit was sinnvollem füllen
		derivedData.secondaries.perception.total = 0;


		const useCustomValue = actor.system.crew.experience == "custom";
		const defaultValue = useCustomValue ? actor.system.crew.experienceValue : SPACE1889Helper.getCrewExperienceValue(actor.system.crew.experience);
		const mod = SPACE1889Helper.getCrewTemperModificator(actor.system.crew.temper);

		derivedData.positions ??= {};
		for (let [key, position] of Object.entries(actor.system.positions))
		{
			derivedData.positions[key] = position;

			derivedData.positions[key].actorName = game.i18n.localize("SPACE1889.VehicleCrew") + " (" + game.i18n.localize(CONFIG.SPACE1889.vehicleCrewPositions[key]) + ")";
			if (position.actorId != "" && game.actors != undefined && position.staffed)
			{
				const posActor = game.actors.get(position.actorId);
				if (posActor)
				{
					derivedData.positions[key].total = this._GetVehiclePositionSkillValue(actor, key, posActor);
					derivedData.positions[key].actorName = posActor.name;
					derivedData.positions[key].mod = 0;
				}
				else
				{
					derivedData.positions[key].actorName = game.i18n.localize("SPACE1889.VehicleNoActorName");
					derivedData.positions[key].mod = 0;
					derivedData.positions[key].total = 0;
				}
			}
			else if (!position.staffed)
			{
				derivedData.positions[key].actorName = "";
				derivedData.positions[key].mod = 0;
				derivedData.positions[key].total = 0;
			}
			else if (useCustomValue)
			{
				if (position.value == 0)
					position.value = defaultValue;
				derivedData.positions[key].value = defaultValue;
				derivedData.positions[key].mod = mod;
				derivedData.positions[key].total = Math.max(0, position.value + mod);
			}
			else
			{
				derivedData.positions[key].mod = mod;
				derivedData.positions[key].total = Math.max(0, defaultValue + mod);
			}
			derivedData.positions[key].label = game.i18n.localize(CONFIG.SPACE1889.vehicleCrewPositions[key]);
		}

		if (actor.system.isStrengthBasedTempo)
		{
			let strValue = Math.round(actor.derived.positions.pilot.total / 2);
			if (actor.system.positions.pilot.actorId != "" && game.actors != undefined)
			{
				const pilot = game.actors.get(actor.system.positions.pilot.actorId);
				strValue = pilot.derived.abilities.str.total;
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

		derivedData.injuries = injuries;

		this.prepareVehicleWeapons(actor, weapons);
		derivedData.weapons = weapons;

		for (let injury of injuries)
		{
			const isLethal = injury.system.damageType == "lethal";
			const healingDurationInDays = (isLethal ? 7 : 1) * injury.system.remainingDamage / injury.system.healingFactor;
			injury.derived.healingDuration = this.FormatHealingDuration(healingDurationInDays);
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
			return actorOnPosition.derived.secondaries.perception.total;
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

		let malus = SPACE1889Helper.getStructureMalus(actor.system.health.value, actor.system.health.max, actor.system.speed.max, actor.derived.health.controlDamage, actor.derived.health.propulsionDamage);

		actor.system.weaponLoad.max = actor.system.isAirship ? actor.system.size / 2 : actor.system.size;
		actor.system.weaponLoad.value = this.getWeaponLoad(actor);

		actor.derived.weaponLoad = actor.system.weaponLoad;
		actor.derived.weaponLoad.maxWithOverload = actor.system.health.max;
		actor.derived.weaponLoad.maneuverabilityMalus = 0;
		actor.derived.weaponLoad.isOverloaded = false;
		if (actor.system.weaponLoad.value > actor.system.weaponLoad.max)
		{
			actor.derived.weaponLoad.maneuverabilityMalus = (actor.system.weaponLoad.max - actor.system.weaponLoad.value) * (actor.system.isAirship ? 2 : 1);
			//ui.notifications?.info(game.i18n.format("SPACE1889.VehicleIsOverloaded", {name: actor.name}));
		}
		if (actor.system.weaponLoad.value > actor.derived.weaponLoad.maxWithOverload)
		{
			actor.derived.weaponLoad.isOverloaded = true;
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

		actor.derived.secondaries.initiative.total = isDisabled ? 0 : actor.derived.positions.pilot.total + Number(actor.system.maneuverability.value);

		if (!isDisabled && actor.system.positions.copilot.staffed && actor.derived.positions.copilot.total >= 4 &&
			(actor.system.positions.copilot.actorId == "" || actor.system.positions.copilot.actorId != actor.system.positions.pilot.actorId))
			actor.derived.secondaries.initiative.total += 2;
		if (!isDisabled && actor.system.positions.captain.staffed && actor.derived.positions.captain.total >= 4 &&
			(actor.system.positions.captain.actorId == "" || actor.system.positions.captain.actorId != actor.system.positions.pilot.actorId))
			actor.derived.secondaries.initiative.total += 2;

		actor.system.secondaries.initiative.total = actor.derived.secondaries.initiative.total;

		actor.derived.secondaries.defense = this.getVehicleDefenseValues(actor, disabled);
		actor.system.secondaries.defense.value = actor.derived.secondaries.defense.value;
	}

	getVehicleDefenseValues(actor, disabled)
	{
		const passiveTotal = this.getPassiveDefense(actor);
		const value = passiveTotal;
		let total = passiveTotal;
		if (actor.system.maneuverability.value !== disabled)
		{
			total += actor.derived.positions.pilot.total + actor.system.maneuverability.value;
			total = Math.max(total, passiveTotal);
		}
		const totalDefense = total + this.getTotalDefenseBonus(actor);

		const defenseValues = {
			passiveTotal : passiveTotal,
			value : value,
			total :  total,
			totalDefense: totalDefense
		}
		return defenseValues;
	}

	getWeaponLoad(actor)
	{
		let load = 0;
		for (let weapon of actor.weapons)
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
		const derivedData = this._getActorDerivedSpace1889Data(actor);

		// Item Effekte der Talente vorbereiten
		for (let item of items)
		{
			if (item.type === 'talent')
			{
				item.derived.level ??= {}; 
				item.derived.level.effectBonus = SPACE1889Helper.getBonusFromEffects("system.level.effectBonus", item.effects);
				item.derived.level.total = SPACE1889Helper.constrain(item.system.level.value + this.getAsNumber(item.derived.level.effectBonus), item.system.level.min, item.system.level.max);
			}
			else if (item.type === 'skill' || item.type === 'specialization')
			{
				item.derived.effectBonus = SPACE1889Helper.getBonusFromEffects("system.effectBonus", item.effects);
			}
		}

		derivedData.abilities = {};
		for (let [key, ability] of Object.entries(actor.system.abilities))
		{

			const talentBonus = this.getBonusFromTalents(key, "ability", items);
			const bonus = talentBonus + this.getAsNumber(ability?.effectBonus);
			const bonusInfo = this.GetBonusInfo(talentBonus, ability?.effectBonus);
			const total = ability.value + bonus;

			derivedData.abilities[key] = { value: ability.value, total: total, talentBonus: talentBonus, bonus: bonus, bonusInfo: bonusInfo }
		}

		const armorData = this.getArmorBonusMalus(items);
		if (armorData.malus > 0)
		{
			derivedData.abilities["dex"].bonus -= armorData.malus;
			derivedData.abilities["dex"].total = Math.max(0, derivedData.abilities["dex"].total - armorData.malus);
			derivedData.abilities["dex"].bonusInfo = this.AddBonusInfo("Rüstung", (-1) * armorData.malus, derivedData.abilities["dex"].bonusInfo);
		}
		derivedData.armorTotal = armorData;

		const skills = [];
		const speciSkills = [];
		const talents = [];
		const weapons = [];
		const ammunitions = [];
		const armors = [];
		const shields = [];
		const gear = [];
		const resources = [];
		const weakness = [];
		const language = [];
		const injuries = [];
		const money = [];
		const containers = [];
		const extendedRolls = [];
		const lightSources = [];
		const visions = [];

		for (let item of items)
		{
			if (item.type === 'skill')
			{
				item.system.talentBonus = this.getBonusFromTalents(item.system.id, item.type, items) + this.getAsNumber(item.derived.effectBonus);
				skills.push(item);
			}
			// Append to specialization.
			else if (item.type === 'specialization')
			{
				item.system.talentBonus = this.getBonusFromTalents(item.system.id, item.type, items) + this.getAsNumber(item.derived.effectBonus);
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
			else if (item.type === 'shield')
				shields.push(item);
			else if (item.type === 'item')
				gear.push(item);
			else if (item.type === 'vision')
			{
				gear.push(item);
				visions.push(item);
			}
			else if (item.type === 'lightSource')
			{
				gear.push(item);
				lightSources.push(item);
			}
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
		SPACE1889Helper.sortBySortFlag(shields);

		derivedData.talents = talents;
		derivedData.skills = skills;
		derivedData.speciSkills = speciSkills;
		derivedData.injuries = injuries;
		derivedData.armors = armors;
		derivedData.shields = shields;
		derivedData.gear = gear;
		derivedData.resources = resources;
		derivedData.weakness = weakness;
		derivedData.language = language;
		derivedData.money = money;
		derivedData.ammunitions = ammunitions;
		derivedData.containers = containers;
		derivedData.weapons = weapons;
		derivedData.extendedRolls = extendedRolls;
		derivedData.lightSources = lightSources;
		derivedData.visions = visions;

		this.CalcAndSetHealth(actor);
		this.CalcContainerLoad(actor);
		const loadInfo = this.CalcAndSetLoad(actor);
		if (loadInfo.dexAndMoveMalus > 0)
		{
			derivedData.abilities["dex"].bonus -= loadInfo.dexAndMoveMalus;
			derivedData.abilities["dex"].total = Math.max(0, derivedData.abilities["dex"].total - loadInfo.dexAndMoveMalus);
			derivedData.abilities["dex"].bonusInfo = this.AddBonusInfo("Überladung", (-1) * loadInfo.dexAndMoveMalus, derivedData.abilities["dex"].bonusInfo);
		}

		derivedData.healthDeduction = 0;

		const deductionTh = SPACE1889Helper.getHealthDeductionThreshold(actor);
		if (deductionTh > actor.system.health.value)
			derivedData.healthDeduction = deductionTh - actor.system.health.value;

		this.calcAndSetSecondaries(actor);

		this.calcAndSetSkillsAndSpecializations(actor)

		this.prepareShields(actor, shields);
		this.prepareWeapons(actor, weapons);
		derivedData.weapons = weapons;

		for (let injury of injuries)
		{
			const isLethal = injury.system.damageType == "lethal";
			const healingDurationInDays = (isLethal ? 7 : 1) * injury.system.remainingDamage / injury.system.healingFactor;
			//			injury.system.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[injury.system.damageType]);
			injury.derived.healingDuration = this.FormatHealingDuration(healingDurationInDays);
			if (injury.system.remainingDamage > 0)
			{
				if (SPACE1889Helper.isDead(actor))
				{
					injury.system.timeToNextCure = game.i18n.localize("SPACE1889.DeadDoNotHeal");
					injury.derived.healingDuration = "∞";
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
				injury.derived.tooltipInfo = game.i18n.format("SPACE1889.ActorInjuryToolTip", {
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

				injury.derived.tooltipInfo = game.i18n.format("SPACE1889.ActorActiveInjuryToolTip", {
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
			//const lists = [armors, gear, shields];

			//for (const list of lists)
			//{
			//	for (let element of list)
			//	{
			//		const locationNames = this.getLocation(actor, element.system.containerId);
			//		element.system.display = locationNames.shortName;
			//		//element.system.locationLong = locationNames.name;
			//	}
			//}

			this._CalcThings(actor);
		}
	}

	/**
	 * 
	 * @param {object} actor
	 */
	calcAndSetSecondaries(actor)
	{
		const derivedData = this._getActorDerivedSpace1889Data(actor);
		const system = actor.system;
		system.secondaries.move.value = derivedData.abilities.str.total + derivedData.abilities.dex.total;
		derivedData.secondaries ??= {}
		derivedData.secondaries.move = this._getSecondaryBonus("move", actor);
		derivedData.secondaries.move.total = Math.max(0, system.secondaries.move.value + derivedData.secondaries.move.bonus);
		derivedData.secondaries.move.value = system.secondaries.move.value;

		system.secondaries.perception.value = derivedData.abilities.int.total + derivedData.abilities.wil.total;
		derivedData.secondaries.perception = this._getSecondaryBonus("perception", actor);
		derivedData.secondaries.perception.total = Math.max(0, system.secondaries.perception.value + derivedData.secondaries.perception.bonus);
		derivedData.secondaries.perception.value = system.secondaries.perception.value;

		system.secondaries.initiative.value = derivedData.abilities.dex.total + derivedData.abilities.int.total;
		derivedData.secondaries.initiative = this._getSecondaryBonus("initiative", actor);
		derivedData.secondaries.initiative.total = Math.max(0, system.secondaries.initiative.value + derivedData.secondaries.initiative.bonus);
		derivedData.secondaries.initiative.value = system.secondaries.initiative.value;
		system.secondaries.initiative.total = derivedData.secondaries.initiative.total;

		system.secondaries.stun.value = Math.max(derivedData.abilities.con.total, SPACE1889Helper.getTalentLevel(actor, "dickkopf") > 0 ? derivedData.abilities.wil.total : 0);
		derivedData.secondaries.stun = this._getSecondaryBonus("stun", actor);
		derivedData.secondaries.stun.total = Math.max(0, system.secondaries.stun.value + derivedData.secondaries.stun.bonus);
		derivedData.secondaries.stun.value = system.secondaries.stun.value;

		derivedData.secondaries.size = this._getSecondaryBonus("size", actor);
		derivedData.secondaries.size.total = system.secondaries.size.value + derivedData.secondaries.size.bonus;
		derivedData.secondaries.size.value = system.secondaries.size.value;

		derivedData.secondaries.defense = this._getCharacterDefenseValues(actor);
		system.secondaries.defense.value = derivedData.secondaries.defense.value;

		for (let [key, element] of Object.entries(derivedData.secondaries)) 
		{
			element.label = game.i18n.localize(CONFIG.SPACE1889.secondaries[key]) ?? key;
		}
	}

	_getCharacterDefenseValues(actor)
	{
		const sizeTotal = actor.derived.secondaries.size.total;
		const value = this.getPassiveDefense(actor) + this.getActiveDefense(actor) - sizeTotal;
		const armorBonus = actor.derived.armorTotal.bonus;
		const bonus = this._getSecondaryBonus("defense", actor);
		const passiveTotal = Math.max(0, this.getPassiveDefense(actor) - sizeTotal + armorBonus + this.getAsNumber(actor.system.secondaries.defense?.effectBonus));
		const activeTotal = Math.max(0, this.getActiveDefense(actor) - sizeTotal - actor.healthDeduction);
		const total = Math.max(0, value + bonus.bonus);
		const totalDefense = Math.max(0, total + this.getTotalDefenseBonus(actor));
		const defenseValues = {
			value: value,
			armorBonus: armorBonus,
			passiveTotal: passiveTotal,
			activeTotal: activeTotal,
			total: total,
			totalDefense: totalDefense,
			bonus: bonus.bonus,
			bonusInfo: bonus.bonusInfo,
		}
		return defenseValues;
	}


	getAsNumber(value)
	{
		return SPACE1889Helper.getAsNumber(value);
	}

	_getSecondaryBonus(secondaryAttrib, actor)
	{
		let secondary = actor.system.secondaries[secondaryAttrib];
		if (!secondary)
			return { bonus: 0, bonusInfo: "" };

		const talentBonus = this.getBonusFromTalents(secondaryAttrib, "secondary", actor.items);
		const effectBonus = this.getAsNumber(secondary?.effectBonus);
		let healthBonus = 0;
		let loadBonus = 0;
		let armorBonus = (secondaryAttrib == "defense" ? actor.derived.armorTotal.bonus : 0);
		if (secondaryAttrib == "move")
		{
			loadBonus -= this._getDerivedLoad(actor).dexAndMoveMalus ?? 0;
			if (actor.system.health.value < 0)
				healthBonus = actor.system.health.value;
		}
		else if (secondaryAttrib != "size" && secondaryAttrib != "stun")
		{
			healthBonus -= actor.healthDeduction;
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

		return { bonus: bonus, bonusInfo: bonusInfo };
	}

	calcAndSetCharacterNpcSiMoveUnits(actor)
	{
		const siMoveDistance = actor.derived.secondaries.move.total * 1.5;
		const meter = "m";
		const meterWithSeparator = "m; ";
		const runFactor = SPACE1889Helper.getTalentLevel(actor, "sprinter") > 0 ? 4 : 2;
		const sprintFactor = 4;
		let info = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
		info += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * runFactor).toString() + meterWithSeparator;
		info += game.i18n.localize("SPACE1889.Sprint") + ": " + (siMoveDistance * sprintFactor).toString() + meter;
		actor.derived.secondaries.move.inSiUnits = info;
	}


	/**
	 *
	 * @param {object} actor
	 */
	calcAndSetSkillsAndSpecializations(actor)
	{
		for (let skl of actor.skills)
		{
			let underlyingAttribute = this._GetAttributeBase(actor, skl);
			skl.system.basis = actor.derived.abilities[underlyingAttribute].total;
			skl.system.baseAbilityAbbr = game.i18n.localize(CONFIG.SPACE1889.abilityAbbreviations[underlyingAttribute]);
			let deduction = actor.healthDeduction;
			if (skl.system.id == 'heimlichkeit' && actor.derived.secondaries.size.total != 0)
				deduction += actor.derived.secondaries.size.total;

			if (deduction > 0)
				skl.system.talentBonus -= deduction;

			const rating = skl.system.basis + skl.system.level + skl.system.talentBonus;
			skl.system.rating = Math.max(0, rating);
			if (skl.system.isSkillGroup && skl.system.skillGroupName.length > 0)
				skl.system.skillGroup = game.i18n.localize(CONFIG.SPACE1889.skillGroups[skl.system.skillGroupName]);

			if (skl.system.id == 'sportlichkeit' && skl.system.rating > actor.system.secondaries.move.value)
			{
				actor.system.secondaries.move.value = skl.system.rating;
				actor.derived.secondaries.move.total = skl.system.rating + actor.derived.secondaries.move.bonus;
			}

			for (let spe of actor.speciSkills)
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
			for (const container of actor.containers)
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

	prepareShields(actor, shields)
	{
		let sizeMod = (-1) * actor.derived.secondaries.size.total;
		for (let shield of shields)
		{
			if (shield.system.skillId == "none")
			{
				shield.derived.sizeMod = "-";
				shield.derived.skillRating = "-";
				shield.derived.attack = shield.system.damage;
				shield.derived.attackAverage = (Math.floor(shield.derived.attack / 2)).toString() + (shield.derived.attack % 2 == 0 ? "" : "+");
			}
			else
			{
				shield.derived.sizeMod = sizeMod;
				shield.derived.skillRating = this.getSkillLevel(actor, shield.system.skillId, shield.system.specializationId);
				const attackBonusFromDamage = shield.system.damage;
				let offhandMod = this.getOffhandModificator(actor.type, shield);
				shield.derived.attack = Math.max(0, attackBonusFromDamage + shield.derived.skillRating + shield.derived.sizeMod + offhandMod);
				shield.derived.attackAverage = (Math.floor(shield.derived.attack / 2)).toString() + (shield.derived.attack % 2 == 0 ? "" : "+");
			}
		}

		//SPACE1889Helper.sortBySortFlag(shields);
	}

	/**
	 * 
	 * @param {object} actor
	 * @param {Array<object>} weapons
	 */
	prepareWeapons(actor, weapons)
	{
		let sizeMod = (-1) * actor.derived.secondaries.size.total;
		for (let weapon of weapons)
		{
			this.prepareWeaponAmmunition(weapon, actor);

			if (weapon.system.isRangeWeapon)
			{
				weapon.derived.calculatedRange = parseFloat(SPACE1889Helper.replaceCommaWithPoint(weapon.system.range));
				if (weapon.derived.ammunition?.rangeModFactor > 0)
					weapon.derived.calculatedRange *= weapon.derived.ammunition.rangeModFactor;

				weapon.derived.coneRange = weapon.derived.calculatedRange; // wird weder von Talenten noch von Zielfernrohren beeinflusst
				if ((weapon.system.specializationId == "schrotgewehr" && weapon.system.ammunition.currentItemId == "") || weapon.derived.ammunition.isShotgunLike)
					weapon.derived.templateConeAngle = SPACE1889Helper.getConeAngle(weapon);

				if (weapon.system.hasTelescopicSight && weapon.system.skillId == "schusswaffen")
					weapon.derived.calculatedRange *= 2;
				if (SPACE1889Helper.getTalentLevel(actor, "scharfschuetze") > 0)
					weapon.derived.calculatedRange *= 2;

				if (weapon.system.capacity == weapon.system.ammunition.remainingRounds)
					weapon.derived.ammunition.loadStateDisplay = game.i18n.localize("SPACE1889.InfoWeaponIsReady");
				else if (weapon.system.ammunition.remainingRounds > 0)
					weapon.derived.ammunition.loadStateDisplay = game.i18n.localize("SPACE1889.InfoReloadPart");
				else
					weapon.derived.ammunition.loadStateDisplay = game.i18n.localize("SPACE1889.InfoReload");

				weapon.derived.ammunition.autoReloadRate = SPACE1889Helper.getAutoReloadRate(weapon);

				if (weapon.system.ammunition.currentItemId != "")
					weapon.derived.rangeInfo = game.i18n.format("SPACE1889.WeaponRangeInfo", { range: weapon.derived.calculatedRange, ammoName: weapon.derived.ammunition.name });
				else
				{
					let ammoType = game.i18n.localize(CONFIG.SPACE1889.weaponAmmunitionTypes[weapon.system.ammunition.type]);
					if (weapon.system.ammunition.caliber != "")
						ammoType += " (" + weapon.system.ammunition.caliber + ")";
					weapon.derived.rangeInfo = game.i18n.format("SPACE1889.WeaponRangeInfo2", { range: weapon.derived.calculatedRange, ammo: ammoType });
				}
			}

			if (weapon.system.skillId == "none" && weapon.system.isAreaDamage)
			{
				weapon.derived.sizeMod = "-";
				weapon.derived.skillRating = "-";
				weapon.derived.attack = weapon.system.damage;
				weapon.derived.attackAverage = (Math.floor(weapon.derived.attack / 2)).toString() + (weapon.derived.attack % 2 == 0 ? "" : "+");
			}
			else
			{
				weapon.derived.sizeMod = sizeMod;
				weapon.derived.skillRating = this.getSkillLevel(actor, weapon.system.skillId, weapon.system.specializationId);
				const attackBonusFromDamage = (weapon.system.isAreaDamage && actor.type != 'vehicle') ? 0 : weapon.system.damage;
				const ammoBonus = weapon.derived.ammunition?.damageMod ? weapon.derived.ammunition.damageMod : 0;
				let offhandMod = this.getOffhandModificator(actor.type, weapon);
				weapon.derived.attack = Math.max(0, attackBonusFromDamage + weapon.derived.skillRating + weapon.derived.sizeMod + ammoBonus + offhandMod);
				weapon.derived.attackAverage = (Math.floor(weapon.derived.attack / 2)).toString() + (weapon.derived.attack % 2 == 0 ? "" : "+");
			}
			const damageType = weapon.derived.ammunition?.damageType ? weapon.derived.ammunition.damageType : weapon.system.damageType;
			weapon.derived.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[damageType]);
		}

		SPACE1889Helper.sortBySortFlag(weapons);
	}

	prepareWeaponAmmunition(weapon, actor)
	{
		if (!weapon || !weapon.system.ammunition)
			return;

		weapon.derived.ammunition = {};
;
		if (!actor || !actor.ammunitions || actor.ammunitions.length == 0 || !weapon.system.isRangeWeapon)
			return;

		if (weapon.system.ammunition.type === "sunbeams")
		{
			weapon.system.ammunition.remainingRounds = weapon.system.capacity;
			weapon.derived.ammunition.display = game.i18n.localize("SPACE1889.InfoWeaponIsReadySunbeam");
			return;
		}

		let list = [];
		for (let ammo of actor.ammunitions)
		{
			let capacityType = SPACE1889Helper.getAmmunitionCapacityType(weapon);
			if (weapon.system.ammunition.type == ammo.system.type && capacityType == ammo.system.capacityType && weapon.system.ammunition.caliber == ammo.system.caliber)
				list.push(ammo);
		}

		weapon.derived.ammunition.ammos = list;
		weapon.derived.ammunition.display = "";

		let currentAmmo = weapon.derived.ammunition.ammos.find(x => x._id == weapon.system.ammunition.currentItemId);
		if (currentAmmo)
		{
			weapon.derived.ammunition.damageMod = currentAmmo.system.damageModifikator;
			weapon.derived.ammunition.rangeModFactor = currentAmmo.system.rangeModFactor;
			weapon.derived.ammunition.damageType = currentAmmo.system.damageType;
			weapon.derived.ammunition.isShotgunLike = currentAmmo.system.isConeAttack;
			weapon.derived.ammunition.display = "(" + currentAmmo.system.quantity.toString() + "x) " + currentAmmo.name;
			weapon.derived.ammunition.name = currentAmmo.name;
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
			weapon.derived.calculatedRange = parseFloat(SPACE1889Helper.replaceCommaWithPoint(weapon.system.range));
			if (weapon.system.skillId == "none" && weapon.system.isAreaDamage)
			{
				weapon.derived.sizeMod = "-";
				weapon.derived.skillRating = "-";
				weapon.derived.attack = weapon.system.damage;
				weapon.derived.attackAverage = (Math.floor(weapon.derived.attack / 2)).toString() + (weapon.derived.attack % 2 == 0 ? "" : "+");
			}
			else
			{
				weapon.derived.sizeMod = 0;
				weapon.derived.skillRating = useGunner ? this.getSkillLevel(gunner, weapon.system.skillId, weapon.system.specializationId) : actor.derived.positions.gunner.total;
				weapon.derived.attack = Math.max(0, weapon.system.damage + weapon.derived.skillRating);
				weapon.derived.attackAverage = (Math.floor(weapon.derived.attack / 2)).toString() + (weapon.derived.attack % 2 == 0 ? "" : "+");
			}
			weapon.derived.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[weapon.system.damageType]);

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
		const totalMovement = actor.derived.secondaries.move.total;
		const siMoveDistance = totalMovement * 1.5;
		const meter = "m";
		const meterWithSeparator = "m; ";
		switch (system.movementType)
		{
			case "amphibious":
			case "flying":
				{
					const second = Math.floor(totalMovement / 2);
					movement = totalMovement.toString() + " (" + second.toString() + ")";
					siUnits = game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[system.movementType]) + ": ";
					siUnits += siMoveDistance.toString() + meterWithSeparator;
					siUnits += ((system.movementType == "flying") ? game.i18n.localize("SPACE1889.OnTheGround") : game.i18n.localize("SPACE1889.OnLand")) + ": ";
					siUnits += (siMoveDistance / 2).toString() + meter;
				}
				break;
			case "fossorial":
				movement = totalMovement.toString() + " (" + (totalMovement * 2).toString() + ")";
				siUnits = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * 2).toString() + meterWithSeparator;
				siUnits += game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[system.movementType]) + ": ";
				siUnits += (totalMovement * 2 * 0.3).toString() + "m/h";
				break;
			case "jumper":
			case "manylegged":
				movement = totalMovement.toString() + " (" + (totalMovement * 2).toString() + ")";
				siUnits = game.i18n.localize("SPACE1889.Move") + ": " + siMoveDistance.toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.Run") + ": " + (siMoveDistance * 4).toString() + meter;
				break;
			case "swimming":
				movement = (totalMovement * 2).toString() + " (0)";
				siUnits = game.i18n.localize(CONFIG.SPACE1889.creatureMovementType[system.movementType]) + ": ";
				siUnits += (siMoveDistance * 2).toString() + meterWithSeparator;
				siUnits += game.i18n.localize("SPACE1889.OnLand") + ": 0m";
				break;
			case "immobile":
				movement = "0";
				siUnits += game.i18n.localize("SPACE1889.CreatureMovementTypeImmobile") + ": 0m";
				break;
			default:
				movement = totalMovement.toString();
				this.calcAndSetCharacterNpcSiMoveUnits(actor)
				break;
		}

		actor.derived.secondaries.move.display = movement;
		if (system.movementType != "ground")
			actor.derived.secondaries.move.inSiUnits = siUnits;
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
		let maxSkillGroupLevel = 0;

		if (type === "skill")
		{
			let theItem = items.find(e => e.system.id === whatId);
			if (theItem && theItem.system.isSkillGroup)
			{
				const skillGroupId = theItem.system.skillGroupName;
				const vielseitigId = "vielseitig" + skillGroupId.replace(/^(.)/, function (b) { return b.toUpperCase(); });
				const talent = items.find(v => v.system.id === vielseitigId);
				if (talent)
				{
					let skillGroups = [];
					for (let skill of items)
					{
						if (whatId === skill.system.id)
							continue;
							
						if (skill.system.isSkillGroup && skillGroupId === skill.system.skillGroupName)
							skillGroups.push(skill);
					}

					for (let skill of skillGroups)
					{
						if (skill.system.level > maxSkillGroupLevel)
							maxSkillGroupLevel = skill.system.level;
					}

					if (maxSkillGroupLevel > theItem.system.level)
						bonus = maxSkillGroupLevel - theItem.system.level;
				}
			}	
		}

		for (let item of items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.bonusTargetType == type && item.system.bonusTarget == whatId)
			{
				const level = item.derived.level.total ?? item.system.level.value;
				let factor = level;
				if (item.system.bonusStartLevel > 1)
					factor = Math.max(0, level + 1 - item.system.bonusStartLevel);
				bonus += (factor * item.system.bonus);
			}
		}

		return bonus;
	}

	GetBonusInfo(talentBonus, effectBonus)
	{
		if (typeof effectBonus !== "number")
			effectBonus = this.getAsNumber(effectBonus);
		if (talentBonus == 0 && effectBonus == 0)
			return "";

		let info = "";
		if (talentBonus != 0)
			info = this.AddBonusInfo(game.i18n.localize("SPACE1889.TalentPl"), talentBonus, info);
		if (effectBonus != 0)
			info = this.AddBonusInfo(game.i18n.localize("SPACE1889.EffectPl"), effectBonus, info);

		return info;
	}

	AddBonusInfo(name, value, baseInfo)
	{
		const info = (baseInfo.length > 0 ? baseInfo + "\n" : "") + name + ": " + SPACE1889Helper.getSignedStringFromNumber(value);
		return info;
	}

	getActiveDefense(actor, ignoreActiveDefenseState = false)
	{
		let active = actor.derived.abilities.dex.total;

		if (this.HasNoActiveDefense(actor) && !ignoreActiveDefenseState)
			active = 0;
		else
		{
			for (let item of actor.items)
			{
				if (item.type != 'talent')
					continue;

				if (item.system.id == 'berechneteAbwehr')
					active = actor.derived.abilities.int.total;
				else if (item.system.id == 'strahlendeAbwehr')
					active = actor.derived.abilities.cha.total;
			}
		}

		return active;
	}

	getPassiveDefense(actor)
	{
		if (actor.type != "vehicle")
		{
			let passive = actor.derived.abilities.con.total;

			for (let item of actor.items)
			{
				if (item.type != 'talent')
					continue;

				if (item.system.id == 'kraftvolleAbwehr')
					passive = actor.derived.abilities.str.total;
				else if (item.system.id == 'ueberzeugteAbwehr')
					passive = actor.derived.abilities.wil.total;
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
			if (item.type != "armor" && item.type != "shield")
				continue;

			if (item.system.containerId == null)
			{
				if (item.type == "shield" && item.system?.usedHands == "none")
					continue;
					
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
		for (let talent of actor.talents)
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
		if (actor.speciSkills)
		{
			for (let speci of actor.speciSkills)
			{
				if (specializationId === speci.system.id)
					return speci.system.rating;
			}
		}

		let skillGroups = [];
		if (actor.skills)
		{
			for (let skill of actor.skills)
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
				const uni = actor.talents?.find(v => v.system.id === "universalist");
				if (uni != undefined && uni != null)
				{
					let underlyingAttribute = "";
					if (CONFIG.SPACE1889.skillGroupUnderlyingAttribute.hasOwnProperty(skillGroupId))
						underlyingAttribute = CONFIG.SPACE1889.skillGroupUnderlyingAttribute[skillGroupId];

					rating = this.GetSkillRating(actor, skillId, underlyingAttribute, true);
				}
				return rating;
			}

			for (let skill of skillGroups)
			{
				if (skill.system.rating > rating)
					rating = skill.system.rating;
			}

			const universalistLevel = SPACE1889Helper.getTalentLevel(actor, "universalist");
			const vielseitigId = "vielseitig" + skillGroupId.replace(/^(.)/, function (b) { return b.toUpperCase(); });
			const talent = actor.talents.find(v => v.system.id == vielseitigId);
			let malus = 2 - Math.max(0, universalistLevel - 1);
			if (talent != undefined && talent != null)
				malus = 0;

			return Math.max(0, rating - malus);
		}

		return this.GetSkillRating(actor, skillId, "");
	}

	_CalcThings(actor)
	{
		this._getActorDerivedSpace1889Data(actor).foreignLanguageLimit = this.GetForeignLanguageLimit(actor);
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
		let rating = this.GetSkillRating(actor, "linguistik", "int");

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

	getOffhandModificator(actorType, weapon)
	{
		if (actorType !== "character" && actorType !== "npc")
			return 0;

		if (weapon?.system?.usedHands !== "offHand")
			return 0;

		return (SPACE1889Helper.getTalentLevel(this, "beidhaendig") == 0) ? -2 : 0;
	}

	CalcAndSetBlockData(actor)
	{
		const block = this.calculateBlockData(actor);
		this._getActorDerivedSpace1889Data(actor).block = block;
		return block;
	}

	calculateBlockData(actor)
	{
		const label = game.i18n.format("SPACE1889.Block");
		if (this.HasNoActiveDefense(actor))
		{
			return {
				value: 0,
				instinctive: false,
				riposte: false,
				info: game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.format("SPACE1889.Block") }),
				label: label
			};
		}

		let rating = this.GetSkillRating(actor, "waffenlos", "str");
		let instinctive = false;
		let riposte = false;
		rating += actor.derived.armorTotal.bonus;

		for (let item of actor.items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.id == "blocken")
			{
				instinctive = true;
				rating += item.derived.level.total;
			}
			else if (item.system.id == "gegenschlag" && item.derived.level.total > 0)
			{
				rating += (item.derived.level.total - 1) * 2;
				riposte = true;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			rating += this.getPassiveDefense(actor);

		rating = Math.max(0, rating);
		let info = "";
		const defense = actor.derived.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Block");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defense < rating)
				info = game.i18n.format("SPACE1889.UseInstinctiveBlockParry", { rating: rating.toString(), rating2: (rating - 2).toString(), attackType1: waffenlos, attackType2: nahkampf, defence: defense.toString() });
			else
				info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			const tdb = this.getTotalDefenseBonus(actor);
			if (defense + tdb < rating)
				info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defense + tdb).toString(), talentName: name });
			else
				info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defense + tdb).toString(), talentName: name });
		}

		return { value: rating, instinctive, riposte, info, label };
	}

	CalcAndSetParryData(actor)
	{
		const parry = this.calculateParryData(actor);
		this._getActorDerivedSpace1889Data(actor).parry = parry;
		return parry;
	}

	calculateParryData(actor)
	{
		const label = game.i18n.format("SPACE1889.Parry");
		if (this.HasNoActiveDefense(actor))
		{
			return {
				value: 0,
				instinctive: false,
				riposte: false,
				riposteDamageType: "nonLethal",
				info: game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.format("SPACE1889.Parry") }),
				label: label
			};
		}

		const id = "nahkampf";
		let skillRating = 0;
		let riposteDamageType = "nonLethal";
		for (let weapon of actor.weapons)
		{
			if (weapon.system.usedHands == "none")
				continue;

			const resultSkillRating = weapon.derived.skillRating + this.getOffhandModificator(actor.type, weapon);
			if (weapon.system.skillId == id && resultSkillRating > skillRating)
			{
				skillRating = resultSkillRating;
				riposteDamageType = weapon.derived.ammunition?.damageType ? weapon.derived.ammunition.damageType : weapon.system.damageType;
			}
		}
		for (let shield of actor.shields)
		{
			if (shield.system.usedHands == "none")
				continue;
			const resultSkillRating = shield.derived.skillRating + this.getOffhandModificator(actor.type, shield);
			if (shield.system.skillId == id && resultSkillRating > skillRating)
			{
				skillRating = resultSkillRating;
				riposteDamageType = shield.system.damageType;
			}
		}

		const noWeapon = skillRating == 0;
		let instinctive = false;
		let riposte = false;
		if (!noWeapon)
		{
			skillRating += actor.derived.armorTotal.bonus;

			for (let item of actor.items)
			{
				if (item.type != "talent")
					continue;

				if (item.system.id == "parade")
				{
					instinctive = true;
					skillRating += item.derived.level.total;
				}
				else if (item.system.id == "riposte" && item.derived.level.total > 0)
				{
					skillRating += (item.derived.level.total - 1) * 2;
					riposte = true;
				}
			}

			if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
				skillRating += this.getPassiveDefense(actor);
		}

		skillRating = Math.max(0, skillRating);
		let info = "";
		const defense = actor.derived.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Parry");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defense < skillRating)
				info = game.i18n.format("SPACE1889.UseInstinctiveBlockParry", { rating: skillRating.toString(), rating2: skillRating.toString(), attackType1: nahkampf, attackType2: waffenlos, defence: defense.toString() });
			else
				info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			const tdb = this.getTotalDefenseBonus(actor);
			if (noWeapon)
				info = game.i18n.localize("SPACE1889.NoParryWithoutWeapon");
			else if (defense + tdb < skillRating)
				info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defense + tdb).toString(), talentName: name });
			else
				info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defense + tdb).toString(), talentName: name });
		}

		return { value: skillRating, instinctive, riposte, riposteDamageType, info, label };
	}

	CalcAndSetEvasionData(actor)
	{
		const evasion = this.calculateEvasionData(actor);
		this._getActorDerivedSpace1889Data(actor).evasion = evasion;
		return evasion;
	}

	calculateEvasionData(actor)
	{
		const label = game.i18n.format("SPACE1889.Evasion");
		if (this.HasNoActiveDefense(actor))
		{
			return {
				value: 0,
				instinctive: false,
				info: game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.format("SPACE1889.Evasion") }),
				label: label
			};
		}

		let instinctive = false;
		let rating = this.GetSkillRating(actor, "sportlichkeit", "str");
		rating = Math.max(rating, this.GetSkillRating(actor, "akrobatik", "dex"));
		rating += actor.derived.armorTotal.bonus;

		for (let item of actor.items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.id == "ausweichen")
			{
				instinctive = true;
				rating += item.derived.level.total;
				break;
			}
		}

		if (game.settings.get("space1889", "optionalBlockDogeParryRule"))
			rating += this.getPassiveDefense(actor);

		rating = Math.max(0, rating);
		let info = "";
		const defense = actor.derived.secondaries.defense.total;
		const name = game.i18n.format("SPACE1889.Evasion");
		const waffenlos = game.i18n.format("SPACE1889.SkillWaffenlos");
		const nahkampf = game.i18n.format("SPACE1889.SkillNahkampf");
		if (instinctive)
		{
			if (defense < rating)
				info = game.i18n.format("SPACE1889.UseInstinctiveEvasion", { rating: rating.toString(), defence: defense.toString() });
			else
				info = game.i18n.format("SPACE1889.UselessInstinctiveBlockParryEvasion", { talentName: name });
		}
		else
		{
			const tdb = this.getTotalDefenseBonus(actor);
			if (defense + tdb < rating)
				info = game.i18n.format("SPACE1889.UseBlockParryEvasion", { fullDefence: (defense + tdb).toString(), talentName: name });
			else
				info = game.i18n.format("SPACE1889.UselessBlockParryEvasion", { defence: (defense + tdb).toString(), talentName: name });
		}

		return { value: rating, instinctive, info, label };
	}

	async CalcContainerLoad(actor)
	{
		if (!SPACE1889Helper.hasOwnership(actor))
			return;

		for (let container of actor.containers)
		{
			let load = 0;
			const quantityLists = [actor.gear, actor.ammunitions];
			for (let list of quantityLists)
			{
				for (let item of list)
				{
					if (item.system.containerId == container._id)
						load += item.system.weight * item.system.quantity;
				}
			}
			let nonQuantityLists = [actor.armors, actor.weapons];
			if (actor.shields && actor.shields.length > 0)
				nonQuantityLists.push(actor.shields);

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

	CalcAndSetGravity(actor)
	{
		const gravity = this.calculateGravity(actor);
		this._getDerivedSpace1889Data().gravity = gravity;
		return gravity;
	}

	calculateGravity(actor)
	{
		const gravity = SPACE1889Helper.getGravity();
		let acclimatizationMalus = 0;
		const timePassedInSeconds = SPACE1889Helper.getTimePassedSinceLastGravityChange();
		let acclimatizationBaseTime = "12h";
		let gravityMalusReduction = 0;
		if (timePassedInSeconds !== undefined)
		{
			let talentLevel = SPACE1889Helper.getTalentLevel(actor, "schwerkrafterfahren");
			if (talentLevel > 4)
				talentLevel = 4;
			if (talentLevel < 0)
				talentLevel = 0;

			const acclimatizationTimes = [12 * 3600, 6 * 3600, 3 * 3600, 3 * 1800, 3 * 900];
			const reduction = [0, 1, 2, 4, 8];
			acclimatizationMalus = timePassedInSeconds < acclimatizationTimes[talentLevel] ? 1 : 0;
			acclimatizationBaseTime = this.FormatDuration(acclimatizationTimes[talentLevel]);
			gravityMalusReduction = reduction[talentLevel];
		}

		const malusToHomeWorld = SPACE1889Helper.getMalusToHomeWorld(actor);
		gravity.acclimatizationMalus = acclimatizationMalus;
		gravity.malus = Math.max(0, malusToHomeWorld - gravityMalusReduction) + acclimatizationMalus;
		gravity.malusToolTip = gravity.malus > 0 
			? game.i18n.format("SPACE1889.GravityMalusTooltip", { malus: gravity.malus, acclimatization: acclimatizationMalus, baseTime: acclimatizationBaseTime }) 
			: "";
		return gravity;
	}


	CalcAndSetLoad(actor)
	{
		const derivedData = this._getDerivedSpace1889Data();
		const gravity = this.CalcAndSetGravity(actor);
		const loadInfo = this.calculateLoad(actor, gravity);
		derivedData.load = loadInfo;
		return loadInfo;
	}

	calculateLoad(actor, gravity)
	{
		const gravityFactor = gravity.gravityFactor;

		let str = actor.derived.abilities["str"].total;

		for (let item of actor.items)
		{
			if (item.type != "talent")
				continue;

			if (item.system.id == "packesel")
			{
				str += item.derived.level.total;
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
			if (item.type == "item" || item.type == "ammunition" || item.type === "lightSource" || item.type === "vision")
				itemWeight = item.system.weight * item.system.quantity;
			else if (item.type == "weapon" && item.system.skillId == "geschuetze" && item.system.location == 'mounted')
				continue;
			else if (item.type == "weapon" || item.type == "armor" || item.type == "shield")
				itemWeight = item.system.weight;
			else
				continue;

			if (item.system.containerId == null)
				loadBody += itemWeight;
		}
		itemWeight *= gravityFactor;
		loadBody *= gravityFactor;

		for (let container of actor.containers)
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

		return {
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
		};
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
	* @param {boolean} isSkillGroup
	* @returns {number}
	*/
	GetSkillRating(actor, skillId, underlyingAbility, isSkillGroup = false)
	{
		let rating = 0;

		let skill = actor.skills?.find(entry => entry.system.id === skillId);
		if (skill)
			return skill.system.rating;

		const universalistLevel = SPACE1889Helper.getTalentLevel(actor, "universalist");
		let bonus = 0;
		if (universalistLevel > 0)
			bonus = isSkillGroup ? Math.max(0, universalistLevel - 1) : Math.max(0, universalistLevel + 1);

		if (underlyingAbility !== "" && this._getPrimaereAttributeKeys(actor).indexOf(underlyingAbility) >= 0)
			return Math.max(0, bonus + actor.derived.abilities[underlyingAbility].total - 2);

		let underlying = this.FindUnderlyingAbility(actor, skillId);
		if (underlying !== "" && actor.derived.abilities?.hasOwnProperty(underlying) >= 0)
			return Math.max(0, bonus + actor.derived.abilities[underlying].total - 2);
		return 0;
	}

	_getPrimaereAttributeKeys(actor)
	{
		return Object.keys(actor.system.abilities);
	}

	/**
	 * 
	 * @param actor
	 * @param skillId
	 * @returns {string} 
	 */
	FindUnderlyingAbility(actor, skillId)
	{
		if (skillId === "")
			return "";

		//Talente überprüfen ob ein rerouting auf ein anderes Attribut aktiv ist
		const talent = actor.talents?.find(t => t.system.changedSkill == skillId && t.system.newBase != "");
		if (talent != undefined)
			return talent.system.newBase;

		const element = CONFIG.SPACE1889.skillUnderlyingAttribute?.find(e => e[0] === skillId);
		if (element != undefined)
			return element[1];

		if (game?.items)
		{
			//local suchen
			let localSkill = game.items.find(x => x.system?.id === skillId);
			if (localSkill)
				return localSkill.system.underlyingAttribute;

			ui.notifications.warn(game.i18n.format("SPACE1889.UnknownSkillWarning", { skillId: skillId.toString() }));
		}

		return "";
	}

	/**
	 * @returns {boolean} 
	 */
	isSwarm()
	{
		return undefined !== this.talents?.find(t => t.system.id == "schwarm");
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
			if (item.type === "skill")
			{
				xp += this.CalcPartialSum(item.system.level) * 2;
				if (item.system.noEpFirstLevel && item.system.level >= 1 && item.system.noEpLevels > 0)
				{
					const noEpLevels = Math.min(item.system.noEpLevels, item.system.level);
					xp -= this.CalcPartialSum(noEpLevels) * 2
				}
			}
			else if (item.type === "specialization")
			{
				if (houseRoule)
					xp += this.CalcPartialSum(item.system.level);
				else
					xp += item.system.level * 3;
				if (item.system.noEpFirstLevel && item.system.noEpLevels > 0)
				{
					const noEpLevels = Math.min(item.system.noEpLevels, item.system.level);
					xp -= houseRoule ? this.CalcPartialSum(noEpLevels) : (noEpLevels * 3);
				}
					
			}
			else if (item.type === "talent")
			{
				if (!(item.system.noEp && item.system.noEpLevels > 0))
					xp += item.system.level.value * baseXp;
				else
				{
					const noCostLevels = Math.max(0, item.system.noEpLevels);
					xp += (Math.max(0, item.system.level.value - noCostLevels)) * baseXp;
				}
			}
			else if (item.type == "resource")
			{
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

				if (item.system.noEp && item.system.noEpLevels > 0 && item.system.level.value > 0)
				{
					const noCostLevels = Math.min(item.system.level.value, item.system.noEpLevels);
					const firstLevel = item.system.isBase ? 8 : baseXp;
					xp -= firstLevel;
					if (noCostLevels > 1)
						xp -= (noCostLevels - 1) * baseXp
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
		return (n * (n + 1)) / 2;
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

		for (const injury of actor.injuries)
		{
//			injury.system.remainingDamage = SPACE1889Healing.calcRemainingDamage(injury);
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
			actor.system.health.max = actor.derived.abilities.con.total + actor.derived.abilities.wil.total + sizeTotal + this.getBonusFromTalents("max", "health", actor.items);
		}
		const newHealth = actor.system.health.max - damage;

		actor.system.health.value = newHealth;
		if (actor.type == "vehicle")
		{
			const derivedData = this._getActorDerivedSpace1889Data(actor);
			const health = {
				controlDamage: controlDamage,
				propulsionDamage: propulsionDamage,
				gunDamage: gunDamage
			}
			derivedData.health = health;
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
		if (this.type !== 'character')
			return;

		// Process additional character data here.
	}

	/**
	 * Prepare NPC roll data.
	 */
	_getNpcRollData(data)
	{
		if (this.type !== 'npc') return;

		// Process additional NPC data here.
	}

	canDoUseItem(item)
	{
		if (!item)
			return false;

		const container = this.containers.find(e => e._id == item.system.containerId);
		if (container && !(container.system.portable && container.system.carried))
			return false;
		return true;
	}

	getItemDiceCount(item)
	{
		return SPACE1889RollHelper.getDieCount(item, this);
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
			`<h5 ${headerClass}><strong>${name}</strong> <small>[${type}]</small></h5><div class="${textClass}">${desc}</div>`;
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
			moveExtra = `<h5 ${headerClass}>${this.derived.secondaries.move.inSiUnits}</h5>`;

		const composition =
			`<h5 ${headerClass}><strong>${name}</strong> <small>[${type}]</small></h5>${moveExtra}<div class="${textClass}">${desc}</div>`;
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
			`<h4 ${headerClass}><strong>${name}</strong></h4><div class="${textClass}">${desc}</div>`;
		return composition;
	}

	showAttributeInfo(name, key, whisper)
	{
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get('core', 'rollMode');
		const langId = this.getLangId(key) + "Desc";

		let desc = `<h5><strong>${name}</strong></h5><p>${game.i18n.localize(langId) ?? langId}</p>`;

		ChatMessage.create({
			speaker: speaker,
			rollMode: rollMode,
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

	getTalentAttacks()
	{
		let talents = [];
		for (const talent of this.talents)
		{
			if (talent.isAttackTalent())
				talents.push(talent);
		}
		return talents;
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
		const dieCount = this.derived.abilities[key]?.total;
		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(game.i18n.localize(CONFIG.SPACE1889.abilities[key]), key, evaluation.whisperInfo);

		const showDialog = evaluation.showDialog || game.settings.get("space1889", "showDialogForAllAttributeRolls");

		return this.rollAttribute(dieCount, showDialog, key, evaluation.specialDialog);
	}

	rollSecondary(key, event)
	{
		const dieCount = this.derived.secondaries[key]?.total;
		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		if (evaluation.showInfoOnly)
			return this.showAttributeInfo(game.i18n.localize(CONFIG.SPACE1889.secondaries[key]), key, evaluation.whisperInfo);

		return this.rollAttribute(dieCount, evaluation.showDialog, key);
	}

	rollSkill(key, event)
	{
		const item = this.skills.find(e => e.system.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItemFromEvent(item, this, event);
		}
	}

	rollSpecialization(key, event)
	{
		const item = this.speciSkills.find(e => e.system.id == key);
		if (item != undefined)
		{
			SPACE1889RollHelper.rollItemFromEvent(item, this, event);
		}
	}

	rollAttack(key, event)
	{
		let item = this.weapons.find(e => e.system.id == key);
		if (item == undefined)
			item = this.shields.find(e => e.system.id === key);

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
		const item = this.talents.find(e => e.system.id == key);
		if (item != undefined)
			SPACE1889RollHelper.rollItemFromEvent(item, this, event);
	}


	/**
	 * 
	 * @param {object} item item
	 */
	rollItemInfo(item)
	{
		if (item != undefined)
			SPACE1889RollHelper.rollItemInfo(item, this);
	}

	rollDefense(key, event)
	{
		let dieCount = 0;
		let label = "";
		switch (key)
		{
			case 'block':
					dieCount = this.block.value;  // muss das nicht this.derived.block.value heißen?
				label = game.i18n.localize("SPACE1889.Block");
				break;
			case 'parry':
					dieCount = this.parry.value;
				label = game.i18n.localize("SPACE1889.Parry");
				break;
			case 'evasion':
					dieCount = this.evasion.value;
				label = game.i18n.localize("SPACE1889.Evasion");
				break;
			case 'defense':
				dieCount = this.derived.secondaries.defense.total;
				label = game.i18n.localize("SPACE1889.SecondaryAttributeDef");
				break;
			case 'activeDefense':
				dieCount = this.derived.secondaries.defense.activeTotal;
				label = game.i18n.localize("SPACE1889.ActiveDefense");
				break;
			case 'passiveDefense':
				dieCount = this.derived.secondaries.defense.passiveTotal;
				label = game.i18n.localize("SPACE1889.PassiveDefense");
				break;
			case 'totalDefense':
				dieCount = this.derived.secondaries.defense.total + this.getTotalDefenseBonus(this);
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

	rollCrew(key, event)
	{
		if (!CONFIG.SPACE1889.vehicleCrewPositions[key] || this.derived?.positions[key]?.total == undefined)
			return;

		const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
		const diceCount = this.derived.positions[key].total;
		this.rollAttribute(diceCount, evaluation.showDialog, key, evaluation.specialDialog)
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
		const actorName = theActor.isToken && theActor.token ? theActor.token.name : theActor.name;

		let singleOnly = specialDialog;

		const baseValue = dieCount;
		let attributValue = baseValue;
		const isAbility = this.isAbility(key);
		if (isAbility && !specialDialog)
			attributValue = baseValue * 2;

		let info = game.i18n.localize("SPACE1889.Probe") ?? "Probe";
		info += ":";

		let deduction = 0;
		if ((key == "str" || key == "dex") && theActor.healthDeduction > 0)
		{
			deduction = theActor.healthDeduction;
			attributValue -= deduction;
			const deductionInfo = '<p>' + game.i18n.format("SPACE1889.HealthDeductionRollInfo", { value: theActor.healthDeduction }) + '</p>';
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

		if (!showDialog)
		{
			ChatMessage.create(getChatData(attributValue, 0, chatOption), {});
			return;
		}

		let checkbox = '<div style="display: grid; grid-template-columns: 50%  50%;">';
		checkbox += '<input type="' + (isAbility ? "checkbox" : "hidden") + '" id="singlePrimaryAttribute" class="singlePrimaryAttribute" text-align="left"' + (singleOnly ? " checked>" : ">");
		if (isAbility)
			checkbox += '<div class="item-name">  ' + game.i18n.localize("SPACE1889.SingleValueOnly") + '</div > ';
		checkbox += '</div>'; //</li>'

		let chatOptions = SPACE1889Helper.getHtmlChatOptions();

		function recalc()
		{
			singleOnly = $('#singlePrimaryAttribute')[0].checked;
			let mod = Number($("#modifier")[0].value);

			attributValue = getDiceCount(singleOnly, mod, deduction);

			$("#anzahlDerWuerfel")[0].value = attributValue;
		}

		let dialogue = foundry.applications.api.DialogV2.wait(
		{
			window: { title: `${actorName}: ${titleName}`, resizable: true },
			position: { width: 315 },
			content: `
				<form>
				<h5 style="margin-top: 0px; margin-bottom: 0px">${attributeName}: ${baseValue}</h5>
				${checkbox}


				<div style="display: grid; grid-template-columns: 50%  50%; grid-template-rows: 100%;">
					<div style="margin-top:4px; margin-left: 5px">${modifierLabel}:</div> 
					<div>
						<input style="max-width: 110px; text-align: center" type="number" class="modInput" id="modifier" value = "0">
					</div>
				</div>
				<h5 style="margin-top: 0px; margin-bottom: 0px">
					<div style="display: grid; grid-template-columns: 50%  50%;">
						<div style="margin-top:14px; margin-left: 5px">${labelNumberOfDice}:</div> 
						<div>
							<input style="max-width: 110px; text-align: center" id="anzahlDerWuerfel" value="10" disabled="true" visible="false">
						<div>
					</div>
				</h5>
				<hr>
				<div><select id="choices" name="choices">${chatOptions}</select></div>
				</form>`,
			buttons: [
				{
					action: 'ok',
					icon: '',
					label: game.i18n.localize("SPACE1889.Go"),
					default: true,
					callback: (event, button, dialog) => 
					{
						const mod = parseInt(button.form.elements.modifier.value);
						const single = button.form.elements.singlePrimaryAttribute.checked;
						const chatoption = button.form.elements.choices.value;
						attributValue = getDiceCount(single, mod, deduction);

						ChatMessage.create(getChatData(attributValue, mod, chatoption), {});
					}
				},
				{
					action: 'abbruch',
					label: game.i18n.localize("SPACE1889.Cancel"),
					callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
					icon: `<i class="fas fa-times"></i>`
				}
			],
			form: { closeOnSbmit: false },
			render: (_event, _dialog) =>
			{
				recalc();
				document.getElementsByClassName('singlePrimaryAttribute')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('modInput')[0].addEventListener("change", recalc, false);
			}
		});

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
			let messageContent = `<div><h4><strong>${attributeName}</strong>${attribNameAddition}</h4></div>`;
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
