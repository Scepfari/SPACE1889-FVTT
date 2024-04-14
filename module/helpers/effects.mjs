import SPACE1889Helper from "./helper.js";
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
			if (SPACE1889Helper.isFoundryV10Running())
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
			else
				return owner.createEmbeddedDocuments("ActiveEffect", [{
					name: game.i18n.localize("SPACE1889.EffectNew"),
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

