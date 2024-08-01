import SPACE1889Combat from "../helpers/combat.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";

export default function () 
{
	Hooks.on("renderTokenHUD", function (hud, html, data) 
	{
		const tokenDocument = game.scenes.viewed.tokens.get(data._id);
		const actor = tokenDocument ? tokenDocument.actor : game.actors.get(data.actorId);
		const weapons = SPACE1889Combat.getWeaponInHands(actor);
		let actions = [];
		if (weapons.primaryWeapon)
		{
			const weapon = weapons.primaryWeapon;
			const action = { name: weapon.name, itemId: weapon.id, image: weapon.img, type: "attack", tooltip: weapon.name };
			actions.push(action);
		}
		if (weapons.offHandWeapon && weapons.offHandWeapon.id !== weapons.primaryWeapon?.id)
		{
			const weapon = weapons.offHandWeapon;
			const action = {
				name: weapon.name, itemId: weapon.id, image: weapon.img, type: "attack",
				tooltip: `${weapon.name} (${game.i18n.localize("SPACE1889.WeaponUseOffHand")})`
			};
			actions.push(action);
		}
		if (actor.type === "creature" && actions.length === 0)
		{
			for (let weapon of actor.system.weapons)
			{
				const action = { name: weapon.name, itemId: weapon.id, image: weapon.img, type: "attack", tooltip: weapon.name };
				actions.push(action);
			}
		}

		if ((actor.type === "character" || actor.type === "npc"))
		{
			const hasFreeHands = SPACE1889Combat.hasFreeHands(actor);

			if (hasFreeHands)
			{
				const name = game.i18n.localize("SPACE1889.CombatManoeuversGrapple");
				const action = { name: name, itemId: "", image: "icons/svg/net.svg", type: "grapple", tooltip: name };
				actions.push(action);
			}

			const tripName = game.i18n.localize("SPACE1889.CombatManoeuversTrip");
			const tripAction = { name: tripName, itemId: "", image: "icons/svg/falling.svg", type: "trip", tooltip: tripName };
			actions.push(tripAction);

			let disarmWeaponId = SPACE1889Combat.isCloseCombatWeapon(weapons.primaryWeapon, false) ? weapons.primaryWeapon.id : "";
			if (disarmWeaponId === "")
				disarmWeaponId = SPACE1889Combat.isCloseCombatWeapon(weapons.offHandWeapon, false) ? weapons.offHandWeapon.id : "";

			if (hasFreeHands || disarmWeaponId)
			{
				const disarmName = game.i18n.localize("SPACE1889.CombatManoeuversDisarm");
				const disarmAction = { name: disarmName, itemId: disarmWeaponId, image: "systems/space1889/icons/svg/drop-weapon.svg", type: "disarm", tooltip: disarmName };
				actions.push(disarmAction);
			}
		}

		// Talent Angriffe
		const talents = actor.getTalentAttacks();
		for (const talent of talents)
		{
			let image = talent.img;
			if (talent.system.id === "paralysierenderSchlag")
				image = "icons/svg/paralysis.svg";
			else if (talent.system.id === "assassine")
				image = "icons/weapons/daggers/dagger-poisoned-curved-green.webp";
			const action = { name: talent.name, itemId: talent.id, image: image, type: "talentAttack", tooltip: talent.name };
			actions.push(action);
		}

		if (actor.type !== "vehicle")
		{
			const name = game.i18n.localize("SPACE1889.KeyRollAnySkill");
			const action = { name: name, itemId: "", image: "icons/svg/dice-target.svg", type: "skill", tooltip: name };
			actions.push(action);
		}

		const maxCol = 5;
		let cols = Math.min(maxCol, actions.length);
		let actionHtml = `<div class="space1889-tokenHudAction" style="width:${cols * 50}px;">`; 
		if (!actor || actions.length === 0)
			return;

		for (let i = 0; i < Math.min(maxCol * 2, actions.length); ++i)
		{
			actionHtml += `<div class="control-icon" name="SPACE1889Action" actionType="${actions[i].type}" tokenId="${tokenDocument ? tokenDocument.id : ""}" id="${actor.id}" itemId="${actions[i].itemId}" > 
			<img class="scale-down" src="${actions[i].image}" width="35" height="35" data-tooltip="${actions[i].tooltip}"/></div>`;
		}
		actionHtml += "</div>";

		const controlIcons = html.find(`div[class="col left"]`);
		controlIcons.before(actionHtml);
		const cHUDWidth = $(".space1889-tokenHudAction").outerWidth(true);
		const hudWidth = $(html).outerWidth(true);
		const diff = (hudWidth - cHUDWidth) / 2;
		$(".space1889-tokenHudAction").css({ left: diff });
		$(html.find(`div[name="SPACE1889Action"]`)).on("click", function(event) {
			const type = this.getAttribute("actionType");
			const itemId = this.hasAttribute("actionType") ? this.getAttribute("itemId") : "";
			const actorId = this.getAttribute("id");
			const tokenId = this.getAttribute("tokenId");

			SPACE1889RollHelper.rollHudAction(event, tokenId, actorId, type, itemId);
		});
	});
}
