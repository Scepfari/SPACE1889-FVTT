import SPACE1889Helper from "./helper.js";
import SPACE1889Time from "./time.js";
import { SPACE1889 } from "./config.js";

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

export function getEffectInfoText(effect, forChat = false)
{
	const isV10 = SPACE1889Helper.isFoundryV10Running();
	const headerClass = forChat ? "" : "class=\"itemTooltipH3\"";
	const textClass = forChat ? "" : "itemTooltip";
	const name = isV10 ? effect.label : effect.name;;
	const type = game.i18n.localize("SPACE1889.Effect");
	let desc = "";

	if (isV10)
	{
		const statusId = effect.flags?.core?.statusId;
		if (SPACE1889.effectsDescription.hasOwnProperty(statusId))
			desc += `<p>${game.i18n.localize(SPACE1889.effectsDescription[statusId])}</p>`;
	}
	else
	{
		for (let id of effect.statuses)
		{
			if (SPACE1889.effectsDescription.hasOwnProperty(id))
				desc += `<p>${game.i18n.localize(SPACE1889.effectsDescription[id])}</p>`;
		}
	}

	desc += forChat ? SPACE1889Helper.getItemChatImageHtml(effect.icon, true) : SPACE1889Helper.getItemChatImageHtml(effect.icon, true, 150);

	if (effect.disabled)
		desc += `<p><strong>${game.i18n.localize("SPACE1889.EffectDeactivated")}</strong></p>`;

	desc += `<p>${game.i18n.localize("SPACE1889.EffectStartTime")}: ${SPACE1889Time.formatEffectDuration(effect.duration)}</p>`;
	desc += `<p>${game.i18n.localize("SPACE1889.EffectDuration")}: ${effect.duration.label}</p>`;

	if (effect.changes.length > 0)
	{
		desc += `<div>${game.i18n.localize(effect.disabled ? "SPACE1889.EffectDeactivatedChanges" : "SPACE1889.EffectChanges")}:<ul>`;
		for (const change of effect.changes)
		{
			desc += `<li>${getNameFromEffectChange(change.key)}: ${SPACE1889Helper.getSignedStringFromNumber(change.value)}</li>`;
		}
		desc += "</ul></div>";
	}
	else
		desc += `<p>${game.i18n.localize("SPACE1889.EffectNoChanges")}</p>`;

	if (effect.description?.length > 0)
		desc += effect.description;

	const composition =
		`<h3 ${headerClass}><strong>${name}</strong> <small>[${type}]</small></h3><div class="${textClass}">${desc}</div>`;
	return composition;
}

export function getNameFromEffectChange(changeKey)
{
	if (changeKey.indexOf("system.abilities.") === 0)
	{
		const parts = changeKey.split(".");
		if (parts.length === 4 && SPACE1889.abilities.hasOwnProperty(parts[2]))
			return game.i18n.localize(SPACE1889.abilities[parts[2]]);
	}
	if (changeKey.indexOf("system.secondaries.") === 0)
	{
		const parts = changeKey.split(".");
		if (parts.length === 4 && SPACE1889.secondaries.hasOwnProperty(parts[2]))
			return game.i18n.localize(SPACE1889.secondaries[parts[2]]);
	}
	return changeKey;
}



