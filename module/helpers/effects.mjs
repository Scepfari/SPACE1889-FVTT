/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export function onManageActiveEffect(event, owner) {
	event.preventDefault();
	const a = event.currentTarget;
	const li = a.closest("li");
	const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
	switch ( a.dataset.action ) {
		case "create":
			const gameRound = game.combat ? game.combat.round : 0;
			const gameTurn = game.combat ? game.combat.turn : 0;

			return owner.createEmbeddedDocuments("ActiveEffect", [{
				label: game.i18n.localize("SPACE1889.EffectNew"),
				icon: "icons/svg/aura.svg",
				origin: owner.uuid,
				"duration.rounds": 1,
				"duration.seconds": 6,
				"duration.startRound": gameRound,
				"duration.startTurn": gameTurn,
				"duration.startTime": game.time.worldTime,
				disabled: li.dataset.effectType === "inactive"
			}]);
		case "edit":
			return effect.sheet.render(true);
		case "delete":
			return effect.delete();
		//case "toggle":
		//	return effect.update({disabled: !effect.system.disabled});
	}
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {

	// Define effect header categories
	const categories = {
		temporary: {
			type: "temporary",
			label: "Temporary Effects",
			effects: []
		},
		passive: {
			type: "passive",
			label: "Passive Effects",
			effects: []
		},
		inactive: {
			type: "inactive",
			label: "Inactive Effects",
			effects: []
		}
	};

	// Iterate over active effects, classifying them into categories
	for ( let e of effects ) {
		e._getSourceName(); // Trigger a lookup for the source name
		if ( e.disabled ) categories.inactive.effects.push(e);
		else if ( e.isTemporary ) categories.temporary.effects.push(e);
		else categories.passive.effects.push(e);
	}
	return categories;
}