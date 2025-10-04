import SPACE1889Combat from "../helpers/combat.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";
import SPACE1889Light from "../helpers/light.js";

export default function () 
{
	Hooks.on("renderTokenHUD", function (hud, html, data) 
	{
		const tokenDocument = game.scenes.viewed.tokens.get(data._id);
		const actor = tokenDocument ? tokenDocument.actor : game.actors.get(data.actorId);
		if (!actor)
			return;

		const weapons = SPACE1889Combat.getWeaponInHands(actor);
		const lightSources = SPACE1889Light.blockedHandsFromLightSources(actor);
		let actions = [];
		if (weapons.primaryWeapon)
		{
			const weapon = weapons.primaryWeapon;
			const action = { name: weapon.name, itemId: weapon.id, image: weapon.img, type: "attack", tooltip: weapon.name };
			actions.push(action);
		}
		else if (lightSources.primaryId)
		{
			const lightSource = actor.system.lightSources.find(e => e.id === lightSources.primaryId);
			if (lightSource)
			{
				const action = {
					name: lightSource.name,
					itemId: lightSource.id,
					image: lightSource.img,
					type: "drop",
					tooltip: game.i18n.format("SPACE1889.DropItem", { name: lightSource.name })
				};
				actions.push(action);
			}
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
		else if (lightSources.offId)
		{
			const lightSource = actor.system.lightSources.find(e => e.id === lightSources.offId);
			if (lightSource)
			{
				const action = {
					name: lightSource.name,
					itemId: lightSource.id,
					image: lightSource.img,
					type: "drop",
					tooltip: game.i18n.format("SPACE1889.DropItem", { name: lightSource.name })
				};
				actions.push(action);
			}
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

			if (hasFreeHands || disarmWeaponId !== "")
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


		if (actions.length === 0)
			return;

		const maxCol = 5;
		let cols = Math.min(maxCol, actions.length);

		const actionHUD = document.createElement("div");
        actionHUD.className = "space1889-tokenHudAction";
        actionHUD.style.width = `${maxCol * 43}px`;

		for (let i = 0; i < cols; i++)
		{
			const action = actions[i];
			const iconDiv = document.createElement("div");
			iconDiv.className = "control-icon";
			iconDiv.setAttribute("name", "SPACE1889Action");
			iconDiv.setAttribute("itemId", action.itemId);
			iconDiv.setAttribute("actionType", action.type);
			iconDiv.setAttribute("actorId", actor.id);
			iconDiv.setAttribute("tokenId", tokenDocument ? tokenDocument.id : "");
			iconDiv.setAttribute("data-tooltip", action.tooltip);
			iconDiv.id = action.name;

			const img = document.createElement("img");
			img.src = action.image;
			img.width = 35;
			img.height = 35;
			img.className = "space1889-tokenHudButton";
			iconDiv.appendChild(img);
			actionHUD.appendChild(iconDiv);
		}

        const controlIcons = html.querySelector('div.col.left');
		if (!controlIcons || !controlIcons.parentNode)
			return;

        controlIcons.parentNode.insertBefore(actionHUD, controlIcons);

		actionHUD.querySelectorAll('div[name="SPACE1889Action"]').forEach(btn =>
		{
			btn.addEventListener("click", function (event)
			{
				const type = this.getAttribute("actionType");
				const itemId = this.hasAttribute("actionType") ? this.getAttribute("itemId") : "";
				const actorId = this.getAttribute("actorId");
				const tokenId = this.getAttribute("tokenId");

				SPACE1889RollHelper.rollHudAction(event, tokenId, actorId, type, itemId);

			});
		});
	});
}
