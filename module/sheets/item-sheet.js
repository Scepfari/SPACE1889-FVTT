import {onManageActiveEffect} from "../helpers/effects.js";
import SPACE1889Helper from "../helpers/helper.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Space1889ItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
	foundry.applications.sheets.ItemSheetV2,)
{

	static DEFAULT_OPTIONS = {
		tag: 'form',
		form: {
			submitOnChange: true,
			closeOnSubmit: false
		},
		window: {
			minimizable: true,
			resizable: true
		},
		position: {
			width: 500,
			height: 550
		},
		classes: ["space1889", "sheet", "item"],
	};
	get title()
	{
		return this.item.name;
	}

	static TABS = {
		primary: {
			tabs: [
				//{ id: 'description', group: 'primary', label: 'SPACE1889.Description' },
//				{ id: 'descLocalizeVersion', group: 'primary', label: 'SPACE1889.Description' },
				//{ id: 'basic', group: 'primary', label: 'LIGHT.HeaderBasic' },
				//{ id: 'animation', group: 'primary', label: 'LIGHT.HeaderAnimation' },
				//{ id: 'advanced', group: 'primary', label: 'LIGHT.HeaderAdvanced' },
			],
			initial: 'description',
		}
	}


	static PARTS = {
		header: {
			template: "systems/space1889/templates/item/parts/item-header.html"
		},
		//tabs: {
		//	// Foundry-provided generic template
		//	template: "templates/generic/tab-navigation.hbs",
		//},
		//description: {
		//	template: 'systems/space1889/templates/item/parts/item-descriptionTab.html'
		//},
		//basic: {
		//	template: 'systems/space1889/templates/item/parts/item-lightSource-basic-configuration.html'
		//},
		//animation: {
		//	template: 'systems/space1889/templates/item/parts/item-lightSource-animation-configuration.html'
		//},
		//advanced: {
		//	template: 'systems/space1889/templates/item/parts/item-lightSource-advanced-configuration.html'
		//}
	}

	static LIMITEDPARTS = {
		header: {
			template: "systems/space1889/templates/item/item-limited-sheet.html"
		}
	}


	/** @override */
	get space1889ItemTemplate()
	{
		if (!game.user.isGM && this.item.limited)
			return "systems/space1889/templates/item/item-limited-sheet.html";

		if (this.item.type === "lightSource" || this.item.type === "vision")
			return "systems/space1889/templates/item/parts/item-emptyBase.html"

		return `systems/space1889/templates/item/item-${this.item.type}-sheet.html`;
	}

	_configureRenderParts(options)
	{
		if (this.constructor.LIMITEDPARTS && !game.user.isGM && this.item.limited)
			return foundry.utils.deepClone(this.constructor.LIMITEDPARTS);

		const parts = super._configureRenderParts(options);
		if (!parts.details)
			parts.details = { template: this.space1889ItemTemplate, scrollable: [''] };
		return parts;
	}

	/**
	* Returns if this sheet is only available in editMode?
	* @type {boolean}
	*/
	static get onlyEdit()
	{
		return true;
	}

	static setupSheets()
	{
		foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
		foundry.documents.collections.Items.registerSheet('space1889', Space1889ItemSheet, { makeDefault: true });

		const sheets = [
			{ sheetClass: LightSourceSheet, types: ['lightSource'] },
			{ sheetClass: VisionSheet, types: ['vision'] }
		];

		sheets.forEach(({ sheetClass, types }) =>
		{
			foundry.documents.collections.Items.registerSheet('space1889', sheetClass, { makeDefault: true, types });
		});
		foundry.documents.collections.Items.unregisterSheet('space1889', Space1889ItemSheet, { types: sheets.map((x) => x.types).flat() });
	}


	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		// Retrieve base data structure.
		const context = await super._prepareContext(options);

		context.editable = this.isEditable;
		context.systemFields = this.document.system.schema?.fields;

		// Use a safe clone of the item data for further operations.
		const item = this.item;

		// Retrieve the roll data for TinyMCE editors.
		context.rollData = {};
		let actor = this.item?.parent ?? null;
		if (actor) {
			context.rollData = actor.getRollData();
		}

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = item.system;
		context.flags = item.flags;
		context.item = item;

		context.system['abilities'] = CONFIG.SPACE1889.abilities;

		if (item.type == "specialization")
			context.system['nonGroupSkills'] = CONFIG.SPACE1889.nonGroupSkills;
		else if (item.type == "skill")
		{
			context.system['publications'] = CONFIG.SPACE1889.publications;
			context.system['skillGroups'] = CONFIG.SPACE1889.skillGroups;
		}
		else if (item.type === "talent")
		{
			context.system['preConditionTypes'] = CONFIG.SPACE1889.preConditionTypes;
			context.system['publications'] = CONFIG.SPACE1889.publications;
			context.system['primaryAbilityTypes'] = SPACE1889Helper.getSortedPrimaryAbilityTypes(true);
			context.system['secondaryAbilityTypes'] = SPACE1889Helper.getSortedSecondaryAbilityTypes();
			context.system['actorTypes'] = SPACE1889Helper.getSortedActorTypes();
			context.system['speciesTypes'] = SPACE1889Helper.getSortedSpecies(true);
			context.system['talents'] = await SPACE1889Helper.getSortedTalents();
			context.system['skills'] = await SPACE1889Helper.getSortedSkillIdsWithLocalizedName(false, true);
			context.system['skillsWithGroups'] = await SPACE1889Helper.getSortedSkillIdsWithLocalizedName(true, true, true);
			context.system['weaknesses'] = await SPACE1889Helper.getSortedWeaknesses();
			context.system['skillGroups'] = SPACE1889Helper.getSortedSkillGroups();
			context.system['emptyEntry'] = [{ key: "", label: "" }];
			context.system['bonusTypes'] = SPACE1889Helper.getSortedTalentBonusTypes();
			context.system['senseTypes'] = SPACE1889Helper.getSortedSenseTypes();
			context.system['specializations'] = context.system.bonusTargetType === "specialization"
				? await SPACE1889Helper.getSortedSpecializations()
				: [];
			context.system['gravity'] = CONFIG.SPACE1889.gravity;
		}
		else if (item.type == "weapon")
		{
			context.system['combatSkills'] = CONFIG.SPACE1889.combatSkills;
			context.system['damageTypes'] = CONFIG.SPACE1889.damageTypes;
			context.system['damageTypeAbbr'] = CONFIG.SPACE1889.damageTypeAbbreviations;
			context.system['capacityTypes'] = CONFIG.SPACE1889.weaponCapacityTypes;
			context.system['ammunitionTypes'] = SPACE1889Helper.getSortedAmmunitionTypes();
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
			context.system['ammunitionTypes'] = SPACE1889Helper.getSortedAmmunitionTypes(true);
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
		else if (item.type === "vision")
		{
			context.system['visionModes'] = CONFIG.SPACE1889.visionModes;
			context.system['itemUseTypes'] = CONFIG.SPACE1889.itemUseTypes;
			context.system['storageLocations'] = CONFIG.SPACE1889.allStorageLocations;
			context.system['storageLocationsAbbr'] = CONFIG.SPACE1889.allStorageLocationsAbbreviations;
		}
		else if (item.type === "lightSource")
		{
			context.system['lightAnimations'] = SPACE1889Helper.getSortedAnimationtypes();
			context.system['lightShaderTechniques'] = CONFIG.SPACE1889.lightShaderTechniques;
			context.system['storageLocations'] = CONFIG.SPACE1889.allStorageLocations;
			context.system['storageLocationsAbbr'] = CONFIG.SPACE1889.allStorageLocationsAbbreviations;
			context.system['itemUseTypes'] = CONFIG.SPACE1889.itemUseTypes;
			context.system['lightSourceHands'] = CONFIG.SPACE1889.lightSourceHands;
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

		if (item.type !== "language")
		{
			context.enrichedDescription =
			await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				this.item.system.description,
				{
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.item.getRollData(),
					// Relative UUID resolution
					relativeTo: this.item,
				},
			);
		}

		context.tabs = this._prepareTabs("primary");

		return context;
	}

	/**
	 * Prepares data for rendering a specific part of the Item sheet.
	 * Handles different parts like attributes, description, prerequisites, effects, etc.
	 *
	 * @param {string} partId - The ID of the part to prepare
	 * @param {Object} context - The data object to prepare
	 * @returns {Promise<Object>} The prepared context
	 * @override
	 */
	async _preparePartContext(partId, context)
	{
		switch (partId)
		{
			case "header":
				break;
			case "description":
				context.tab = context.tabs[partId];
				// Enrich description info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedDescription =
					await foundry.applications.ux.TextEditor.implementation.enrichHTML(
						this.item.system.description,
						{
							// Whether to show secret blocks in the finished html
							secrets: this.document.isOwner,
							// Data to fill in for inline rolls
							rollData: this.item.getRollData(),
							// Relative UUID resolution
							relativeTo: this.item,
						},
					);
				break;
		}
		return context;
	}

	/* -------------------------------------------- */

	/** @override */

	async _onRender(context, options)
	{
		await super._onRender(context, options);
		const html = $(this.element);


		html.find('.artwork').on('mousedown', (ev) =>
		{
			if (ev.button == 2)
				SPACE1889Helper.showArtwork(this.item, true)
		});

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable)
			return;

		html.find('.increment-weapon-size-click').on('mousedown', (ev) =>
		{
			if (this.item.type == "weapon")
			{
				const newValue = SPACE1889Helper.incrementValue(ev, this.item.system.size, 0, undefined);
				this.item.update({ 'system.size': newValue });
			}
		});

		html.find('.id-lock-toggle').on('mousedown', (ev) =>
		{
			if (this.item.system.unlockIdForUser != undefined)
			{
				const toggledValue = !this.item.system.unlockIdForUser;
				this.item.update({ 'system.unlockIdForUser': toggledValue });
			}
		});

		html.find('.noSelection-toggle').on('mousedown', (ev) =>
		{
			if (this.item.system.noSelection != undefined)
			{
				const toggledValue = !this.item.system.noSelection;
				this.item.update({ 'system.noSelection': toggledValue });
			}
		});

		html.find('.create-new-id').on('mousedown', (ev) =>
		{
			if (this.item.name != "")
			{
				const newId = this.item.createId(this.item.name);
				this.item.update({ 'system.id': newId });
			}
		});

		html.find('.extendedRollUseSpezialisation-toggle').on('mousedown', (ev) =>
		{
			if (this.item.type === "extended_action")
			{
				const toggledValue = !this.item.system.useSpezialisation;
				this.item.update({ "system.useSpezialisation": toggledValue });
			}
		});

		// Active Effect management
		html.find(".effect-control").on('click', (ev) =>
		{
			onManageActiveEffect(ev, this.item);
		});
	}
}

class LightSourceSheet extends Space1889ItemSheet
{
	static PARTS = {
		header: {
			template: "systems/space1889/templates/item/parts/item-header.html"
		},
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		details: {
			template: 'systems/space1889/templates/item/parts/item-lightSource-details.html'
		},
		basic: {
			template: 'systems/space1889/templates/item/parts/item-lightSource-basic-configuration.html'
		},
		animation: {
			template: 'systems/space1889/templates/item/parts/item-lightSource-animation-configuration.html'
		},
		advanced: {
			template: 'systems/space1889/templates/item/parts/item-lightSource-advanced-configuration.html'
		}
	}

	static TABS = {
		primary: {
			tabs: [
				{ id: 'details', group: 'primary', label: 'LIGHT.GeneralInformation' },
				{ id: 'basic', group: 'primary', label: 'LIGHT.HeaderBasic', icon: 'fas fa-lightbulb' },
				{ id: 'animation', group: 'primary', label: 'LIGHT.HeaderAnimation', icon: 'fas fa-play' },
				{ id: 'advanced', group: 'primary', label: 'LIGHT.HeaderAdvanced', icon: 'fas fa-cogs' },
			],
			initial: 'details',
		}
	}

	async _preparePartContext(partId, context)
	{
		//switch (partId)
		//{
		//	case "header":
		//		break;
		//	case "details":
		//	case "basic":
		//	case "animation":
		//	case "advanced":
		//		context.tab = context.tabs[partId];
		//		break;
		//}
		return context;
	}
}


class VisionSheet extends Space1889ItemSheet
{
	static PARTS = {
		header: {
			template: "systems/space1889/templates/item/parts/item-header.html"
		},
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		details: {
			template: 'systems/space1889/templates/item/parts/item-vision-details.html'
		},
		basic: {
			template: 'systems/space1889/templates/item/parts/item-vision-basic-configuration.html'
		},
		advanced: {
			template: 'systems/space1889/templates/item/parts/item-vision-advanced-configuration.html'
		}
	}

	static TABS = {
		primary: {
			tabs: [
				{ id: 'details', group: 'primary', label: 'LIGHT.GeneralInformation' },
				{ id: 'basic', group: 'primary', label: 'TOKEN.SightHeaderBasic', icon: 'fa-solid fa-eye' },
				{ id: 'advanced', group: 'primary', label: 'TOKEN.SightHeaderAdvanced', icon: 'fas fa-cogs' },
			],
			initial: 'details',
		}
	}
}
