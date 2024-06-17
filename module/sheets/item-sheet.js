import {onManageActiveEffect} from "../helpers/effects.js";
import SPACE1889Helper from "../helpers/helper.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Space1889ItemSheet extends ItemSheet {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["space1889", "sheet", "item"],
			width: 500,
			height: 500,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
		});
	}

	/** @override */
	get template()
	{
		if (!game.user.isGM && this.item.limited)
			return "systems/space1889/templates/item/item-limited-sheet.html";

		return `systems/space1889/templates/item/item-${this.item.type}-sheet.html`;
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
			context.system['damageTypes'] = CONFIG.SPACE1889.damageTypes;
			context.system['damageTypeAbbr'] = CONFIG.SPACE1889.damageTypeAbbreviations;
			context.system['capacityTypes'] = CONFIG.SPACE1889.weaponCapacityTypes;
			context.system['ammunitionTypes'] = CONFIG.SPACE1889.weaponAmmunitionTypes;
			context.system['effectTypes'] = CONFIG.SPACE1889.effects;
			context.system['specializations'] = await SPACE1889Helper.getSortedSpecializationsFromSkill(context.system.skillId);

			if (context.system.specializations.length > 0
				&& !context.system.specializations.find(e => e.key === context.system.specializationId))
			{
				await item.update({ "system.specializationId": context.system.specializations[0].key });
			}
			else if (context.system.specializations.length === 0 && context.system.specializationId !== "")
			{
				await item.update({ "system.specializationId": "" });
			}
		}
		else if (item.type == "ammunition")
		{
			context.system['damageTypes'] = CONFIG.SPACE1889.noComboDamageTypes;
			context.system['damageTypeAbbr'] = CONFIG.SPACE1889.damageTypeAbbreviations;
			context.system['capacityTypes'] = CONFIG.SPACE1889.ammunitionCapacityTypes;
			context.system['ammunitionTypes'] = CONFIG.SPACE1889.weaponAmmunitionTypes;
			context.system['storageLocations'] = CONFIG.SPACE1889.storageLocations;
			context.system['storageLocationsAbbr'] = CONFIG.SPACE1889.storageLocationsAbbreviations;
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

		else if (item.type ==="extended_action")
		{
			context.system['propertyKeys'] = CONFIG.SPACE1889.propertyKeys;
			context.system['secondaries'] = CONFIG.SPACE1889.secondaries;
			context.system['skills'] = await SPACE1889Helper.getSortedSkillIdsWithLocalizedName();

			context.system['specializations'] = context.system.typeKey === "skill"
				? await SPACE1889Helper.getSortedSpecializationsFromSkill(context.system.skillOrAttributeId)
				: [];

			let updateData = context.system.saveData;

			if (context.system.typeKey === "skill")
			{
				let spezialisationId = context.system.spezialisationId;
				if (context.system.specializations.length > 0
					&& !context.system.specializations.find(e => e.key === context.system.spezialisationId))
				{
					updateData["system.spezialisationId"] = context.system.specializations[0].key;
					spezialisationId = "";
					updateData["system.spezialisationLabel"] = context.system.specializations[0].label;
				}
				else if (context.system.specializations.length === 0)
				{
					updateData["system.spezialisationId"] = "";
					spezialisationId = "";
					updateData["system.spezialisationLabel"] = "";
					updateData["system.useSpezialisation"] = false;
				}

				let skill = context.system.skills.find(e => e.key === context.system.skillOrAttributeId);
				if (skill && skill.groupId !== context.system.skillGroupId)
					updateData["system.skillGroupId"] = skill.groupId;

				if (spezialisationId)
				{
					const upperCaseId = context.system.spezialisationId.replace(/^(.)/, function (b) { return b.toUpperCase(); });
					const langId = 'SPACE1889.' + "SpeciSkill" + upperCaseId;
					let spezName = game.i18n.localize(langId);
					if (spezName === langId)
						spezName = item.system.specializations.find( e => e.key === item.system.spezialisationId)?.label;
					if (spezName !== item.system.spezialisationLabel)
						updateData["system.spezialisationLabel"] = spezName;
				}
			}

			if (Object.keys(updateData).length > 0)
			{
				await item.update(updateData);
				context.system.saveData = {};
			}
		}

		//TextEditor
		context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true });

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Artwork
		html.find('.artwork').mousedown(ev =>
		{
			if (ev.button == 2)
				SPACE1889Helper.showArtwork(this.item, true)
		});

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

		html.find('.extendedRollUseSpezialisation-toggle').mousedown(ev =>
		{
			if (this.item.type === "extended_action")
			{
				const toggledValue = !this.item.system.useSpezialisation;
				this.item.update({ "system.useSpezialisation": toggledValue });
			}
		});

		// Active Effect management
		html.find(".effect-control").click(ev =>
		{
			onManageActiveEffect(ev, this.item);
		});

	}
}
