/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Space1889ItemSheet extends ItemSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["space1889", "sheet", "item"],
			width: 500,
			height: 500,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
		});
	}

	/** @override */
	get template() {
		const path = "systems/space1889/templates/item";
		// Return a single sheet for all item types.
		// return `${path}/item-sheet.html`;

		// Alternatively, you could use the following return statement to do a
		// unique item sheet by type, like `weapon-sheet.html`.
		return `${path}/item-${this.item.data.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve base data structure.
		const context = super.getData();

		// Use a safe clone of the item data for further operations.
		const itemData = context.item.data;

		// Retrieve the roll data for TinyMCE editors.
		context.rollData = {};
		let actor = this.object?.parent ?? null;
		if (actor) {
			context.rollData = actor.getRollData();
		}

		// Add the actor's data to context.data for easier access, as well as flags.
		context.data = itemData.data;
		context.flags = itemData.flags;

		context.data['abilities'] = CONFIG.SPACE1889.abilities;

		if (itemData.type == "specialization")
			context.data['nonGroupSkills'] = CONFIG.SPACE1889.nonGroupSkills;
		else if (itemData.type == "skill")
			context.data['publications'] = CONFIG.SPACE1889.publications;
		else if (itemData.type == "talent")
		{
			context.data['preConditionTypes'] = CONFIG.SPACE1889.preConditionTypes;
			context.data['publications'] = CONFIG.SPACE1889.publications;
		}
		else if (itemData.type == "weapon")
		{
			context.data['combatSkills'] = CONFIG.SPACE1889.combatSkills;
			context.data['combatSpecializations'] = CONFIG.SPACE1889.combatSpecializations;
			context.data['damageTypes'] = CONFIG.SPACE1889.damageTypes;
			context.data['damageTypeAbbr'] = CONFIG.SPACE1889.damageTypeAbbreviations;
		}
		else if (itemData.type == "weakness")
		{
			context.data['weaknessTypes'] = CONFIG.SPACE1889.weaknessTypes;
		}
		else if (itemData.type == "currency")
		{
			context.data['moneyTypes'] = CONFIG.SPACE1889.moneyTypes;
		}
		else if (itemData.type == "language")
		{
			context.data['origins'] = CONFIG.SPACE1889.languageOrigins;
			context.data['families'] = CONFIG.SPACE1889.familyOflanguages;
			context.data['languages'] = CONFIG.SPACE1889.languages;
		}
		else if (itemData.type == "damage")
		{
			context.data['damageTypes'] = CONFIG.SPACE1889.damageTypes;
			context.data['damageTypeAbbr'] = CONFIG.SPACE1889.damageTypeAbbreviations;
        }

		if (itemData.type == "weapon" || itemData.type == "armor" || itemData.type == "item")
		{
			context.data['storageLocations'] = CONFIG.SPACE1889.storageLocations;
			context.data['storageLocationsAbbr'] = CONFIG.SPACE1889.storageLocationAbbreviations;
		}
		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Roll handlers, click handlers, etc. would go here.
	}
}
