import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Space1889ActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["space1889", "sheet", "actor"],
			template: "systems/space1889/templates/actor/actor-sheet.html",
			width: 500,
			height: 620,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities" }]
		});
	}

	/** @override */
	get template() {
		return `systems/space1889/templates/actor/actor-${this.actor.data.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = super.getData();

		// Use a safe clone of the actor data for further operations.
		const actorData = this.actor.data.toObject(false);

		// Add the actor's data to context.data for easier access, as well as flags.
		context.data = actorData.data;
		context.flags = actorData.flags;

		// Prepare character data and items.
		if (actorData.type == 'character') {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		// Prepare NPC data and items.
		if (actorData.type == 'npc') {
			this._prepareItems(context);
		}

		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		// Prepare active effects
		context.effects = prepareActiveEffectCategories(this.actor.effects);

		return context;
	}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareCharacterData(context) 
	{
		// Handle ability scores.
		let primaereAttribute = [];

		for (let [k, v] of Object.entries(context.data.abilities)) 
		{
			primaereAttribute.push(k);
			v.label = game.i18n.localize(CONFIG.SPACE1889.abilities[k]) ?? k;
		}
		for (let [key, element] of Object.entries(context.data.secondaries)) 
		{
			element.label = game.i18n.localize(CONFIG.SPACE1889.secondaries[key]) ?? key;
		}

		context.data['archetypes'] = CONFIG.SPACE1889.archetypes;
		context.data['species'] = CONFIG.SPACE1889.species;
		context.data['motivations'] = CONFIG.SPACE1889.motivations;
		context.data['resources'] = CONFIG.SPACE1889.resources;
		context.data['primaereAttribute'] = primaereAttribute;

/*		try
		{
			for(let skl of context.skills)
			{
				let underlyingAttribute = this._GetAttributeBase(context, skl);
				skl.data.basis = context.data.abilities[underlyingAttribute].total;
				skl.data.baseAbilityAbbr = game.i18n.localize(CONFIG.SPACE1889.abilityAbbreviations[underlyingAttribute]);
				skl.data.rating = skl.data.basis + skl.data.level + skl.data.talentBonus;
				if (skl.data.isSkillGroup && skl.data.skillGroupName.length > 0)
					skl.data.skillGroup = game.i18n.localize(CONFIG.SPACE1889.skillGroups[skl.data.skillGroupName]);

				for(let spe of context.speciSkills)
				{
					if (spe.data.underlyingSkillId == skl.data.id)
					{
						spe.data.basis = skl.data.rating;
						spe.data.rating = spe.data.basis + spe.data.level + spe.data.talentBonus;
					}
				} 
			}
		}
		catch(error) 
		{
			console.error(error);
		}

		let sizeMod = (-1) * context.data.secondaries.size.total;
		for (let weapon of context.weapons)
		{
			weapon.data.sizeMod = sizeMod;
			weapon.data.skillRating = this._GetSkillLevel(context, weapon.data.skillId, weapon.data.specializationId);
			weapon.data.attack = Math.max(0, weapon.data.damage + weapon.data.skillRating + weapon.data.sizeMod);
			weapon.data.attackAverage = (weapon.data.attack % 2 == 0 ? "" : "+") + (Math.floor(weapon.data.attack / 2)).toString();
			weapon.data.damageTypeDisplay = game.i18n.localize(CONFIG.SPACE1889.damageTypeAbbreviations[weapon.data.damageType]);
			weapon.data.locationDisplay = game.i18n.localize(CONFIG.SPACE1889.storageLocationAbbreviations[weapon.data.location]);
		}

		for (let armor of context.armors)
		{
			let langId = CONFIG.SPACE1889.storageLocationAbbreviations[armor.data.location] ?? "";
			armor.data.display = (langId != "" ? game.i18n.localize(langId) : "?");
		}

		for (let item of context.gear)
		{
			let langId = CONFIG.SPACE1889.storageLocationAbbreviations[item.data.location] ?? "";
			item.data.display = (langId != "" ? game.i18n.localize(langId) : "?");
		}

		this._CalcThings(context);*/

	}

	/**
	 * 
	 * @param {Object} context 
	 * @param {Object} skill
	 * @returns {string} abilityKey
	 */
	/*_GetAttributeBase(context, skill)
	{
		for (let talent of context.talents)
		{
			if (talent.data.changedSkill == skill.data.id && talent.data.newBase != "") //besser prüfen obs eine der 6 primären Attribute ist
				return talent.data.newBase;
		}
		return skill.data.underlyingAttribute
	}*/


	/**
	 * 
	 * @param {Object} context 
	 * @param {string} skillId 
	 * @param {string} specializationId
	 * @returns {number}
	 */
	/*_GetSkillLevel(context, skillId, specializationId)
	{
		for (let speci of context.speciSkills)
		{
			if (specializationId == speci.data.id)
				return speci.data.rating;
		}
		for (let skill of context.skills)
		{
			if (skillId == skill.data.id)
				return skill.data.rating;
		}
		return this.GetSkillRating(context, skillId, "");
	}*/

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareItems(context) {
		// Initialize containers.
		const gear = [];
		const talents = [];
		const skills = [];
		const speciSkills = [];
		const resources = [];
		const weapons = [];
		const armors = [];
		const weakness = [];
		const language = [];

		// Iterate through items, allocating to containers
		for (let i of context.items) {
			i.img = i.img || DEFAULT_TOKEN;
			// Append to gear.
			if (i.type === 'item') {
				gear.push(i);
			}
			// Append to talents.
			else if (i.type === 'talent') {
				talents.push(i);
			}
			// Append to skills.
			else if (i.type === 'skill') {
				skills.push(i);
			}
			// Append to specialization.
			else if (i.type === 'specialization') {
				speciSkills.push(i);
			}
			else if (i.type === 'resource') {
				resources.push(i);
			}
			else if (i.type === 'weapon'){
				weapons.push(i);
			}
			else if (i.type === 'armor'){
				armors.push(i);
			}
			else if (i.type === 'weakness'){
				weakness.push(i);
			}
			else if (i.type === 'language'){
				language.push(i);
			}
		}

		this.SortByName(skills);
		this.SortByName(speciSkills);
		this.SortByName(talents);
		this.SortByName(weapons);
		this.SortByName(armors);
		this.SortByName(resources);

		this.SortByName(weakness);
		let weaknessLeft = [];
		let weaknessRight = [];
		for (let i = 0; i <weakness.length; ++i)
		{
			if (i%2 == 0)
				weaknessLeft.push(weakness[i]);
			else 
				weaknessRight.push(weakness[i]);
		}

		this.SortByName(language);
		let languageLeft = [];
		let languageRight = [];
		for (let i = 0; i <language.length; ++i)
		{
			if (i%2 == 0)
				languageLeft.push(language[i]);
			else 
				languageRight.push(language[i]);
		}


		// Assign and return
		context.gear = gear;
		context.talents = talents;
		context.skills = skills;
		context.speciSkills = speciSkills;
		context.resources = resources;
		context.weapons = weapons;
		context.armors = armors;
		context.weakness = weakness;
		context.weaknessLeft = weaknessLeft;
		context.weaknessRight = weaknessRight;
		context.language = language;
		context.languageLeft = languageLeft;
		context.languageRight = languageRight;
	}

	/**
	 * sortiert das übergebene Liste nach Namen
	 * @param objectArray 
	 */
	SortByName(objectArray)
	{
		objectArray.sort((a, b) =>
		{
			if (a.name < b.name)
				return -1;
			if (a.name > b.name)
				return 1;
			return 0;
		});
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		html.find('.item-edit').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.find('.item-create').click(this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.find('.item-delete').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		// sub Skill update
		html.find('.skill-level').change(async ev => {
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const newValue = Math.max( Math.min(5, Number(ev.target.value)), 0);
			await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.level": newValue }]);
			this.currentFocus = $(document.activeElement).closest('.row-section').attr('data-item-id');
		});

		html.find('.talent-level').change(async ev => {
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const newValue = Math.max( Math.min(item.data.data.level.max, Number(ev.target.value)), item.data.data.level.min);
			await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.level.value": newValue }]);
			$(document.activeElement).focus();
		//	this.currentFocus = $(document.activeElement); //.closest('.item-name').attr('data-item-id');
		});

		// Active Effect management
		html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

		// Rollable abilities.
		html.find('.rollable').click(this._onRoll.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = ev => this._onDragStart(ev);
			html.find('li.item').each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
	}

/*  async _onDrop(event) {
		const dragData = JSON.parse(event.dataTransfer.getData("text/plain"))
		//this._handleDragData(dragData, event, await itemFromDrop(dragData, this.actor.id))


		ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: dragData.id }))
		await super._onDrop(event);
	}*/

	async _onDropItem(event, data) {
		if ( !this.actor.isOwner ) 
			return false;
		
		const item = await Item.implementation.fromDropData(data);
		const itemData = item.toObject();

		// Handle item sorting within the same Actor
		if ( await this._isFromSameActor(data) )
			return this._onSortItem(event, itemData);

		if (this.isItemDropAllowed(itemData))
		{
			// Create the owned item
			return this._onDropItemCreate(itemData);
		}
		return false;
	}

	/**
	 * Liefert false zurück falls die im Item verankerten Vorbedingung nicht erfüllt sind
	 * @param itemData 
	 * @returns {boolean}
	 */
	isItemDropAllowed(itemData)
	{
		const actor = this.actor.data;
		if (itemData.type == "weapon")
		{
			if (itemData.data.strengthThreshold > actor.data.abilities["str"].total)
			{
				ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: itemData.name }))
				return false;
			}
		}
		if (itemData.type == "specialization")
		{
			let skill = actor.items.find(entry => entry.data.data.id == itemData.data.underlyingSkillId);
			if (skill == undefined || skill.data.data.level <= 0)
			{
				ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: itemData.name }))
				return false;
			}
		}
		if (itemData.type == "talent")
		{
			return this.isTalentPossible(itemData);
		}
		return true;		
	}

/**
 * 
 * @param {string} type 
 * @param {string} id 
 * @param {boolean} isGroup 
 * @param {number} threshold 
 * @returns {boolean}
 */
	isPreConditionValid(type, id, isGroup, threshold)
	{
		if (type == "nothing")
			return true;

		const actor = this.actor.data;

		if (type == "primary")
		{
			if (threshold <= actor.data.abilities[id].total)
				return true;
		}
		else if (type == "secondary")
		{
			if (threshold <= actor.data.secondaries[id].total)
				return true;
		}
		else if (type == "skill" && id == "nichtkampffertigkeit")
		{
			let maxLevel = 0;
			for (let item of actor.items)
			{
				if (item.data.type != "skill")
					continue;
				
				if (!item.data.data.isFightingSkill)
					maxLevel = Math.max(maxLevel, item.data.data.level);
			}
			if (maxLevel >= threshold)
				return true;			
		}
		else if (type == "skill" && !isGroup)
		{
			let skill = actor.items.find(entry => entry.data.data.id == id);
			if (skill != undefined && threshold <= skill.data.data.level)
			{
				return true;
			}
		}
		else if (type == "skill" && isGroup)
		{
			let maxLevel = 0;
			for (let item of actor.items)
			{
				if (item.data.type != "skill")
					continue;
				
				if (item.data.data.skillGroupName == id)
					maxLevel = Math.max(maxLevel, item.data.data.level);
			}
			if (maxLevel >= threshold)
				return true;
		}
		else if (type == "talent")
		{
			for (let item of actor.items)
			{
				if (item.data.type != "talent")
					continue;
				
				if (item.data.data.id == id)
					return true;
			}
		}
		else if (type == "species")
		{
			if (actor.data.attributes.species.value == id)
				return true;
		}
		else if (type == "weakness")
		{
			for (let item of actor.items)
			{
				if (item.data.type != "weakness")
					continue;
				
				if (item.data.data.id == id)
					return true;
			}
		}
		return false;

	}

	isTalentPossible(itemData)
	{
		const isPossible1 = this.isPreConditionValid(itemData.data.preconditionType, itemData.data.preconditionName, itemData.data.isGroup, itemData.data.preconditionLevel);
		const isPossible2 = this.isPreConditionValid(itemData.data.secondPreconditionType, itemData.data.secondPreconditionName, false, itemData.data.secondPreconditionLevel);
/*		if (itemData.data.isOrOperator && !isPossible && !isPossible2)
		{
			var text = "Talent " + itemData.name + " kann nicht gewählt werden, da dafür keine der zwei Möglichkeiten " + voraussetzung + talent.nameDerVoraussetzung + " die Stufe " + talent.stufeDerVoraussetzung;
			text += ",  oder " + voraussetzung2 + talent.nameDerZweitenVoraussetzung + " die Stufe " + talent.stufeDerZweitenVoraussetzung + " erfüllt ist.";
			app.alert(text);
		}
		else if (isPossible == false && talent.oderOperatorZweiteVoraussetzung == false)
		{
			if (talent.typDerVoraussetzung != 5)
				app.alert("Talent " + talentName + " kann nicht gewählt werden, da dafür " + voraussetzung + talent.nameDerVoraussetzung + " die Stufe " + talent.stufeDerVoraussetzung + " benötigt."  );
			else
				app.alert("Talent " + talentName + " kann nicht gewählt werden, da dieses Talent ausschließlich der Spezies " + talent.nameDerVoraussetzung + " vorbehalten ist.");
		}
		else if (isPossible2 == false && !talent.oderOperatorZweiteVoraussetzung)
		{
			if (talent.typDerZweitenVoraussetzung != 5)
				app.alert("Talent " + talentName + " kann nicht gewählt werden, da dafür " + voraussetzung2 + talent.nameDerZweitenVoraussetzung + " die Stufe " + talent.stufeDerZweitenVoraussetzung + " benötigt."  );
			else
				app.alert("Talent " + talentName + " kann nicht gewählt werden, da dieses Talent ausschließlich der Spezies " + talent.nameDerZweitenVoraussetzung + " vorbehalten ist.");

		}*/
	
		const isPossible = (itemData.data.isOrOperator ? (isPossible1 || isPossible2) : (isPossible1 && isPossible2));
		if (!isPossible) // ToDo sinnvolle Meldung einbauen
			ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: itemData.name }))	
		return isPossible;
	}


	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			data: data
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data["type"];

		// Finally, create the item!
		return await Item.create(itemData, {parent: this.actor});
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		// Handle item rolls.
		if (dataset.rollType) 
		{
			if (dataset.rollType == 'item') 
			{
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item)
				{
					if (dataset.rollDiecount)
					{
						const dieCount = Math.max(Number(dataset.rollDiecount),0);
						const showDialog = (event.shiftKey || event.ctrlKey);
						return item.rollSpecial(dieCount, showDialog);
					}
					return item.roll();
				} 
			}
			else if (dataset.rollType == 'actor' && dataset.rollDiecount && dataset.rollKey)
			{
					const actor = this.actor;
					const dieCount = Math.max(Number(dataset.rollDiecount),0);
					const showDialog = (event.shiftKey || event.ctrlKey);
					const showInfoOnly = !showDialog && event.altKey;
					if (showInfoOnly)
						return actor.showAttributeInfo(dataset.label, dataset.rollKey);
					
					return actor.rollAttribute(dieCount, showDialog, dataset.rollKey);
			}
			else if (dataset.rollType == 'actorinfo' &&  dataset.rollKey)
			{
				const actor = this.actor;
				return actor.showAttributeInfo(dataset.label, dataset.rollKey);
			}
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			let label = dataset.label ? `${dataset.label}` : '';
			let roll = new Roll(dataset.roll, this.actor.getRollData());
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get('core', 'rollMode'),
				emote: true
			});
			return roll;
		}
	}

	_getItemId(ev) {
		return $(ev.currentTarget).parents(".item").attr("data-item-id")
	}



}


