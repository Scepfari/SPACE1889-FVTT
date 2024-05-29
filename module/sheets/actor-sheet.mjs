import {onManageActiveEffect} from "../helpers/effects.mjs";
import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";
import ForeignNotesEditor from "../helpers/foreignNotesEditor.mjs"
import SPACE1889Healing from "../helpers/healing.js";
import SPACE1889Time from "../helpers/time.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Space1889ActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["space1889", "sheet", "actor"],
			template: "systems/space1889/templates/actor/actor-sheet.html",
			width: 500,
			height: 620,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities" }]
		});
	}

	/** @override */
	get template()
	{
		if (!game.user.isGM && this.actor.limited)
			return "systems/space1889/templates/actor/actor-limited-sheet.html";
		return `systems/space1889/templates/actor/actor-${this.actor.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData(options) {
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = await super.getData(options);

		// Use a safe clone of the actor data for further operations.
		const actor = this.actor.toObject(false);

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actor.system;
		context.flags = actor.flags;

		// Prepare character data and items.
		if (actor.type == 'character') {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		// Prepare NPC data and items.
		if (actor.type == 'npc') {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		if (actor.type == 'creature')
		{
			this._prepareItems(context);
			this._prepareCreatureData(context);
		}

		if (actor.type == 'vehicle')
		{
			this._prepareVehicleItems(context); 
			this._prepareVehicleData(context);
		}

		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		// Prepare active effects
		context.effects = this.actor.effects;

		//TextEditor
		context.enrichedBiography = await TextEditor.enrichHTML(this.object.system.biography, { async: true });
		context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {async: true});
		context.enrichedNotes = await TextEditor.enrichHTML(this.object.system.notes.value, { async: true });
		context.enrichedGmNotes = await TextEditor.enrichHTML(this.object.system.notes.gmInfo, { async: true });
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
		this._prepareAttributes(context);

		context.system['archetypes'] = CONFIG.SPACE1889.archetypes;
		context.system['species'] = CONFIG.SPACE1889.species;
		context.system['motivations'] = CONFIG.SPACE1889.motivations;
//		context.system['resources'] = CONFIG.SPACE1889.resources;
		context.system['storageLocations'] = CONFIG.SPACE1889.storageLocation;
	}

	_prepareCreatureData(context)
	{
		this._prepareAttributes(context);
		context.system['archetypes'] = CONFIG.SPACE1889.creatureArchetypes;
		context.system['movementTypes'] = CONFIG.SPACE1889.creatureMovementType;
		context.system['origins'] = CONFIG.SPACE1889.creatureOrigins;
	}

	_prepareVehicleData(context)
	{
		context.system['crewExperiences'] = CONFIG.SPACE1889.crewExperience;
		context.system['crewTempers'] = CONFIG.SPACE1889.crewTemper;
		context.system['pilotSkills'] = CONFIG.SPACE1889.pilotSkills;
	}

	_prepareAttributes(context)
	{
		let primaereAttribute = [];

		for (let [k, v] of Object.entries(context.system.abilities)) 
		{
			primaereAttribute.push(k);
			v.label = game.i18n.localize(CONFIG.SPACE1889.abilities[k]) ?? k;
		}
		for (let [key, element] of Object.entries(context.system.secondaries)) 
		{
			element.label = game.i18n.localize(CONFIG.SPACE1889.secondaries[key]) ?? key;
		}
		context.system['primaereAttribute'] = primaereAttribute;
	}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareItems(context) {

		// Iterate through items, set default image
		for (let i of context.items) {
			i.img = i.img || DEFAULT_TOKEN;
		}

		let weaknessLeft = [];
		let weaknessRight = [];
		for (let i = 0; i < this.actor.system.weakness.length; ++i)
		{
			if (i%2 == 0)
				weaknessLeft.push(this.actor.system.weakness[i]);
			else 
				weaknessRight.push(this.actor.system.weakness[i]);
		}

		let languageLeft = [];
		let languageRight = [];
		for (let i = 0; i < this.actor.system.language.length; ++i)
		{
			if (i%2 == 0)
				languageLeft.push(this.actor.system.language[i]);
			else 
				languageRight.push(this.actor.system.language[i]);
		}


		// Assign and return
		context.system.gear = this.actor.system.gear;
		context.system.talents = this.actor.system.talents;
		context.system.skills = this.actor.system.skills;
		context.system.speciSkills = this.actor.system.speciSkills;
		context.system.resources = this.actor.system.resources;
		context.system.weapons = this.actor.system.weapons;
		context.system.armors = this.actor.system.armors;
		context.system.weakness = this.actor.system.weakness;
		context.system.weaknessLeft = weaknessLeft;
		context.system.weaknessRight = weaknessRight;
		context.system.language = this.actor.system.language;
		context.system.languageLeft = languageLeft;
		context.system.languageRight = languageRight;
		context.system.injuries = this.actor.system.injuries;
		context.system.money = this.actor.system.money;
	}


	_prepareVehicleItems(context)
	{
		// Iterate through items, set default image
		for (let i of context.items)
		{
			i.img = i.img || DEFAULT_TOKEN;
		}
		context.weapons = this.actor.system.weapons;
		context.injuries = this.actor.system.injuries;
	}

	GetMaxSkillLevel()
	{
		const heroLevel = game.settings.get("space1889", "heroLevel");
		if (heroLevel == 0) //Pechvogel
			return 3;
		if (heroLevel == 1) //Durchschnittsbuerger
			return 4;
		if (heroLevel == 2) //Vielversprechend
			return 5;
		if (heroLevel == 3) //Veteran
			return 6;
		if (heroLevel == 4) //Weltspitze
			return 7;

		//Uebermensch
		return 8;
	}

	GetMaxPrimaryAttributeLevel()
	{
		const heroLevel = game.settings.get("space1889", "heroLevel");
		if (heroLevel == 0) //Pechvogel
			return 4;
		if (heroLevel == 1) //Durchschnittsbuerger
			return 5;
		if (heroLevel == 2) //Vielversprechend
			return 6;
		if (heroLevel == 3) //Veteran
			return 7;
		if (heroLevel == 4) //Weltspitze
			return 8;

		//Uebermensch
		return 9;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Artwork
		html.find('.artwork').mousedown(ev =>
		{
			if (ev.button == 2)
				SPACE1889Helper.showArtwork(this.actor, true)
		});

		// Render the item sheet for viewing/editing prior to the editable check.
		html.find('.item-edit').click(ev =>
		{
			event.preventDefault();
			const idToEdit = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
			if (!idToEdit)
				return;

			const item = this.actor.items.get(idToEdit);
			item.sheet.render(true);
		});

		// Rollable abilities.
		html.find('.rollable').click(this._onRoll.bind(this));

		this._bindKeepFieldsEnabled(html);


		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable)
			return;

		// Add Inventory Item
		html.find('.item-create').click(this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.find('.item-delete').click(this._onItemDelete.bind(this));
		html.find('.container-delete').click(this._onContainerDelete.bind(this));

		// sub Skill update
		html.find('.skill-level').change(async ev => {
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const newValue = Math.max( Math.min(5, Number(ev.target.value)), 0);
			await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.level": newValue }]);
			this.currentFocus = $(document.activeElement).closest('.row-section').attr('system-item-id');
		});

		html.find('.talent-level').change(async ev => {
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const newValue = Math.max( Math.min(item.system.level.max, Number(ev.target.value)), item.system.level.min);
			await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.level.value": newValue }]);
			$(document.activeElement).focus();
		//	this.currentFocus = $(document.activeElement); //.closest('.item-name').attr('data-item-id');
		});

		html.find('.increment-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const isSkill = item.type == "skill";

			if (item.type == "talent" || item.type == "resource")
			{
				const newValue = this.incrementValue(ev, item.system.level.value, item.system.level.min, item.system.level.max);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.level.value": newValue }]);
			}
			else if (isSkill || item.type == "specialization")
			{
				const max = this.actor.type == "character" ? (isSkill ? this.GetMaxSkillLevel() : 5) : 10;
				const min = isSkill ? 0 : 1;
				const newValue = this.incrementValue(ev, item.system.level, min, max, true);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.level": newValue }]);
			}
			else if (item.type == "weapon")
			{
				const newValue = this.incrementValue(ev, item.system.damage, -10, undefined);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.damage": newValue }]);
			}
			else if (item.type == "item" || item.type == "ammunition")
			{
				const newValue = this.incrementValue(ev, item.system.quantity, 0);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.quantity": newValue }]);
			}
			else if (item.type == "currency")
			{
				let newValue = this.incrementValue(ev, item.system.quantity, 0);
				if (newValue != Math.round(newValue))
				{
					newValue = +(newValue.toFixed(2));
				}
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.quantity": newValue }]);
			}
			else if (item.type == "damage")
			{
				const newValue = this.incrementValue(ev, item.system.damage, 1, undefined);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.damage": newValue }]);
			}
		});

		html.find('.effectBonus-click').mousedown(ev =>
		{
			this.#addRemoveTempTalentImprovement(ev)
		});

		html.find('.healingFactor-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const newHealingFactor = this.incrementValue(ev, item.system.healingFactor, 1, undefined);
			SPACE1889Healing.changeHealingFactor(this.actor, itemId, newHealingFactor);
		});

		html.find('.rerender-click').mousedown(ev =>
		{
			this.actor.prepareDerivedData();
			this.render();
		});

		html.find('.location-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			if (this.actor.type == 'vehicle')
			{
				const newLocationAndSpot = this.incrementVehicleMountLocation(ev, item.system.location, item.system.vehicle.spot);
				item.update({ 'system.location': newLocationAndSpot[0], 'system.vehicle.spot': newLocationAndSpot[1] });
			}
			else
			{
				const newId = this.incrementLocation(ev, item.system.containerId, this.actor);
				item.update({ 'system.containerId': newId });
			}
		});

		html.find('.weaponhand-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const backward = ev.button == 2;
			SPACE1889Helper.setWeaponHand(item, this.actor, backward);
		});

		html.find('.reload-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			if (ev.button == 2 )
				SPACE1889Helper.unloadWeapon(item, this.actor);
			else
				SPACE1889Helper.reloadWeapon(item, this.actor);
		});

		html.find('.swivelingRange-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			if (this.actor.type == 'vehicle' && item.type == 'weapon')
			{
				const newValue = this.incrementValue(ev, Number(item.system.vehicle.swivelingRange), 0, 360);
				let isSwivelMounted = item.system.vehicle.isSwivelMounted;
				if (newValue == 0 && isSwivelMounted)
					isSwivelMounted = false;
				else if (newValue > 0 && !isSwivelMounted)
					isSwivelMounted = true;

				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.vehicle.swivelingRange": newValue, "system.vehicle.isSwivelMounted": isSwivelMounted }]);
			}
		});

		const isCharacter = this.actor.type == "character";
		const isNpc = this.actor.type == "npc"
		const primaryMin = (isCharacter || isNpc) ? 1 : 0;
		const primaryMax = isCharacter ? this.GetMaxPrimaryAttributeLevel() : undefined;

		html.find('.increment-con-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.abilities.con.value, primaryMin, primaryMax, true);
			this.actor.update({ 'system.abilities.con.value': newValue });
		});

		html.find('.increment-dex-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.abilities.dex.value, primaryMin, primaryMax, true);
			this.actor.update({ 'system.abilities.dex.value': newValue });
		});
		html.find('.increment-str-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.abilities.str.value, primaryMin, primaryMax, true);
			this.actor.update({ 'system.abilities.str.value': newValue });
		});
		html.find('.increment-cha-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.abilities.cha.value, primaryMin, primaryMax, true);
			this.actor.update({ 'system.abilities.cha.value': newValue });
		});
		html.find('.increment-int-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.abilities.int.value, primaryMin, primaryMax, true);
			this.actor.update({ 'system.abilities.int.value': newValue });
		});
		html.find('.increment-wil-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.abilities.wil.value, primaryMin, primaryMax, true);
			this.actor.update({ 'system.abilities.wil.value': newValue });
		});

		html.find('.increment-style-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.style.value, 0, undefined);
			this.actor.update({ 'system.style.value': newValue });
		});

		html.find('.increment-xp-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.attributes.xp.value, 0, undefined);
			this.actor.update({ 'system.attributes.xp.value': newValue });
		});

        html.find('.ammo-selector').change(async(ev) => {
            ev.preventDefault()
			const itemId = this._getItemId(ev);
			const ammuId = $(ev.currentTarget).val();

			const weapon = this.actor.system.weapons.find(e => e._id == itemId);
			if (weapon && weapon.system.ammunition.remainingRounds > 0)
				SPACE1889Helper.unloadWeapon(weapon, this.actor);

			await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.ammunition.currentItemId": ammuId }]);
        })

		html.find('.increment-animalcompanionlevel-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.animalCompanionLevel, 0, 5);
			this.actor.update({ 'system.animalCompanionLevel': newValue });
		});

		html.find('.increment-creaturesize-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.secondaries.size.value, -5, 20);
			this.actor.update({ 'system.secondaries.size.value': newValue });
		});

		html.find('.increment-structure-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.health.max, 0, undefined);
			this.actor.update({ 'system.health.max': newValue });
		});
		html.find('.increment-speed-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.speed.max, 0, undefined);
			this.actor.update({ 'system.speed.max': newValue });
		});
		html.find('.increment-maneuverability-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.maneuverability.max, -5, 5);
			this.actor.update({ 'system.maneuverability.max': newValue });
		});
		html.find('.increment-passiveDefense-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.passiveDefense, 0, undefined);
			this.actor.update({ 'system.passiveDefense': newValue });
		});
		html.find('.increment-vehicleSize-click').mousedown(ev =>
		{
			const newValue = SPACE1889Helper.incrementVehicleSizeValue(ev, this.actor.system.size);
			this.actor.update({ 'system.size': newValue });
		});

		html.find('.increment-captain-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.captain.value, 0, undefined);
			this.actor.update({ 'system.positions.captain.value': newValue });
		});
		html.find('.increment-copilot-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.copilot.value, 0, undefined);
			this.actor.update({ 'system.positions.copilot.value': newValue });
		});
		html.find('.increment-gunner-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.gunner.value, 0, undefined);
			this.actor.update({ 'system.positions.gunner.value': newValue });
		});
		html.find('.increment-signaler-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.signaler.value, 0, undefined);
			this.actor.update({ 'system.positions.signaler.value': newValue });
		});
		html.find('.increment-lookout-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.lookout.value, 0, undefined);
			this.actor.update({ 'system.positions.lookout.value': newValue });
		});
		html.find('.increment-mechanic-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.mechanic.value, 0, undefined);
			this.actor.update({ 'system.positions.mechanic.value': newValue });
		});
		html.find('.increment-medic-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.positions.medic.value, 0, undefined);
			this.actor.update({ 'system.positions.medic.value': newValue });
		});
		html.find('.increment-crew-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.crew.max, 1, undefined);
			this.actor.update({ 'system.crew.max': newValue });
		});
		html.find('.increment-crew-current-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.crew.value, 0, this.actor.system.crew.max);
			this.actor.update({ 'system.crew.value': newValue });
		});
		html.find('.increment-passenger-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.passenger.max, 0, undefined);
			this.actor.update({ 'system.passenger.max': newValue });
		});
		html.find('.increment-passenger-current-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.passenger.value, 0, this.actor.system.passenger.max);
			this.actor.update({ 'system.passenger.value': newValue });
		});
		html.find('.increment-strengthTempoFactor-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.strengthTempoFactor.value, 0, this.actor.system.strengthTempoFactor.max);
			this.actor.update({ 'system.strengthTempoFactor.value': newValue });
		});
		html.find('.increment-vehicle-size-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.system.size, 0, undefined);
			this.actor.update({ 'system.size': newValue });
		});
		html.find('.do-vehicle-captain-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'captain');
		});
		html.find('.do-vehicle-pilot-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'pilot');
		});
		html.find('.do-vehicle-copilot-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'copilot');
		});
		html.find('.do-vehicle-gunner-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'gunner');
		});
		html.find('.do-vehicle-signaler-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'signaler');
		});
		html.find('.do-vehicle-lookout-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'lookout');
		});
		html.find('.do-vehicle-mechanic-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'mechanic');
		});
		html.find('.do-vehicle-medic-click').mousedown(ev =>
		{
			this._doVehiclePositionClick(ev, 'medic');
		});
		html.find('.do-pilot-maneuver-click').mousedown(ev =>
		{
			this._doVehicleMovementManeuverClick(ev);
		});
		html.find('.do-gunner-maneuver-click').mousedown(ev =>
		{
			this._doVehicleAttackManeuverClick(ev);
		});
		html.find('.roll-vehicle-attack-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			if (this.actor.type == 'vehicle')
			{
				SPACE1889RollHelper.rollManoeuver('Attack', this.actor, ev, itemId);
			}
		});
		html.find('.roll-vehicle-defense-click').mousedown(ev =>
		{
			if (this.actor.type == 'vehicle')
				SPACE1889RollHelper.rollManoeuver('defense', this.actor, ev);
		});
		html.find('.condition-toggle').mousedown(ev =>
		{
			const positionId = this._getDataId(ev);
			const toggledValue = !this.actor.system.positions[positionId].staffed;
			const key = 'system.positions.' + positionId + '.staffed';
			let updateObject = {};
			updateObject[key] = toggledValue;
			this.actor.update(updateObject);
		});
		html.find('.carried-toggle').mousedown(ev =>
		{
			const itemId = this._getDataId(ev);
			const toggledValue = !this.actor.items.get(itemId).system.carried;
			this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.carried": toggledValue }]);
		});
		html.find('.compressed-toggle').mousedown(ev =>
		{
			const itemId = this._getDataId(ev);
			const toggledValue = !this.actor.items.get(itemId).system.compressed;
			this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.compressed": toggledValue }]);
		});
		html.find('.open-compendium').mousedown(ev =>
		{
			let packName = $(ev.currentTarget).attr("data-pack");
			game.packs.get(packName).render(true);
		});


		// Active Effect management
		html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

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

    _bindKeepFieldsEnabled(html) {
        if(!this.isEditable){
            const keepFields = html.find('.keepFieldsEnabled')
            for(let k of keepFields){
                const attr = k.dataset.attr
                const name = k.dataset.name
                $(k).find('.editor').append(`<a data-attr="${attr}" data-name="${name}" class="editor-edit"><i class="fas fa-edit"></i></a>`)
                $(k).find('.editor-edit').click(ev => this._openKeepFieldEditpage(ev))
            }
        }
    }

    _openKeepFieldEditpage(ev){
        const attr = ev.currentTarget.dataset.attr
        const name = ev.currentTarget.dataset.name
        const editor = new ForeignNotesEditor(this.actor.id, attr, name)
        editor.render(true)
    }

	#addRemoveTempTalentImprovement(ev)
	{
		if (SPACE1889Helper.isFoundryV10Running())
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NotSupportedInFoundryV10"));
			return;
		}
		const itemId = this._getItemId(ev);
		const item = this.actor.items.get(itemId);
		if (item.type == "talent")
		{
			const effectName = game.i18n.format("SPACE1889.TemporaryImprovement", { name: item.name });
			const remove = ev.button == 2;
			if (remove)
			{
				const effect = item.effects.getName(effectName);
				if (effect)
					effect.delete();
				else if (item.effects.size > 0)
					ui.notifications.info(game.i18n.format("SPACE1889.EffectNotFound", { name: item.name }));

				return;
			}
			if (item.system.level.total == item.system.level.max)
			{
				ui.notifications.info(game.i18n.localize("SPACE1889.TalentEffectBoostNotPossible"));
				return;
			}
			if (this.actor.system.style.value < 2)
			{
				ui.notifications.info(game.i18n.localize("SPACE1889.NotEnoughStylePoints"));
				return;
			}

			//test code
				
			SPACE1889Helper.addEffect(item, {
				name: effectName, tint: "#25cb30", rounds: 50, icon: "icons/svg/upgrade.svg",
				changes: [{ key: "system.level.effectBonus", mode: 2, priority: null, value: 1 }],
				statuses: ["temporaryTalentEnhancement"]
			});
			this.actor.update({ 'system.style.value': this.actor.system.style.value - 2 });
			let chatData = {
				user: game.user._id,
				speaker: ChatMessage.getSpeaker(),
				content: "für zwei Stilpunkte wurde das Talent " + item.name + " um eine Stufe verstärkt"
			};
			ChatMessage.create(chatData, {});
		}
	}

	_doVehiclePositionClick(event, positionKey)
	{
		if (this.actor.type == "vehicle")
		{
			const eventInfo = SPACE1889RollHelper.getEventEvaluation(event);
			if (eventInfo.specialDialog)
			{
				const key = 'system.positions.' + positionKey + '.actorId';
				let updateObject = {};
				updateObject[key] = "";
				this.actor.update(updateObject);
			}
			else
				SPACE1889Helper.showActorSheet(this.actor.system.positions[positionKey].actorId);
		}
	}

	_doVehicleMovementManeuverClick(event)
	{
		const titleName =  game.i18n.localize("SPACE1889.VehicleManoeuvreSelection");

		let optionen = '<option value="eins" selected>' + game.i18n.localize("SPACE1889.VehicleApproachDistance") + '</option>';
		optionen += '<option value="zwei">' + game.i18n.localize("SPACE1889.VehicleUtmostPower") + '</option>';
		optionen += '<option value="drei">' + game.i18n.localize("SPACE1889.VehicleTurnaround") + '</option>';
		optionen += '<option value="vier">' + game.i18n.localize("SPACE1889.VehicleAbruptBrakingAcceleration") + '</option>';
		optionen += '<option value="funf">' + game.i18n.localize("SPACE1889.VehicleRamming") + '</option>';

		const userId = game.user.id;

		let dialogue = new Dialog(
		{
		  title: `${titleName}`,
		  content: `<p><select id="manoeverauswahl" name="manoeverauswahl">${optionen}</select></p>`,
		  buttons: 
		  {
			ok: 
			{
			  icon: '',
			  label: game.i18n.localize("SPACE1889.Go"),
			  callback: (html) => 
			  {
				const selectedOption = html.find('#manoeverauswahl').val();
				if (selectedOption == "eins")
				  this.actor.rollManoeuvre("ApproachDistance", event);
				else if (selectedOption == "zwei")
				  this.actor.rollManoeuvre("UtmostPower", event);
				else if (selectedOption == "drei")
				  this.actor.rollManoeuvre("Turnaround", event);
				else if (selectedOption == "vier")
				  this.actor.rollManoeuvre("AbruptBrakingAcceleration", event);
				else if (selectedOption == "funf")
				  this.actor.rollManoeuvre("Ramming", event);
			  }
			},
			abbruch:
			{
			  label: game.i18n.localize("SPACE1889.Cancel"),
			  callback: ()=> {ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll"))},
			  icon: `<i class="fas fa-times"></i>`
			}
		  },
		  default: "ok"
		})

		dialogue.render(true)
	}

	_doVehicleAttackManeuverClick(event)
	{
		const titleName =  game.i18n.localize("SPACE1889.VehicleManoeuvreSelection");

		let optionen = '<option value="one" selected>' + game.i18n.localize("SPACE1889.Attack") + '</option>';
		optionen += '<option value="two">' + game.i18n.localize("SPACE1889.VehicleTotalAttack") + '</option>';
		optionen += '<option value="three">' + game.i18n.localize("SPACE1889.VehicleDoubleShot") + '</option>';
		optionen += '<option value="four">' + game.i18n.localize("SPACE1889.VehicleContinuousFire") + '</option>';
		optionen += '<option value="five">' + game.i18n.localize("SPACE1889.VehicleAimedShot") + '</option>';

		const userId = game.user.id;

		let dialogue = new Dialog(
			{
				title: `${titleName}`,
				content: `<p><select id="manoeverauswahl" name="manoeverauswahl">${optionen}</select></p>`,
				buttons:
				{
					ok:
					{
						icon: '',
						label: game.i18n.localize("SPACE1889.Go"),
						callback: (html) =>
						{
							const selectedOption = html.find('#manoeverauswahl').val();
							if (selectedOption == "one")
								this.actor.rollManoeuvre("Attack", event);
							else if (selectedOption == "two")
								this.actor.rollManoeuvre("TotalAttack", event);
							else if (selectedOption == "three")
								this.actor.rollManoeuvre("DoubleShot", event);
							else if (selectedOption == "four")
								this.actor.rollManoeuvre("ContinuousFire", event);
							else if (selectedOption == "five")
								this.actor.rollManoeuvre("AimedShot", event);
						}
					},
					abbruch:
					{
						label: game.i18n.localize("SPACE1889.Cancel"),
						callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
						icon: `<i class="fas fa-times"></i>`
					}
				},
				default: "ok"
			});

		dialogue.render(true);
	}

/*  async _onDrop(event) {
		const dragData = JSON.parse(event.dataTransfer.getData("text/plain"))
		//this._handleDragData(dragData, event, await itemFromDrop(dragData, this.actor.id))


		ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: dragData.uuid }))
		await super._onDrop(event);
	}*/

	async _onDropActor(event, data)
	{
		if (!this.actor.isOwner)
			return false;

		if (this.actor.type != 'vehicle')
			return false;

		const actorClass = getDocumentClass("Actor");
		const dropedActor = await actorClass.fromDropData(data);
		if (!dropedActor)
			return false;

		const uuidElemnts = data.uuid.split(".");
		if (uuidElemnts.length > 0 && uuidElemnts[0] == "Compendium")
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.VehicleNoCompendiumActor"));
			return false;
		}

		await SPACE1889Helper.setVehicleActorPositionFromDialog(this.actor, dropedActor);
		
	}


	async _onDropItem(event, data) {
		if ( !this.actor.isOwner ) 
			return false;
		
		const item = await Item.implementation.fromDropData(data);
		const itemData = item.toObject();
		const isContainer = itemData.type == "container";

		const isMoved = this.actor.items.get(itemData._id) != undefined;
		let targetContainerId = null;

		const dropTarget = event.target.closest("[data-item-id]");
		if (dropTarget && !isContainer)
		{
			const target = this.actor.items.get(dropTarget.dataset.itemId);
			if (target)
				targetContainerId = (target.type == "container" ? target._id : target.system.containerId);
		}

		if (itemData.system.containerId != targetContainerId)
		{
			if (isMoved)
				await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemData._id, "system.containerId": targetContainerId }]);
			else
				itemData.system.containerId = targetContainerId;
		}
		

		// Handle item sorting within the same Actor
		if (this.actor.items.get(item._id) != undefined)
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
	 * @param item 
	 * @returns {boolean}
	 */
	isItemDropAllowed(item)
	{
		const actor = this.actor;

		if (actor.type == 'creature' &&
			(item.type == "resource" || item.type == "language"))
			return false;

		if (item.type == "weapon")
		{
			if (actor.type == "vehicle")
			{
				if (item.system.skillId != "geschuetze")
				{
					ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: item.name }))
					return false;
				}
			}
			else if (item.system.strengthThreshold > actor.system.abilities["str"].total)
			{
				ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: item.name }))
				return false;
			}	
		}
		if (item.type == "specialization")
		{
			let skill = actor.items.find(entry => entry.system.id == item.system.underlyingSkillId);
			if (skill == undefined || skill.system.level <= 0)
			{
				ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: item.name }))
				return false;
			}
		}
		if (item.type == "talent")
		{
			const isValid = this.isTalentPossible(item);
			if (isValid && item.system.id == "begabung")
			{
				this.showTalentSkillSelectionDialog(item);
			}
			if (isValid && item.system.id == "geschaerfterSinn")
				this.showGeschaerfterSinnDialog(item);
			if (isValid && item.system.id == "eigenartigerKampfstil")
				this.showTalentSkillSelectionDialog(item);
			return isValid;
		}
		return true;		
	}


	showTalentSkillSelectionDialog(item)
	{
		let optionen = '';
		let actor = this.actor;

		for (let item of actor.system.skills)
		{
			optionen += '<option value="' + item.system.id + '" selected="selected">' + item.system.label + '</option>';
		}

		let talentName = item.name;
		let text = game.i18n.localize("SPACE1889.ChooseSkill") + " " + talentName;
		let choices = game.i18n.localize("SPACE1889.Choices");
		let selectedOption;
		let dialog = new Dialog({
			title: `${actor.name} : ${talentName}`,
			content: `
				<form>
				  <p>${text}:</p>
				  <div class="form-group">
					<label>${choices}:</label>
					<select id="choices" name="choices">
					  ${optionen}
					</select>
				  </div>
				</form>
			`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: "Submit",
					callback: (html) =>
					{
						selectedOption = html.find('#choices').val();
					},
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
				}
			},
			default: "yes",
			close: () =>
			{
				if (selectedOption) 
				{
					let newTalent = actor.system.talents.find(e => e.system.id == item.system.id && e.system.bonusTarget == "");
					if (newTalent != undefined)
						this.actor.updateEmbeddedDocuments("Item", [{ _id: newTalent._id, "system.bonusTarget": selectedOption }]);

					console.log("set system.bonusTarget to: " + selectedOption);
				}
			}
		});
		dialog.render(true);
	}

	showGeschaerfterSinnDialog(item)
	{
		
		let actor = this.actor;

		let optionen = '<option value="hearing" selected="selected">' + game.i18n.localize("SPACE1889.SenseHearing") + '</option>';
		optionen += '<option value="smell" selected="selected">' + game.i18n.localize("SPACE1889.SenseSmell") + '</option>';
		optionen += '<option value="taste" selected="selected">' + game.i18n.localize("SPACE1889.SenseTaste") + '</option>';
		optionen += '<option value="vision" selected="selected">' + game.i18n.localize("SPACE1889.SenseVision") + '</option>';
		optionen += '<option value="touch" selected="selected">' + game.i18n.localize("SPACE1889.SenseTouch") + '</option>';

		let sense = game.i18n.localize("SPACE1889.TalentGeschaerfterSinn");
		let text = game.i18n.localize("SPACE1889.ChooseSense") + " " + sense;
		let choices = game.i18n.localize("SPACE1889.Choices");
		let selectedOption;
		let dialog = new Dialog({
			title: `${actor.name} : ${sense}`,
			content: `
				<form>
				  <p>${text}:</p>
				  <div class="form-group">
					<label>${choices}:</label>
					<select id="choices" name="choices">
					  ${optionen}
					</select>
				  </div>
				</form>
			`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: "Submit",
					callback: (html) =>
					{
						selectedOption = html.find('#choices').val();
					}
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel"
				}
			},
			default: "yes",
			close: () =>
			{
				if (selectedOption) 
				{
					let newTalent = actor.system.talents.find(e => e.system.id === "geschaerfterSinn" && e.system.bonusTarget === "");
					if (newTalent != undefined)
						this.actor.updateEmbeddedDocuments("Item", [{ _id: newTalent._id, "system.bonusTarget": selectedOption, "system.bonusTargetType": "sense" }]);

					console.log("set system.bonusTarget to: " + selectedOption);
				}
			}
		});
		dialog.render(true);
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

		const actor = this.actor;

		if (type == "actor")
		{
			if (id == actor.type)
				return true;
		}
		else if (type == "primary")
		{
			if (threshold <= actor.system.abilities[id].total)
				return true;
		}
		else if (type == "secondary")
		{
			if (threshold <= actor.system.secondaries[id].total)
				return true;
		}
		else if (type == "skill" && id == "nichtkampffertigkeit")
		{
			let maxLevel = 0;
			for (let item of actor.items)
			{
				if (item.type != "skill")
					continue;
				
				if (!item.system.isFightingSkill)
					maxLevel = Math.max(maxLevel, item.system.level);
			}
			if (maxLevel >= threshold)
				return true;			
		}
		else if (type == "skill" && !isGroup)
		{
			let skill = actor.items.find(entry => entry.system.id == id);
			if (skill != undefined && threshold <= skill.system.level)
			{
				return true;
			}
		}
		else if (type == "skill" && isGroup)
		{
			let maxLevel = 0;
			for (let item of actor.items)
			{
				if (item.type != "skill")
					continue;
				
				if (item.system.skillGroupName == id)
					maxLevel = Math.max(maxLevel, item.system.level);
			}
			if (maxLevel >= threshold)
				return true;
		}
		else if (type == "talent")
		{
			for (let item of actor.items)
			{
				if (item.type != "talent")
					continue;
				
				if (item.system.id == id)
					return true;
			}
		}
		else if (type == "species")
		{
			if (actor.type == "creature")
				return true;

			var ids = id.split(";");
			for (let i of ids)
			{
				if (actor.system.attributes?.species?.value == i)
					return true;
			}
		}
		else if (type == "weakness")
		{
			for (let item of actor.items)
			{
				if (item.type != "weakness")
					continue;
				
				if (item.system.id == id)
					return true;
			}
		}
		return false;

	}

	isTalentPossible(item)
	{
		const isPossible1 = this.isPreConditionValid(item.system.preconditionType, item.system.preconditionName, item.system.isGroup, item.system.preconditionLevel);
		const isPossible2 = this.isPreConditionValid(item.system.secondPreconditionType, item.system.secondPreconditionName, false, item.system.secondPreconditionLevel);
		const isPossible = (item.system.isOrOperator ? (isPossible1 || isPossible2) : (isPossible1 && isPossible2));
		if (isPossible)
			return true;

		const talentName = item.name;
		const preConType = game.i18n.format(CONFIG.SPACE1889.preConditionTypes[item.system.preconditionType]);
		const preCon2Type = game.i18n.format(CONFIG.SPACE1889.preConditionTypes[item.system.secondPreconditionType]);
		const group = item.system.isGroup ? "Group" : "";
		const preConNameList = item.system.preconditionName.split(";");

		let preConNames = "";

		for (const preCon of preConNameList)
		{
			const preConNameLangId = "SPACE1889." + this.mapPreconditionTypeToLangIdSubString(item.system.preconditionType) + group + this.firstLetterToUpperCase(preCon);
			let preConName = game.i18n.format(preConNameLangId);
			if (preConName == preConNameLangId)
				preConName = this.firstLetterToUpperCase(preCon);
			preConNames += (preConNames == "" ? preConName : ", " + preConName);
		}


		let info = "";
		if (item.system.isOrOperator && !isPossible1 && !isPossible2)
		{
			const preConLevel = item.system.preconditionLevel.toString();

			const preCon2Type = game.i18n.format(CONFIG.SPACE1889.preConditionTypes[item.system.secondPreconditionType]);
			const preCon2NameLangId = "SPACE1889." + this.mapPreconditionTypeToLangIdSubString(item.system.secondPreconditionType) + this.firstLetterToUpperCase(item.system.secondPreconditionName);
			let preCon2Name = game.i18n.format(preCon2NameLangId);
			if (preCon2Name == preCon2NameLangId)
				preCon2Name = this.firstLetterToUpperCase(item.system.secondPreconditionName);
			const preCon2Level = item.system.secondPreconditionLevel.toString();

			info = game.i18n.format("SPACE1889.CanNotAddTalentTwoPreCons", {
				talentName: talentName, preConType: preConType, preConName: preConNames, preConLevel: preConLevel, preCon2Type: preCon2Type, preCon2Name: preCon2Name, preCon2Level: preCon2Level
			})
		}
		else if (!isPossible1 && !item.system.isOrOperator)
		{
			const preConLevel = item.system.preconditionLevel.toString();

			if (item.system.preconditionType == "species")
				info = game.i18n.format("SPACE1889.CanNotAddTalentWrongSpecies", { talentName: talentName, preConName: preConNames });
			else
				info = game.i18n.format("SPACE1889.CanNotAddTalentOnePreCons", { talentName: talentName, preConType: preConType, preConName: preConNames, preConLevel: preConLevel });
		}
		else if (!isPossible2 && !item.system.isOrOperator)
		{
			const preCon2NameLangId = "SPACE1889." + this.mapPreconditionTypeToLangIdSubString(item.system.secondPreconditionType) + this.firstLetterToUpperCase(item.system.secondPreconditionName);
			let preCon2Name = game.i18n.format(preCon2NameLangId);
			if (preCon2Name == preCon2NameLangId)
				preCon2Name = this.firstLetterToUpperCase(item.system.secondPreconditionName);
			const preCon2Level = item.system.secondPreconditionLevel.toString();

			if (item.system.preconditionType == "species")
				info = game.i18n.format("SPACE1889.CanNotAddTalentWrongSpecies", { talentName: talentName, preConName: preCon2Name });
			else
				info = game.i18n.format("SPACE1889.CanNotAddTalentOnePreCons", { talentName: talentName, preConType: preCon2Type, preConName: preCon2Name, preConLevel: preCon2Level });
		}
	
		if (info != "")
			ui.notifications.error(info);
		else
			ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: item.name }));

		return false;
	}

	mapPreconditionTypeToLangIdSubString(preConType)
	{
		if (preConType == "primary")
			return "Ability";
		if (preConType == "secondary")
			return "SecondaryAttribute";

		return this.firstLetterToUpperCase(preConType);
	}

	/**
	 * 
	 * @param {string} text
	 * @returns {string}
	 */
	firstLetterToUpperCase(text)
	{
		return text.replace(/^(.)/, function (b)
		{
			return b.toUpperCase();
		});
	}

	/**
	 * 
	 * @param {object} ev event
	 * @param {number} currentValue
	 * @param {number} min
	 * @param {number} max
	 */
	incrementValue(ev, currentValue, min, max, showNotification = false)
	{
		return SPACE1889Helper.incrementValue(ev, currentValue, min, max, showNotification);
	}

	/**
	 * 
	 * @param {object} ev event
	 * @param {string} currentId the containerId
	 */
	incrementLocation(ev, currentId, actor)
	{
		if (actor.system.containers.length == 0)
			return null;

		const backward = ev.button == 2;
		if (currentId == null)
		{
			return backward ? actor.system.containers[actor.system.containers.length - 1].id : actor.system.containers[0].id;
		}

		let pre = null;
		let post = null;
		const length = actor.system.containers.length;
		for (let i = 0; i < length; ++i)
		{
			const container = actor.system.containers[i];
			if (container._id == currentId)
			{
				if (i + 1 < length)
					post = actor.system.containers[i + 1]._id;
				break;
			}
			else
			{
				pre = container._id;
			}
		}
		return backward ? pre : post;
	}

	/**
	 * 
	 * @param {object} ev event
	 * @param {string} currentLocationValue a storage location: 'mounted' or 'lager'
	 * @param {string} currentMountSpot the mounting spot: 'bow', 'stern', 'port', 'starboard'
	 */
	incrementVehicleMountLocation(ev, currentLocationValue, currentMountSpot)
	{
		const list = [['lager', currentMountSpot], ['mounted', 'bow'], ['mounted', 'starboard'], ['mounted', 'stern'], ['mounted', 'port']];
		const backward = ev.button == 2;

		if (currentLocationValue == 'lager')
			return backward ? list[4] : list[1];

		for (let i = 1; i < list.length; ++i)
		{
			if (list[i][1] == currentMountSpot)
			{
				if (backward)
					return list[i - 1];
				else
				{
					return i == list.length - 1 ? list[0] : list[i + 1];
				}
			}
		}
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

		if (!type)
			return undefined;

		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			system: data
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system["type"];

		// Finally, create the item!
		const newItem = await Item.create(itemData, { parent: this.actor });

		if (newItem.type == "damage")
		{
			let isLethal = !(event.originalEvent.altKey || event.originalEvent.shiftKey || event.originalEvent.ctrKey);
			SPACE1889RollHelper.showDamageDialog(this.actor, newItem, isLethal);
		}

		return newItem;
	}

	/**
	 * Handle deleting an existing Item entry from the Advancement.
	 * @param {Event} event  The originating click event.
	 * @returns {Promise<Item5e>}  The promise for the updated parent Item which resolves after the application re-renders
	 * @private
	 */
	async _onItemDelete(event) {
		event.preventDefault();
		const idToDelete = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
		if (!idToDelete)
			return;

		const item = this.actor.items.get(idToDelete);
		const isInjury = item.type == "damage";
		await item.delete();

		if (isInjury)
			await SPACE1889Healing.refreshTheInjuryToBeHealed(this.actor)

//		li.slideUp(200, () => this.render(false));
		this.render();
	}

	async _onContainerDelete(event) {
		event.preventDefault();
		const idToDelete = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
		if (!idToDelete)
			return;


		let updateData = [];
		let lists = [this.actor.system.gear, this.actor.system.weapons, this.actor.system.ammunitions, this.actor.system.armors];
		for (let list of lists)
		{
			for (let item of this.actor.system.gear)
			{
				if (item.system.containerId == idToDelete)
					updateData.push({ _id: item._id, "system.containerId": null });
			}
		}
		if (updateData.length > 0)
			await this.actor.updateEmbeddedDocuments("Item", updateData);
		const item = this.actor.items.get(idToDelete);
		item.delete();
		this.render();
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
		const canRoll = this.isEditable;

		// Handle item rolls.
		if (dataset.rollType) 
		{
			if (dataset.rollType == 'item') 
			{
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item)
				{
					if (dataset.rollDiecount && canRoll)
					{
						const dieCount = Math.max(Number(dataset.rollDiecount),0);
						const showDialog = (event.shiftKey || event.ctrlKey);
						return item.rollSpecial(dieCount, showDialog);
					}
					return item.roll(event);
				} 
			}
			else if (dataset.rollType == "talent")
			{
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item && item.type == "talent" && item.system.isRollable && canRoll)
				{
					return SPACE1889RollHelper.rollItemFromEvent(item, this.actor, event);
				}
				return item.roll();
			}
			else if (dataset.rollType == 'actor' && dataset.rollDiecount && dataset.rollKey)
			{
				const actor = this.actor;
				const dieCount = Math.max(Number(dataset.rollDiecount),0);
				const evaluation = SPACE1889RollHelper.getEventEvaluation(event);

				if (evaluation.showInfoOnly)
					return actor.showAttributeInfo(dataset.label, dataset.rollKey, evaluation.whisperInfo);

				if (canRoll)
				{
					const isPrimary = CONFIG.SPACE1889.abilities[dataset.rollKey] != undefined;
					const showDialog = evaluation.showDialog || (isPrimary && game.settings.get("space1889", "showDialogForAllAttributeRolls"));
					return actor.rollAttribute(dieCount, showDialog, dataset.rollKey, evaluation.specialDialog);
				}
			}
			else if (dataset.rollType == 'actorinfo' &&  dataset.rollKey)
			{
				const actor = this.actor;
				const evaluation = SPACE1889RollHelper.getEventEvaluation(event);
				return actor.showAttributeInfo(dataset.label, dataset.rollKey, evaluation.whisperInfo);
			}
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll && canRoll) {
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

	_getDataId(ev)
	{
		return $(ev.currentTarget).parents(".position").attr("data-id");
	}

	render(force, options)
	{
		if (force && this.actor.type == "vehicle")
			this.actor.prepareDerivedData();

		super.render(force, options);
	}

}


