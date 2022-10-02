import SPACE1889Helper from "../helpers/helper.mjs";

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
		return `${path}/item-${this.item.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData(options) {
		// Retrieve base data structure.
		const context = await super.getData(options);

		// Use a safe clone of the item data for further operations.
		const item = context.item;

		// Retrieve the roll data for TinyMCE editors.
		context.rollData = {};
		let actor = this.object?.parent ?? null;
		if (actor) {
			context.rollData = actor.getRollData();
		}

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = item.system;
		context.flags = item.flags;

		context.system['abilities'] = CONFIG.SPACE1889.abilities;

		if (item.type == "specialization")
			context.system['nonGroupSkills'] = CONFIG.SPACE1889.nonGroupSkills;
		else if (item.type == "skill")
		{
			context.system['publications'] = CONFIG.SPACE1889.publications;
			context.system['skillGroups'] = CONFIG.SPACE1889.skillGroups;
		}
		else if (item.type == "talent")
		{
			context.system['preConditionTypes'] = CONFIG.SPACE1889.preConditionTypes;
			context.system['publications'] = CONFIG.SPACE1889.publications;
		}
		else if (item.type == "weapon")
		{
			context.system['combatSkills'] = CONFIG.SPACE1889.combatSkills;
			context.system['combatSpecializations'] = CONFIG.SPACE1889.combatSpecializations;
			context.system['damageTypes'] = CONFIG.SPACE1889.damageTypes;
			context.system['damageTypeAbbr'] = CONFIG.SPACE1889.damageTypeAbbreviations;
			context.system['capacityTypes'] = CONFIG.SPACE1889.weaponCapacityTypes;
		}
		else if (item.type == "weakness")
		{
			context.system['weaknessTypes'] = CONFIG.SPACE1889.weaknessTypes;
		}
		else if (item.type == "currency")
		{
			context.system['moneyTypes'] = CONFIG.SPACE1889.moneyTypes;
		}
		else if (item.type == "language")
		{
			context.system['origins'] = CONFIG.SPACE1889.languageOrigins;
			context.system['families'] = CONFIG.SPACE1889.familyOflanguages;
			context.system['languages'] = CONFIG.SPACE1889.languages;
		}
		else if (item.type == "damage")
		{
			context.system['damageTypes'] = CONFIG.SPACE1889.vehicleDamageTypes;
			context.system['damageTypeAbbr'] = CONFIG.SPACE1889.vehicleDamageTypeAbbreviations;
		}

		if (item.type == "weapon")
		{
			context.system['storageLocations'] = CONFIG.SPACE1889.allStorageLocations;
			context.system['storageLocationsAbbr'] = CONFIG.SPACE1889.allStorageLocationsAbbreviations;
			context.system['weaponMountSpots'] = CONFIG.SPACE1889.weaponMountSpots;
		}

		if (item.type == "armor" || item.type == "item")
		{
			context.system['storageLocations'] = CONFIG.SPACE1889.storageLocations;
			context.system['storageLocationsAbbr'] = CONFIG.SPACE1889.storageLocationAbbreviations;
		}

		//TextEditor
		context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true });

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Roll handlers, click handlers, etc. would go here.
		html.find('.increment-weapon-size-click').mousedown(ev =>
		{
			if (this.item.type == "weapon")
			{
				const newValue = SPACE1889Helper.incrementValue(ev, this.item.system.size, 0, undefined);
				this.item.update({ 'system.size': newValue });
			}
		});
		html.find('.id-lock-toggle').mousedown(ev =>
		{
			if (this.item.system.unlockIdForUser != undefined)
			{
				const toggledValue = !this.item.system.unlockIdForUser;
				this.item.update({ 'system.unlockIdForUser': toggledValue });
			}
		});
		html.find('.noSelection-toggle').mousedown(ev =>
		{
			if (this.item.system.noSelection != undefined)
			{
				const toggledValue = !this.item.system.noSelection;
				this.item.update({ 'system.noSelection': toggledValue });
			}
		});
		html.find('.create-new-id').mousedown(ev =>
		{
			if (this.item.name != "")
			{
				const newId = this.item.createId(this.item.name);
				this.item.update({ 'system.id': newId });
			}
		});
	}
}
