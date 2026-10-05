const fields = foundry.data.fields;

function stringArrayField() {
	return new fields.ArrayField(new fields.StringField(), { initial: () => [] });
}

function objectArrayField() {
	return new fields.ArrayField(new fields.ObjectField(), { initial: () => [] });
}

function objectField(initial = {}) {
	return new fields.ObjectField({ initial: () => foundry.utils.deepClone(initial) });
}

function valueField(initial = 0, options = {}) {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial, integer: true, ...options }),
	});
}

function valueTotalField( value = 0, total = 0) {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: value, integer: true }),
		total: new fields.NumberField({ initial: total, integer: true }),
	});
}


function boundedValueField(value, min, max) {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: value, integer: true }),
		min: new fields.NumberField({ initial: min, integer: true }),
		max: new fields.NumberField({ initial: max, integer: true })
	});
}

function maxBoundedValueField(value, max) {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: value, integer: true }),
		max: new fields.NumberField({ initial: max, integer: true })
	});
}

function labeledAttributeField(initial = "") {
	return new fields.SchemaField({
		value: new fields.StringField({ initial })
	});
}

function notesField() {
	return new fields.SchemaField({
		value: new fields.StringField({ initial: "" }),
		gmInfo: new fields.StringField({ initial: "" })
	});
}

function biographyFields() {
	return {
		biography: new fields.StringField({ initial: "" }),
		age: new fields.StringField({ initial: "" }),
		dateOfBirth: new fields.StringField({ initial: "" }),
		height: new fields.StringField({ initial: "" }),
		weight: new fields.StringField({ initial: "" }),
		homeGravity: new fields.StringField({ initial: "earth" })
	};
}

function abilitiesField() {
	return new fields.SchemaField({
		con: valueField(1),
		dex: valueField(1),
		str: valueField(1),
		cha: valueField(1),
		int: valueField(1),
		wil: valueField(1)
	});
}

function secondariesField() {
	return new fields.SchemaField({
		size: valueField(0),
		move: valueField(0),
		perception: valueField(0),
		initiative: valueTotalField(0, 0),
		defense: valueField(0),
		stun: valueField(0)
	});
}

function healingField() {
	return new fields.SchemaField({
		currentHealingDamageId: new fields.StringField({ initial: "" }),
		startOfHealingTimeStamp: new fields.NumberField({ initial: 0, integer: true }),
		dehydration: new fields.BooleanField({ initial: false }),
		starvation: new fields.BooleanField({ initial: false })
	});
}

function visualisationField() {
	return new fields.SchemaField({
		compressedItems: new fields.BooleanField({ initial: false }),
		compressedSkills: new fields.BooleanField({ initial: false }),
		compressedTalents: new fields.BooleanField({ initial: false }),
		compressedWeapons: new fields.BooleanField({ initial: false }),
		compressedAmmunition: new fields.BooleanField({ initial: false }),
		compressedArmors: new fields.BooleanField({ initial: false }),
		compressedShields: new fields.BooleanField({ initial: false }),
		compressedExtendedActions: new fields.BooleanField({ initial: false }),
		compressedLightSources: new fields.BooleanField({ initial: false }),
		compressedVisions: new fields.BooleanField({ initial: false }),
		compressedDamage: new fields.BooleanField({ initial: false }),
		filterWeapons: new fields.BooleanField({ initial: false }),
		filterAmmunition: new fields.BooleanField({ initial: false }),
		filterArmors: new fields.BooleanField({ initial: false }),
		filterShields: new fields.BooleanField({ initial: false }),
		filterDamage: new fields.BooleanField({ initial: false }),
		filterExtendedAction: new fields.BooleanField({ initial: false })
	});
}

function xpField() {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: 0, integer: true }),
		used: new fields.NumberField({ initial: 0, integer: true }),
		available: new fields.NumberField({ initial: 0, integer: true })
	});
}

function crewField() {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: 1, integer: true }),
		max: new fields.NumberField({ initial: 1, integer: true }),
		experience: new fields.StringField({ initial: "regular" }),
		experienceValue: new fields.NumberField({ initial: 4, integer: true }),
		temper: new fields.StringField({ initial: "normal" })
	});
}

function positionField() {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: 0, integer: true }),
		actorId: new fields.StringField({ initial: "" }),
		staffed: new fields.BooleanField({ initial: true }),
	});
}

function positionsField() {
	return new fields.SchemaField({
		captain: positionField(),
		pilot: positionField(),
		copilot: positionField(),
		gunner: positionField(),
		signaler: positionField(),
		lookout: positionField(),
		mechanic: positionField(),
		medic: positionField()
	});
}

function healthField() {
	return new fields.SchemaField({
		value: new fields.NumberField({ initial: 10, integer: true }),
		min: new fields.NumberField({ initial: -20, integer: true }),
		max: new fields.NumberField({ initial: 10, integer: true })
	});
}

export class Space1889BaseActorDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			health: boundedValueField(10, -20, 10),
			notes: notesField(),
			abilities: abilitiesField(),
			secondaries: secondariesField()
		};
	}
}

export class Space1889CharacterLikeActorDataModel extends Space1889BaseActorDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...biographyFields(),
			style: valueField(5),
			healing: healingField(),
			visualisation: visualisationField(),
			attributes: new fields.SchemaField({
				archetype: labeledAttributeField("arbeiter"),
				species: labeledAttributeField("mensch"),
				motivation: labeledAttributeField("ueberleben")
			})
		};
	}
}

export class Space1889CharacterActorDataModel extends Space1889CharacterLikeActorDataModel {
	static defineSchema() {
		const schema = super.defineSchema();
		schema.attributes = new fields.SchemaField({
			xp: xpField(),
			archetype: labeledAttributeField("abenteurer"),
			species: labeledAttributeField("mensch"),
			motivation: labeledAttributeField("entdeckung")
		});
		return schema;
	}
}

export class Space1889NpcActorDataModel extends Space1889CharacterLikeActorDataModel {
	static defineSchema() {
		const schema = super.defineSchema();
		return schema;
	}
}

export class Space1889CreatureActorDataModel extends Space1889BaseActorDataModel {
	static defineSchema() {
		return {
			...super.defineSchema(),
			healing: healingField(),
			archetype: new fields.StringField({ initial: "animal" }),
			animalCompanionLevel: new fields.NumberField({ initial: 0, integer: true }),
			movementType: new fields.StringField({ initial: "manylegged" }),
			biography: new fields.StringField({ initial: "" }),
			origin: new fields.StringField({ initial: "merkur" })
		};
	}
}

export class Space1889VehicleActorDataModel extends Space1889BaseActorDataModel {
	static defineSchema() {
		return {
			health: healthField(),
			notes: notesField(),
			secondaries: secondariesField(),
			typeOrClass: new fields.StringField({ initial: "" }),
			isAirship: new fields.BooleanField({ initial: false }),
			isStrengthBasedTempo: new fields.BooleanField({ initial: false }),
			strengthTempoFactor: maxBoundedValueField(0, 10),
			weaponLoad: maxBoundedValueField(0, 0),
			pilotSkill: new fields.StringField({ initial: "fahren" }),
			size: new fields.NumberField({ initial: 0, integer: true }),
			passiveDefense: new fields.NumberField({ initial: 0, integer: true }),
			speed: maxBoundedValueField(0, 0),
			maneuverability: new fields.SchemaField({
				value: new fields.StringField({ initial: "0" }),
				max: new fields.NumberField({ initial: 0, integer: true })
			}),
			crew: crewField(),
			passenger: maxBoundedValueField(0, 0),
			price: new fields.StringField({ initial: "" }),
			weight2: new fields.StringField({ initial: "15t" }),
			description: new fields.StringField({ initial: "" }),
			positions: positionsField()
		};
	}
}

export const SPACE1889_ACTOR_DATA_MODELS = {
	character: Space1889CharacterActorDataModel,
	npc: Space1889NpcActorDataModel,
	creature: Space1889CreatureActorDataModel,
	vehicle: Space1889VehicleActorDataModel
};
