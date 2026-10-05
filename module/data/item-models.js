import SPACE1889Healing from "../helpers/healing.js";
import SPACE1889Helper from "../helpers/helper.js";

const fields = foundry.data.fields;

function numberField(initial = 0, options = {}) {
	return new fields.NumberField({ initial, ...options });
}

function integerField(initial = 0, options = {}) {
	return new fields.NumberField({ initial, integer: true, ...options });
}

function stringField(initial = "", options = {}) {
	return new fields.StringField({ initial, ...options });
}

function booleanField(initial = false, options = {}) {
	return new fields.BooleanField({ initial, ...options });
}

function descriptionField() {
	return {
		description: stringField("")
	};
}

function idField() {
	return {
		id: stringField("")
	};
}

function sourceField() {
	return {
		publication: stringField("GRW"),
		page: stringField("")
	};
}

function weightField() {
	return {
		weight: numberField(0)
	};
}

function priceField() {
	return {
		price: stringField("")
	};
}

function locationField() {
	return {
		location: stringField("koerper"),
	};
}

function containerField() {
	return {
		containerId: new fields.StringField({ initial: null, required: false, nullable: true })
	};
}

function quantityField(initial = 1) {
	return {
		quantity: integerField(initial)
	};
}

function skillBaseField() {
	return {
		basis: integerField(0),
		level: integerField(1),
		rating: integerField(0),
	};
}

function sourceSchemaField() {
	return new fields.SchemaField(sourceField());
}

function quantitySchemaField(initial = 1) {
	return new fields.SchemaField(quantityField(initial));
}

function levelRangeField(initial = 0, min = 0, max = 0) {
	return new fields.SchemaField({
		value: integerField(initial),
		min: integerField(min),
		max: integerField(max),
	});
}

function vehicleWeaponField() {
	return new fields.SchemaField({
		spot: stringField("bow"),
		isSwivelMounted: booleanField(false),
		swivelingRange: stringField("120")
	});
}

function weaponAmmunitionField() {
	return new fields.SchemaField({
		currentItemId: stringField(""),
		type: stringField("default"),
		caliber: stringField(""),
		remainingRounds: integerField(0),
		usedLoadingActions: integerField(0)
	});
}

function combatInfoField() {
	return new fields.SchemaField({
		id: stringField(""),
		round: integerField(0),
		turn: integerField(0)
	});
}

class Space1889BaseItemDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			...descriptionField()
		};
	}
}

class Space1889PhysicalItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...weightField(),
			...locationField(),
			...priceField(),
			...idField(),
			...containerField()
		};
	}

	// this zeigt auf das Data Model
	// this.parent zeigt auf das Item das das DataModel verwendet
	// this.parent.parent zeigt auf den Actor 
	get locationShort()
	{
		if (this.containerId && this.parent && this.parent.parent)
		{
			const container = this.parent.parent.items.get(this.containerId);
			if (container)
			{
				const short = container.name.substr(0, 3);
				return short;
			}
		}
		return game.i18n.localize("SPACE1889.StorageLocationKoerperAbbr");
	}

	get locationLong()
	{
		if (this.containerId && this.parent && this.parent.parent)
		{
			const container = this.parent.parent.items.get(this.containerId);
			if (container)
			{
				return container.name;
			}
		}
		return game.i18n.localize("SPACE1889.StorageLocationKoerper");
	}
}

export class Space1889ItemItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...quantityField(1)
		};
	}
}

export class Space1889ContainerItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			payloadWeight: numberField(0),
			totalWeight: numberField(0),
			portable: booleanField(false),
			carried: booleanField(false),
			compressed: booleanField(false)
		};
	}
}

export class Space1889VisionItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...quantityField(1),
			isActive: booleanField(false),
			duration: integerField(60),
			itemUseType: stringField("consumables"),
			interruptible: booleanField(false),
			emissionStartTimestamp: integerField(0),
			usedDuration: integerField(0),
			visionRange: stringField("15"),
			visionMode: stringField("darkvision"),
			visionAngle: integerField(360),
			visionAttenuation: numberField(0.1),
			visionBrightness: numberField(1),
			visionColor: stringField(""),
			visionContrast: numberField(0),
			visionSaturation: numberField(-1)
		};
	}
}

export class Space1889LightSourceItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...quantityField(1),
			requiredHands: integerField(1),
			usedHands: stringField("none"),
			isActive: booleanField(false),
			duration: integerField(60),
			itemUseType: stringField("consumables"),
			interruptible: booleanField(false),
			emissionStartTimestamp: integerField(0),
			usedDuration: integerField(0),
			probabilityOfBreaking: integerField(0),
			probabilityOfFailing: integerField(0),
			dimRadius: numberField(12),
			brightRadius: stringField("6"),
			angle: integerField(360),
			color: stringField("#000000"),
			alpha: numberField(0.5),
			animationType: stringField("none"),
			animationSpeed: integerField(5),
			animationIntensity: integerField(5),
			reverseDirection: booleanField(false),
			coloration: integerField(1),
			luminosity: numberField(0.5),
			attenuation: numberField(0.5),
			saturation: numberField(0),
			contrast: numberField(0),
			shadows: numberField(0),
		};
	}
	get usedHandsInfo()
	{
		if (this.requiredHands > 0)
			return game.i18n.localize(CONFIG.SPACE1889.weaponHand[this.usedHands]);

		return game.i18n.localize("SPACE1889.Ready");
	}

	get usedHandsIcon()
	{
		if (this.requiredHands > 0)
			return game.i18n.localize(CONFIG.SPACE1889.weaponHandIcon[this.usedHands]);

		return "far fa-thumb-tack";
	}

	get requiredHandsTooltip()
	{
		const infoObject = CONFIG.SPACE1889.lightSourceHands[item.system.requiredHands];
		return infoObject ? game.i18n.localize(infoObject.infoId) : "";
	}
}

export class Space1889TalentItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField(),
			source: sourceSchemaField(),
			level: levelRangeField(1, 1, 3),
			newBase: stringField(""),
			changedSkill: stringField(""),
			preconditionType: stringField("nothing"),
			preconditionName: stringField(""),
			isGroup: booleanField(false),
			preconditionLevel: integerField(0),
			secondPreconditionType: stringField("nothing"),
			secondPreconditionName: stringField(""),
			secondPreconditionLevel: integerField(0),
			isOrOperator: booleanField(false),
			bonus: integerField(0),
			bonusTarget: stringField(""),
			bonusTargetType: stringField(""),
			bonusStartLevel: integerField(1),
			info: stringField(""),
			noEp: booleanField(false),
			noEpSource: stringField(""),
			noEpLevels: integerField(1)
		};
	}

	get bonusTargetLangId()
	{
		const base = this.bonusTargetType != "" ? this.bonusTargetType.replace(/^(.)/, function (c) { return c.toUpperCase(); }) : "Skill";
		return 'SPACE1889.' + base + this.bonusTarget.replace(/^(.)/, function (b) { return b.toUpperCase(); });
	}

	get isRollable()
	{
		if (this.id == "geschaerfterSinn"
			|| this.id == "paralysierenderSchlag"
			|| this.id == "assassine"
			|| this.id == "eigenartigerKampfstil")
		{
			return true;
		}
		return false;
	}

	get showDetail()
	{
		if (this.id === "geschaerfterSinn"
			|| this.id === "begabung"
			|| this.id === "eigenartigerKampfstil"
			|| this.id === "schwerkraftadaption")
		{
			return true;
		}
		return false;
	}
}

export class Space1889SkillItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...skillBaseField(),
			...idField(),
			source: sourceSchemaField(),
			underlyingAttribute: stringField("dex"),
			talentBonus: integerField(0),
			isSkillGroup: booleanField(false),
			skillGroupName: stringField(""),
			noEpFirstLevel: booleanField(false),
			noEpSource: stringField(""),
			noEpLevels: integerField(1)
		};
	}
	get isFightingSkill()
	{
		let fightingSkills = ["geschuetze", "nahkampf", "primitiverFernkampf", "schusswaffen", "sprengstoffe", "waffenlos"];
		return fightingSkills.includes(this.id);
	}
}

export class Space1889SpecializationItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...skillBaseField(),
			...idField(),
			underlyingSkillId: stringField("akrobatik"),
			noSelection: booleanField(false),
			noEpFirstLevel: booleanField(false),
			noEpSource: stringField(""),
			noEpLevels: integerField(1)
		};
	}
}

export class Space1889WeaponItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			skillId: stringField("none"),
			specializationId: stringField("none"),
			damage: integerField(0),
			damageType: stringField("lethal"),
			strengthThreshold: integerField(0),
			range: stringField(""),
			hasTelescopicSight: booleanField(false),
			capacity: integerField(1),
			capacityType: stringField("default"),
			rateOfFire: stringField(""),
			speed: stringField(""),
			size: integerField(0),
			vehicle: vehicleWeaponField(),
			isAreaDamage: booleanField(false),
			ammunitionType: stringField(""),
			ammunition: weaponAmmunitionField(),
			isTwoHanded: booleanField(false),
			usedHands: stringField("none"),
			effect: stringField("none"),
			effectDurationCombatTurns: integerField(1),
			effectOnly: booleanField(false)
		};
	}

	get isRangeWeapon()
	{
		if (this.skillId != "waffenlos" && this.skillId != "nahkampf")
		{
			const range = parseFloat(SPACE1889Helper.replaceCommaWithPoint(this.range));
			return range > 0.0;
		}
		return false;
	}

	get usedHandsInfo()
	{
		return game.i18n.localize(CONFIG.SPACE1889.weaponHand[this.usedHands]);
	}

	get usedHandsIcon()
	{
		return game.i18n.localize(CONFIG.SPACE1889.weaponHandIcon[this.usedHands]);
	}
}

export class Space1889AmmunitionItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...quantityField(1),
			type: stringField("default"),
			capacityType: stringField("default"),
			capacity: integerField(1),
			caliber: stringField(""),
			damageType: stringField("lethal"),
			damageModifikator: integerField(0),
			rangeModFactor: numberField(1),
			isConeAttack: booleanField(false)
		};
	}

	get typeDisplay()
	{
		return game.i18n.localize(CONFIG.SPACE1889.weaponAmmunitionTypes[this.type]);
	}

	get capacityTypeDisplay()
	{
		return game.i18n.localize(CONFIG.SPACE1889.ammunitionCapacityTypes[this.capacityType]);
	}
}

export class Space1889WeaknessItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField(),
			type: stringField("")
		};
	}
}

export class Space1889ResourceItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField(),
			level: levelRangeField(0, 0, 5),
			isBase: booleanField(false),
			noEp: booleanField(false),
			noEpSource: stringField(""),
			noEpLevels: integerField(1)
		};
	}
}

export class Space1889LanguageItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField(),
			old: booleanField(false),
			familyId: stringField(""),
			isDialectSourceId: stringField("no"),
			originId: stringField(""),
		};
	}

	get origin()
	{
		return game.i18n.localize(CONFIG.SPACE1889.languageOrigins[this.originId]);
	}

	get family()
	{
		return game.i18n.localize(CONFIG.SPACE1889.familyOflanguages[this.familyId]);
		item.derived.oldInfo = item.system.old ? game.i18n.localize('SPACE1889.OldLanguageInfo') : "";
	}

	get dialect()
	{
		return game.i18n.localize(CONFIG.SPACE1889.languages[this.isDialectSourceId]);
	}

	get oldInfo()
	{
		return this.old ? game.i18n.localize('SPACE1889.OldLanguageInfo') : "";
	}

}

export class Space1889ArmorItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			defenseBonus: integerField(1),
			dexPenalty: integerField(0),
			strengthThreshold: integerField(0)
		};
	}
}

export class Space1889ShieldItemDataModel extends Space1889PhysicalItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			defenseBonus: integerField(1),
			dexPenalty: integerField(0),
			strengthThreshold: integerField(0),
			isTwoHanded: booleanField(false),
			usedHands: stringField("none"),
			skillId: stringField("nahkampf"),
			specializationId: stringField("schilde"),
			damage: integerField(0),
			damageType: stringField("nonLethal")
		};
	}
	get usedHandsInfo()
	{
		return game.i18n.localize(CONFIG.SPACE1889.weaponHand[this.usedHands]);
	}

	get usedHandsIcon()
	{
		return game.i18n.localize(CONFIG.SPACE1889.weaponHandIcon[this.usedHands]);
	}

	get damageTypeDisplay()
	{
		return game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[this.damageType]);
	}
}

export class Space1889DamageItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			damage: integerField(1),
			damageType: stringField("lethal"),
			healingFactor: numberField(1),
			timeToNextCure: stringField(""),
			dataOfTheEvent: stringField(""),
			eventTimestamp: integerField(0),
			combatInfo: combatInfoField(),
			stylePointDamageReduction: integerField(0),
			firstAidApplied: booleanField(false),
			firstAidHealing: integerField(0),
			firstAidNonLethalConvertedId: stringField(""),
			completedHealingProgress: numberField(0),
		};
	}

	get damageTypeDisplay()
	{
		if (this.parent?.parent?.type == "vehicle")
			return game.i18n.localize(CONFIG.SPACE1889.vehicleDamageTypeAbbreviations[this.damageType]);

		return game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[this.damageType]);
	}

	get remainingDamage()
	{
		return SPACE1889Healing.calcRemainingDamage(this.parent);
	}
}

export class Space1889CurrencyItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField(),
			...quantityField(1),
			type: stringField("money"),
			exchangeRateForOnePound: numberField(1)
		};
	}

	get exchangeValue()
	{
		const exchangeRatio = 20 / this.exchangeRateForOnePound;
		if (exchangeRatio == 0)
			return "?";

		const sumShilling = Number(this.quantity) * exchangeRatio;

		const pound = Math.floor(sumShilling / 20);
		const shilling = Math.round(sumShilling - (pound * 20));

		let value = "";
		if (pound > 0)
			value = pound.toString() + game.i18n.localize("SPACE1889.CurrencyBritishPoundsAbbr") + " ";
		if (shilling > 0)
			value += shilling.toString() + game.i18n.localize("SPACE1889.CurrencyBritishShillingAbbr");

		if (value == "")
			value = "<< 1" + game.i18n.localize("SPACE1889.CurrencyBritishShillingAbbr");

		return value;
	}
}

export class Space1889SpeciesItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField()
		};
	}
}

export class Space1889ArchetypeItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField()
		};
	}
}

export class Space1889MotivationItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...idField()
		};
	}
}

export class Space1889ExtendedActionItemDataModel extends Space1889BaseItemDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			typeKey: stringField("primary"),
			skillOrAttributeId: stringField("con"),
			skillGroupId: stringField(""),
			spezialisationId: stringField(""),
			spezialisationLabel: stringField(""),
			useSpezialisation: booleanField(false),
			noSelection: booleanField(false),
			useDeductions: booleanField(true),
			difficultyRating: integerField(2),
			totalNumberOfSuccesses: integerField(10),
			timeInterval: stringField("1h"),
			timestampLastTry: integerField(0),
			attemptsMade: integerField(0),
			successes: integerField(0)
		};
	}
}

export const SPACE1889_ITEM_DATA_MODELS = {
	archetype: Space1889ArchetypeItemDataModel,
	container: Space1889ContainerItemDataModel,
	skill: Space1889SkillItemDataModel,
	item: Space1889ItemItemDataModel,
	extended_action: Space1889ExtendedActionItemDataModel,
	lightSource: Space1889LightSourceItemDataModel,
	motivation: Space1889MotivationItemDataModel,
	ammunition: Space1889AmmunitionItemDataModel,
	resource: Space1889ResourceItemDataModel,
	armor: Space1889ArmorItemDataModel,
	damage: Space1889DamageItemDataModel,
	weakness: Space1889WeaknessItemDataModel,
	vision: Space1889VisionItemDataModel,
	shield: Space1889ShieldItemDataModel,
	specialization: Space1889SpecializationItemDataModel,
	species: Space1889SpeciesItemDataModel,
	language: Space1889LanguageItemDataModel,
	talent: Space1889TalentItemDataModel,
	weapon: Space1889WeaponItemDataModel,
	currency: Space1889CurrencyItemDataModel
};
