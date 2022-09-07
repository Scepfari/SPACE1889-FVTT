import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import SPACE1889Helper from "../helpers/helper.mjs";
import SPACE1889RollHelper from "../helpers/roll-helper.mjs";

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
			this._prepareCharacterData(context);
		}

		if (actorData.type == 'creature')
		{
			this._prepareItems(context);
			this._prepareCreatureData(context);
		}

		if (actorData.type == 'vehicle')
		{
			this._prepareVehicleItems(context); 
			this._prepareVehicleData(context);
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
		this._prepareAttributes(context);

		context.data['archetypes'] = CONFIG.SPACE1889.archetypes;
		context.data['species'] = CONFIG.SPACE1889.species;
		context.data['motivations'] = CONFIG.SPACE1889.motivations;
		context.data['resources'] = CONFIG.SPACE1889.resources;
		context.data['storageLocations'] = CONFIG.SPACE1889.storageLocation;
	}

	_prepareCreatureData(context)
	{
		this._prepareAttributes(context);
		context.data['archetypes'] = CONFIG.SPACE1889.creatureArchetypes;
		context.data['movementTypes'] = CONFIG.SPACE1889.creatureMovementType;
		context.data['origins'] = CONFIG.SPACE1889.creatureOrigins;
	}

	_prepareVehicleData(context)
	{
		context.data['crewExperiences'] = CONFIG.SPACE1889.crewExperience;
		context.data['crewTempers'] = CONFIG.SPACE1889.crewTemper;
		context.data['pilotSkills'] = CONFIG.SPACE1889.pilotSkills;
	}

	_prepareAttributes(context)
	{
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
		context.data['primaereAttribute'] = primaereAttribute;
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
		for (let i = 0; i < this.actor.data.weakness.length; ++i)
		{
			if (i%2 == 0)
				weaknessLeft.push(this.actor.data.weakness[i]);
			else 
				weaknessRight.push(this.actor.data.weakness[i]);
		}

		let languageLeft = [];
		let languageRight = [];
		for (let i = 0; i < this.actor.data.language.length; ++i)
		{
			if (i%2 == 0)
				languageLeft.push(this.actor.data.language[i]);
			else 
				languageRight.push(this.actor.data.language[i]);
		}


		// Assign and return
		context.gear = this.actor.data.gear;
		context.talents = this.actor.data.talents;
		context.skills = this.actor.data.skills;
		context.speciSkills = this.actor.data.speciSkills;
		context.resources = this.actor.data.resources;
		context.weapons = this.actor.data.weapons;
		context.armors = this.actor.data.armors;
		context.weakness = this.actor.data.weakness;
		context.weaknessLeft = weaknessLeft;
		context.weaknessRight = weaknessRight;
		context.language = this.actor.data.language;
		context.languageLeft = languageLeft;
		context.languageRight = languageRight;
		context.injuries = this.actor.data.injuries;
		context.money = this.actor.data.money;
	}


	_prepareVehicleItems(context)
	{
		// Iterate through items, set default image
		for (let i of context.items)
		{
			i.img = i.img || DEFAULT_TOKEN;
		}
		context.weapons = this.actor.data.weapons;
		context.injuries = this.actor.data.injuries;
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

	GetHeroLevelName()
	{
		const heroLevel = game.settings.get("space1889", "heroLevel");
		let id = "";
		if (heroLevel == 0)
			id = "SPACE1889.HeroLevelPechvogel";
		else if (heroLevel == 1)
			id = "SPACE1889.HeroLevelDurchschnittsbuerger";
		else if (heroLevel == 2)
			id = "SPACE1889.HeroLevelVielversprechend";
		else if (heroLevel == 3)
			id = "SPACE1889.HeroLevelVeteran";
		else if (heroLevel == 4)
			id = "SPACE1889.HeroLevelWeltspitze";
		else
			id = "SPACE1889.HeroLevelUebermensch";
		return game.i18n.localize(id);
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

		// Rollable abilities.
		html.find('.rollable').click(this._onRoll.bind(this));

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

		html.find('.increment-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const isSkill = item.data.type == "skill";

			if (item.data.type == "talent" || item.data.type == "resource")
			{
				const newValue = this.incrementValue(ev, item.data.data.level.value, item.data.data.level.min, item.data.data.level.max);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.level.value": newValue }]);
			}
			else if (isSkill || item.data.type == "specialization")
			{
				const max = this.actor.data.type == "character" ? (isSkill ? this.GetMaxSkillLevel() : 5) : 10;
				const min = isSkill ? 0 : 1;
				const newValue = this.incrementValue(ev, item.data.data.level, min, max, true);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.level": newValue }]);
			}
			else if (item.data.type == "weapon")
			{
				const newValue = this.incrementValue(ev, item.data.data.damage, -10, undefined);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.damage": newValue }]);
			}
			else if (item.data.type == "item")
			{
				const newValue = this.incrementValue(ev, item.data.data.quantity, 0);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.quantity": newValue }]);
			}
			else if (item.data.type == "currency")
			{
				let newValue = this.incrementValue(ev, item.data.data.quantity, 0);
				if (newValue != Math.round(newValue))
				{
					newValue = +(newValue.toFixed(2));
				}
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.quantity": newValue }]);
			}
			else if (item.data.type == "damage")
			{
				const newValue = this.incrementValue(ev, item.data.data.damage, 1, undefined);
				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.damage": newValue }]);
			}
		});

		html.find('.healingFactor-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			const newValue = this.incrementValue(ev, item.data.data.healingFactor, 1, undefined);
			this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.healingFactor": newValue }]);
		});

		html.find('.location-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			if (this.actor.data.type == 'vehicle')
			{
				const newLocationAndSpot = this.incrementVehicleMountLocation(ev, item.data.data.location, item.data.data.vehicle.spot);
				item.update({ 'data.location': newLocationAndSpot[0], 'data.vehicle.spot': newLocationAndSpot[1] });
			}
			else
			{
				const newLocation = this.incrementLocation(ev, item.data.data.location);
				item.update({ 'data.location': newLocation });
			}
		});

		html.find('.swivelingRange-click').mousedown(ev =>
		{
			const itemId = this._getItemId(ev);
			const item = this.actor.items.get(itemId);
			if (this.actor.data.type == 'vehicle' && item.data.type == 'weapon')
			{
				const newValue = this.incrementValue(ev, Number(item.data.data.vehicle.swivelingRange), 0, 360);
				let isSwivelMounted = item.data.data.vehicle.isSwivelMounted;
				if (newValue == 0 && isSwivelMounted)
					isSwivelMounted = false;
				else if (newValue > 0 && !isSwivelMounted)
					isSwivelMounted = true;

				this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.vehicle.swivelingRange": newValue, "data.vehicle.isSwivelMounted": isSwivelMounted }]);
			}
		});

		const isCharacter = this.actor.data.type == "character";
		const isNpc = this.actor.data.type == "npc"
		const primaryMin = (isCharacter || isNpc) ? 1 : 0;
		const primaryMax = isCharacter ? this.GetMaxPrimaryAttributeLevel() : undefined;

		html.find('.increment-con-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.abilities.con.value, primaryMin, primaryMax, true);
			this.actor.update({ 'data.abilities.con.value': newValue });
		});

		html.find('.increment-dex-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.abilities.dex.value, primaryMin, primaryMax, true);
			this.actor.update({ 'data.abilities.dex.value': newValue });
		});
		html.find('.increment-str-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.abilities.str.value, primaryMin, primaryMax, true);
			this.actor.update({ 'data.abilities.str.value': newValue });
		});
		html.find('.increment-cha-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.abilities.cha.value, primaryMin, primaryMax, true);
			this.actor.update({ 'data.abilities.cha.value': newValue });
		});
		html.find('.increment-int-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.abilities.int.value, primaryMin, primaryMax, true);
			this.actor.update({ 'data.abilities.int.value': newValue });
		});
		html.find('.increment-wil-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.abilities.wil.value, primaryMin, primaryMax, true);
			this.actor.update({ 'data.abilities.wil.value': newValue });
		});

		html.find('.increment-style-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.style.value, 0, undefined);
			this.actor.update({ 'data.style.value': newValue });
		});

		html.find('.increment-xp-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.attributes.xp.value, 0, undefined);
			this.actor.update({ 'data.attributes.xp.value': newValue });
		});

		html.find('.increment-animalcompanionlevel-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.animalCompanionLevel, 0, 5);
			this.actor.update({ 'data.animalCompanionLevel': newValue });
		});

		html.find('.increment-creaturesize-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.secondaries.size.value, -5, 20);
			this.actor.update({ 'data.secondaries.size.value': newValue });
		});

		html.find('.increment-structure-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.health.max, 0, undefined);
			this.actor.update({ 'data.health.max': newValue });
		});
		html.find('.increment-speed-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.speed.max, 0, undefined);
			this.actor.update({ 'data.speed.max': newValue });
		});
		html.find('.increment-maneuverability-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.maneuverability.max, -5, 5);
			this.actor.update({ 'data.maneuverability.max': newValue });
		});
		html.find('.increment-passiveDefense-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.passiveDefense, 0, undefined);
			this.actor.update({ 'data.passiveDefense': newValue });
		});

		html.find('.increment-captain-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.captain.value, 0, undefined);
			this.actor.update({ 'data.positions.captain.value': newValue });
		});
		html.find('.increment-copilot-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.copilot.value, 0, undefined);
			this.actor.update({ 'data.positions.copilot.value': newValue });
		});
		html.find('.increment-gunner-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.gunner.value, 0, undefined);
			this.actor.update({ 'data.positions.gunner.value': newValue });
		});
		html.find('.increment-signaler-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.signaler.value, 0, undefined);
			this.actor.update({ 'data.positions.signaler.value': newValue });
		});
		html.find('.increment-lookout-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.lookout.value, 0, undefined);
			this.actor.update({ 'data.positions.lookout.value': newValue });
		});
		html.find('.increment-mechanic-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.mechanic.value, 0, undefined);
			this.actor.update({ 'data.positions.mechanic.value': newValue });
		});
		html.find('.increment-medic-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.positions.medic.value, 0, undefined);
			this.actor.update({ 'data.positions.medic.value': newValue });
		});
		html.find('.increment-crew-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.crew.max, 1, undefined);
			this.actor.update({ 'data.crew.max': newValue });
		});
		html.find('.increment-crew-current-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.crew.value, 0, this.actor.data.data.crew.max);
			this.actor.update({ 'data.crew.value': newValue });
		});
		html.find('.increment-passenger-max-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.passenger.max, 0, undefined);
			this.actor.update({ 'data.passenger.max': newValue });
		});
		html.find('.increment-passenger-current-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.passenger.value, 0, this.actor.data.data.passenger.max);
			this.actor.update({ 'data.passenger.value': newValue });
		});
		html.find('.increment-strengthTempoFactor-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.strengthTempoFactor.value, 0, this.actor.data.data.strengthTempoFactor.max);
			this.actor.update({ 'data.strengthTempoFactor.value': newValue });
		});
		html.find('.increment-vehicle-size-click').mousedown(ev =>
		{
			const newValue = this.incrementValue(ev, this.actor.data.data.size, 0, undefined);
			this.actor.update({ 'data.size': newValue });
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
			if (this.actor.data.type == 'vehicle')
			{
				SPACE1889RollHelper.rollManoeuver('Attack', this.actor, ev, itemId);
			}
		});
		html.find('.roll-vehicle-defense-click').mousedown(ev =>
		{
			if (this.actor.data.type == 'vehicle')
				SPACE1889RollHelper.rollManoeuver('defense', this.actor, ev);
		});
		html.find('.condition-toggle').mousedown(ev =>
		{
			const positionId = this._getDataId(ev);
			const toggledValue = !this.actor.data.data.positions[positionId].staffed;
			const key = 'data.positions.' + positionId + '.staffed';
			let updateObject = {};
			updateObject[key] = toggledValue;
			this.actor.update(updateObject);
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

	_doVehiclePositionClick(event, positionKey)
	{
		if (this.actor.data.type == "vehicle")
		{
			const eventInfo = SPACE1889RollHelper.getEventEvaluation(event);
			if (eventInfo.specialDialog)
			{
				const key = 'data.positions.' + positionKey + '.actorId';
				let updateObject = {};
				updateObject[key] = "";
				this.actor.update(updateObject);
			}
			else
				SPACE1889Helper.showActorSheet(this.actor.data.data.positions[positionKey].actorId);
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
			  label: 'Los!',
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
			  label: 'Abbrechen',
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
			  label: 'Los!',
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
			  label: 'Abbrechen',
			  callback: ()=> {ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll"))},
			  icon: `<i class="fas fa-times"></i>`
			}
		  },
		  default: "ok"
		})

		dialogue.render(true)
	}

/*  async _onDrop(event) {
		const dragData = JSON.parse(event.dataTransfer.getData("text/plain"))
		//this._handleDragData(dragData, event, await itemFromDrop(dragData, this.actor.id))


		ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: dragData.id }))
		await super._onDrop(event);
	}*/

	async _onDropActor(event, data)
	{
		if (!this.actor.isOwner)
			return false;

		if (this.actor.data.type != 'vehicle')
			return false;

		let dropedActor = null;
		if (data.pack)
		{
			const pack = game.packs.find(p => p.collection === data.pack);
			dropedActor = await pack.getDocument(data.id);
		}
		else
		{
			dropedActor = game.actors.get(data.id);
		}

		if (!dropedActor)
			return;

		await SPACE1889Helper.setVehicleActorPositionFromDialog(this.actor, dropedActor);
		
	}


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

		if (actor.type == 'creature' &&
			(itemData.type == "resource" || itemData.type == "language"))
			return false;

		if (itemData.type == "weapon")
		{
			if (actor.type == "vehicle")
			{
				if (itemData.data.skillId != "geschuetze")
				{
					ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: itemData.name }))
					return false;
				}
			}
			else if (itemData.data.strengthThreshold > actor.data.abilities["str"].total)
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
			const isValid = this.isTalentPossible(itemData);
			if (isValid && itemData.data.id == "begabung")
			{
				this.showTalentSkillSelectionDialog(itemData);
			}
			if (isValid && itemData.data.id == "geschaerfterSinn")
				this.showGeschaerfterSinnDialog(itemData);
			if (isValid && itemData.data.id == "eigenartigerKampfstil")
				this.showTalentSkillSelectionDialog(itemData);
			return isValid;
		}
		return true;		
	}


	showTalentSkillSelectionDialog(itemData)
	{
		let optionen = '';
		let actor = this.actor.data;

		for (let item of actor.skills)
		{
			optionen += '<option value="' + item.data.id + '" selected="selected">' + item.data.label + '</option>';
		}

		let talentName = game.i18n.localize(itemData.data.nameLangId);;
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
					callback: () =>
					{
						selectedOption = document.getElementById('choices').value;
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
					let newTalent = actor.talents.find(e => e.data.id == itemData.data.id && e.data.bonusTarget == "");
					if (newTalent != undefined)
						this.actor.updateEmbeddedDocuments("Item", [{ _id: newTalent._id, "data.bonusTarget": selectedOption }]);

					console.log("set data.bonusTarget to: " + selectedOption);
				}
			}
		});
		dialog.render(true);
	}

	showGeschaerfterSinnDialog(itemData)
	{
		
		let actor = this.actor.data;

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
					callback: () =>
					{
						selectedOption = document.getElementById('choices').value;
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
					let newTalent = actor.talents.find(e => e.data.id == "geschaerfterSinn" && e.data.bonusTarget == "");
					if (newTalent != undefined)
						this.actor.updateEmbeddedDocuments("Item", [{ _id: newTalent._id, "data.bonusTarget": selectedOption, "data.bonusTargetType": "sense" }]);

					console.log("set data.bonusTarget to: " + selectedOption);
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

		const actor = this.actor.data;

		if (type == "actor")
		{
			if (id == actor.type)
				return true;
		}
		else if (type == "primary")
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
			if (actor.type == "creature")
				return true;

			var ids = id.split(";");
			for (let i of ids)
			{
				if (actor.data.attributes?.species?.value == i)
					return true;
			}
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
		const isPossible = (itemData.data.isOrOperator ? (isPossible1 || isPossible2) : (isPossible1 && isPossible2));
		if (isPossible)
			return true;

		const talentName = itemData.name;
		const preConType = game.i18n.format(CONFIG.SPACE1889.preConditionTypes[itemData.data.preconditionType]);
		const preCon2Type = game.i18n.format(CONFIG.SPACE1889.preConditionTypes[itemData.data.secondPreconditionType]);
		const group = itemData.data.isGroup ? "Group" : "";
		const preConNameList = itemData.data.preconditionName.split(";");

		let preConNames = "";

		for (const preCon of preConNameList)
		{
			const preConNameLangId = "SPACE1889." + this.mapPreconditionTypeToLangIdSubString(itemData.data.preconditionType) + group + this.firstLetterToUpperCase(preCon);
			let preConName = game.i18n.format(preConNameLangId);
			if (preConName == preConNameLangId)
				preConName = this.firstLetterToUpperCase(preCon);
			preConNames += (preConNames == "" ? preConName : ", " + preConName);
		}


		let info = "";
		if (itemData.data.isOrOperator && !isPossible1 && !isPossible2)
		{
			const preConLevel = itemData.data.preconditionLevel.toString();

			const preCon2Type = game.i18n.format(CONFIG.SPACE1889.preConditionTypes[itemData.data.secondPreconditionType]);
			const preCon2NameLangId = "SPACE1889." + this.mapPreconditionTypeToLangIdSubString(itemData.data.secondPreconditionType) + this.firstLetterToUpperCase(itemData.data.secondPreconditionName);
			let preCon2Name = game.i18n.format(preCon2NameLangId);
			if (preCon2Name == preCon2NameLangId)
				preCon2Name = this.firstLetterToUpperCase(itemData.data.secondPreconditionName);
			const preCon2Level = itemData.data.secondPreconditionLevel.toString();

			info = game.i18n.format("SPACE1889.CanNotAddTalentTwoPreCons", {
				talentName: talentName, preConType: preConType, preConName: preConNames, preConLevel: preConLevel, preCon2Type: preCon2Type, preCon2Name: preCon2Name, preCon2Level: preCon2Level
			})
		}
		else if (!isPossible1 && !itemData.data.isOrOperator)
		{
			const preConLevel = itemData.data.preconditionLevel.toString();

			if (itemData.data.preconditionType == "species")
				info = game.i18n.format("SPACE1889.CanNotAddTalentWrongSpecies", { talentName: talentName, preConName: preConNames });
			else
				info = game.i18n.format("SPACE1889.CanNotAddTalentOnePreCons", { talentName: talentName, preConType: preConType, preConName: preConNames, preConLevel: preConLevel });
		}
		else if (!isPossible2 && !itemData.data.isOrOperator)
		{
			const preCon2NameLangId = "SPACE1889." + this.mapPreconditionTypeToLangIdSubString(itemData.data.secondPreconditionType) + this.firstLetterToUpperCase(itemData.data.secondPreconditionName);
			let preCon2Name = game.i18n.format(preCon2NameLangId);
			if (preCon2Name == preCon2NameLangId)
				preCon2Name = this.firstLetterToUpperCase(itemData.data.secondPreconditionName);
			const preCon2Level = itemData.data.secondPreconditionLevel.toString();

			if (itemData.data.preconditionType == "species")
				info = game.i18n.format("SPACE1889.CanNotAddTalentWrongSpecies", { talentName: talentName, preConName: preCon2Name });
			else
				info = game.i18n.format("SPACE1889.CanNotAddTalentOnePreCons", { talentName: talentName, preConType: preCon2Type, preConName: preCon2Name, preConLevel: preCon2Level });
		}
	
		if (info != "")
			ui.notifications.error(info);
		else
			ui.notifications.error(game.i18n.format("SPACE1889.canNotBeAdded", { item: itemData.name }));

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
	 * @param {string} currentValue a storage location: 'koerper', 'rucksack' or 'lager'
	 */
	incrementLocation(ev, currentValue)
	{
		const k = 'koerper';
		const r = 'rucksack';
		const l = 'lager';

		const backward = ev.button == 2;
		if (currentValue == k)
			return backward ? l : r;
		else if (currentValue == r)
			return backward ? k : l;
		else
			return backward ? r : k;
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
		const newItem = await Item.create(itemData, { parent: this.actor });

		if (newItem.data.type == "damage")
		{
			let isLethal = !(event.originalEvent.altKey || event.originalEvent.shiftKey || event.originalEvent.ctrKey);
			SPACE1889RollHelper.showDamageDialog(this.actor, newItem, isLethal);
		}

		return newItem;
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
				if (item && item.data.type == "talent" && item.data.data.isRollable)
				{
					const showDialog = (event.shiftKey || event.ctrlKey);
					if (item.data.data.id == "geschaerfterSinn" && canRoll)
					{
						const dieCount = Math.max(this.actor.data.data.secondaries.perception.total + Number(item.data.data.bonus), 0);
						return item.rollSpecialTalent(dieCount, showDialog)
					}
					else if (item.data.data.id == "paralysierenderSchlag" && canRoll)
					{
						const skillItem = this.actor.items.find(e => e.data.data.id == "waffenlos");
						if (skillItem != undefined)
						{
							const dieCount = Math.max(0, skillItem.data.data.rating + ((item.data.data.level.value - 1) * 2));
							return item.rollSpecialTalent(dieCount, showDialog);
						}
					}
					else if (item.data.data.id == "assassine" && canRoll)
					{
						const skillItem = this.actor.items.find(e => e.data.data.id == "heimlichkeit");
						if (skillItem != undefined)
						{
							const dieCount = Math.max(0, skillItem.data.data.rating + ((item.data.data.level.value - 1) * 2));
							return item.rollSpecialTalent(dieCount, showDialog);
						}
					}
					else if (item.data.data.id == "eigenartigerKampfstil" && canRoll)
					{
						const skillItem = this.actor.items.find(e => e.data.data.id == item.data.data.bonusTarget);
						if (skillItem != undefined)
						{
							const dieCount = SPACE1889RollHelper.getTalentDieCount(item.data, this.actor);
							return item.rollSpecialTalent(dieCount, showDialog);
						}
					}
					return item.roll();
				}
			}
			else if (dataset.rollType == 'actor' && dataset.rollDiecount && dataset.rollKey)
			{
				const actor = this.actor;
				const dieCount = Math.max(Number(dataset.rollDiecount),0);
				const evaluation = SPACE1889RollHelper.getEventEvaluation(event);

				if (evaluation.showInfoOnly)
					return actor.showAttributeInfo(dataset.label, dataset.rollKey, evaluation.whisperInfo);

				if (canRoll)
					return actor.rollAttribute(dieCount, evaluation.showDialog, dataset.rollKey, evaluation.specialDialog);
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
		if (force && this.actor.data.type == "vehicle")
			this.actor.prepareDerivedData();

		super.render(force, options);
	}

}


