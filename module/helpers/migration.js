import SPACE1889Helper from "../helpers/helper.js";

export class Space1889Migration
{
	static async runInitMigrationAction()
	{
		const currentVersion = game.system.version;
		const lastUsedVersion = game.settings.get("space1889", "lastUsedSystemVersion");
		const lastUsedFoundryVersion = game.settings.get("space1889", "lastUsedFoundryVersion");
		const isNewWorld = lastUsedVersion == "0.0.0";
		let refreshCalendar = false;

		if (foundry.utils.isNewerVersion(currentVersion, lastUsedVersion) && game.user.isGM)
		{
			if (!isNewWorld)
			{
				await this.fixEisenschaedel(lastUsedVersion);
				await this.fixVolleAbwehr(lastUsedVersion);
				await this.ammunitionIntroduction(lastUsedVersion);
				await this.weaponTwoHandedIntroduction(lastUsedVersion);
				await this.containerIntroduction(lastUsedVersion);
				await this.damageRework(lastUsedVersion);
				await this.updateTalentSkillGroup(lastUsedVersion);
			}
			await game.settings.set("space1889", "lastUsedSystemVersion", currentVersion);
		}
		if (game.user.isGM)
		{
			await this.migrateDataModelSchemaCompatibility();
			await this.migrateEffectsForFoundryV11(lastUsedVersion, lastUsedFoundryVersion, isNewWorld);
			refreshCalendar = await this.migrateSimpleCalendar(lastUsedVersion, lastUsedFoundryVersion);
			await this.migrateNoEpLevels(lastUsedVersion, isNewWorld);
			await game.settings.set("space1889", "lastUsedFoundryVersion", game.version);
		}
		return refreshCalendar;
	}

	static async fixVolleAbwehr(lastUsedVersion)
	{
		const lastNonFixVersion = "0.7.4";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion))
			return;

		for (let actor of game.actors.values())
		{
			let talent = actor.talents?.find(e => e.system.id === 'volleAbwehr');
			if (talent != undefined && talent.system.bonusStartLevel != 2)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: talent._id, "system.bonusTarget": "defense", "system.bonusTargetType": "secondary", "system.bonus": 2, "system.bonusStartLevel": 2 }]);
				console.log("SPACE 1889 system update to " + game.system.version + " - fix item values: " + talent.name + "(_id=" + talent._id + ")");
			}
		}
	}

	static async fixEisenschaedel(lastUsedVersion)
	{
		const lastNonFixVersion = "0.7.4";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion))
			return;

		for (let actor of game.actors.values())
		{
			let talent = actor.talents?.find(e => e.system.id === 'eisenschaedel');
			if (talent != undefined && talent.system.bonus != 1)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: talent._id, "system.bonus": 1 }]);
				console.log("fix item values: " + talent.name + "(_id=" + talent._id + ")");
			}
		}
	}

	static async ammunitionIntroduction(lastUsedVersion)
	{
		const lastNonFixVersion = "1.2.1";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion) || !game.user.isGM)
			return;

		let actorList = this.getAllActorsWithoutVehicleAndCreature();
		await SPACE1889Helper.updateWeaponAndCreateAmmo(actorList);
	}

	static getAllActorsWithoutVehicleAndCreature()
	{
		let actorList = [];
		for (const scene of game.scenes)
		{
			for (let token of scene.tokens)
			{
				if (token.actorLink || token.actor == undefined || token.actor.type == "vehicle" || token.actor.type == "creature")
					continue;

				actorList.push(token.actor);
			}
		}
		for (let actor of game.actors)
		{
			if (actor.type == "vehicle" || actor.type == "creature")
				continue;

			actorList.push(actor);
		}
		return actorList;
	}

	static getAllActors()
	{
		let actorList = [];
		for (const scene of game.scenes)
		{
			for (let token of scene.tokens)
			{
				if (token.actorLink || token.actor == undefined)
					continue;

				actorList.push(token.actor);
			}
		}
		for (let actor of game.actors)
		{
			actorList.push(actor);
		}
		return actorList;
	}

	static async weaponTwoHandedIntroduction(lastUsedVersion)
	{
		const lastNonFixVersion = "1.3.4";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion) || !game.user.isGM)
			return;

		let actorList = [];
		for (const scene of game.scenes)
		{
			for (let token of scene.tokens)
			{
				if (token.actorLink || token.actor == undefined || token.actor.type == "vehicle" || token.actor.type == "creature")
					continue;

				actorList.push(token.actor);
			}
		}
		for (let actor of game.actors)
		{
			if (actor.type == "vehicle" || actor.type == "creature")
				continue;

			actorList.push(actor);
		}
		await this.updateWeaponTwoHanded(actorList);
	}

	static async updateWeaponTwoHanded(actorList)
	{
		const spez = ["armbrust", "bogen", "gewehr", "schrotgewehr", "speere"];
		let packWeapons = await SPACE1889Helper.getPackItemsFromFolder("space1889.ausrustung", "eCWp8f1yb90AJvM8")

		for (const actor of actorList)
		{
			for (const weapon of actor.weapons)
			{
				if (weapon.system.skillId == "geschuetze" || spez.indexOf(weapon.system.specializationId) >= 0)
					await this.setWeaponToTwoHanded(weapon, actor);
				else if (weapon.system.skillId == "nahkampf" || weapon.system.specializationId == "archaisch")
				{
					const sourceId = weapon.flags.core?.sourceId;
					if (sourceId)
					{
						let source = packWeapons.find(e => e._id == SPACE1889Helper.getIdFromUuid(sourceId));
						if (source && source.system.isTwoHanded)
						{
							await this.setWeaponToTwoHanded(weapon, actor);
						}
					}
				}
			}
		}
	}

	static async setWeaponToTwoHanded(weapon, actor)
	{
		if (weapon.system.isTwoHanded)
			return;

		await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.isTwoHanded": true }]);
		console.log("update weapon " + weapon.name + " from actor/token " + actor.name + " to two handed");
	}

	static async setRemainingRoundsToMaxCapacity(actor, packWeapons)
	{
		for (let weapon of actor.weapons)
		{
			if (!weapon.system.isRangeWeapon)
				continue;

			if (weapon.system.capacity != null)
				await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": weapon.system.capacity }]);
			else
			{
				const packWeapon = packWeapons.find(x => x.system.id == weapon.system.id);
				if (packWeapon)
					await actor.updateEmbeddedDocuments("Item", [{ _id: weapon._id, "system.ammunition.remainingRounds": packWeapon.system.capacity, "system.capacity": packWeapon.system.capacity, "system.capacityType": packWeapon.system.capacityType }]);
			}
		}
	}

	static async containerIntroduction(lastUsedVersion)
	{
		const lastNonFixVersion = "1.4.3";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion) || !game.user.isGM)
			return;

		let actorList = this.getAllActorsWithoutVehicleAndCreature();
		await SPACE1889Helper.createContainersFromLocation(actorList);
	}

	static async damageRework(lastUsedVersion)
	{
		const lastNonFixVersion = "2.1.1";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion) || !game.user.isGM)
			return;

		let actorList = this.getAllActorsWithoutVehicleAndCreature();
		await SPACE1889Helper.createDamageTimestamps(actorList);
	}	

	static async updateTalentSkillGroup(lastUsedVersion)
	{
		const lastNonFixVersion = "2.3.3";
		if (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion) || !game.user.isGM)
			return;
		
		let actorList = this.getAllActorsWithoutVehicleAndCreature();
		for (let actor of actorList)
		{
			if (!actor.talents || actor.talents.length == 0)
				continue;

			let updateData = [];
			for (let talent of actor.talents)
			{
				if (talent.system.preconditionType === "skill" && talent.system.isGroup)
				{
					updateData.push({ _id: talent._id, "system.preconditionType": "skillGroup" });
					console.log(`${actor.name} (${actor.id}): talent: ${talent.system.id} (${talent.system.preconditionName})`);
				}
			}

			if (updateData.length > 0)
			{
				await actor.updateEmbeddedDocuments("Item", updateData);
				console.log(game.i18n.format("SPACE1889.MigrationTalentSkillGroup", { name: actor.name, id: actor._id }));
			}
		}
	}	

	static async migrateDataModelSchemaCompatibility()
	{
		if (!game.user.isGM)
			return;

		for (const actor of this.getUniqueActors())
		{
			const actorUpdate = this.getActorDataModelUpdate(actor);
			if (actorUpdate)
			{
				await actor.update(actorUpdate);
				console.log(`SPACE 1889 DataModel migration - updated actor ${actor.name} (${actor.id})`);
			}

			const embeddedUpdates = [];
			for (const item of actor.items)
			{
				const itemUpdate = this.getItemDataModelUpdate(item);
				if (itemUpdate)
					embeddedUpdates.push({ _id: item.id, ...itemUpdate });
			}

			if (embeddedUpdates.length > 0)
			{
				await actor.updateEmbeddedDocuments("Item", embeddedUpdates);
				console.log(`SPACE 1889 DataModel migration - updated ${embeddedUpdates.length} embedded items for ${actor.name} (${actor.id})`);
			}
		}

		for (const item of game.items)
		{
			const itemUpdate = this.getItemDataModelUpdate(item);
			if (itemUpdate)
			{
				await item.update(itemUpdate);
				console.log(`SPACE 1889 DataModel migration - updated world item ${item.name} (${item.id})`);
			}
		}
	}

	static getUniqueActors()
	{
		const uniqueActors = new Map();
		for (const actor of this.getAllActors())
		{
			if (!actor)
				continue;

			const key = actor.uuid ?? `${actor.id}-${actor.name}`;
			if (!uniqueActors.has(key))
				uniqueActors.set(key, actor);
		}
		return uniqueActors.values();
	}

	static getActorDataModelUpdate(actor)
	{
		const updateData = {};
		const sourceSystem = actor._source?.system ?? {};

		if ((actor.type === "character" || actor.type === "npc") && sourceSystem["weight "] && !sourceSystem.weight)
		{
			updateData["system.weight"] = sourceSystem["weight "];
			updateData["system.-=weight "] = null;
		}

		if (actor.type === "vehicle")
		{
			const currentWeight = sourceSystem.weight2;
			if (currentWeight === undefined || currentWeight === null || currentWeight === "")
				updateData["system.weight2"] = "15t";
			else if (typeof currentWeight !== "string")
				updateData["system.weight2"] = String(currentWeight);

			const maneuverabilityValue = sourceSystem.maneuverability?.value;
			if (maneuverabilityValue != null && typeof maneuverabilityValue !== "string")
				updateData["system.maneuverability.value"] = String(maneuverabilityValue);
		}

		return Object.keys(updateData).length > 0 ? updateData : null;
	}

	static getItemDataModelUpdate(item)
	{
		const updateData = {};
		const sourceSystem = item._source?.system ?? {};

		if (item.type === "vision" && sourceSystem.visionColor === null)
			updateData["system.visionColor"] = "";

		if (item.type === "currency" && sourceSystem.exchangeValue != null && typeof sourceSystem.exchangeValue !== "string")
			updateData["system.exchangeValue"] = String(sourceSystem.exchangeValue);

		if (item.system.id === "" && item.name.length > 0 && item.type != "damage" && item.type != "extended_action")
			updateData["system.id"] = item.createId(item.name);

		//if (item.type === "weapon" && sourceSystem.effectDuration != null && typeof sourceSystem.effectDuration !== "string")
		//	updateData["system.effectDuration"] = String(sourceSystem.effectDuration);

		return Object.keys(updateData).length > 0 ? updateData : null;
	}

	static async migrateEffectsForFoundryV11(lastUsedVersion, lastUsedFoundryVersion, isNewWorld)
	{
		if (isNewWorld)
			return;

		const lastNonFixVersion = "2.0.0";
		if (!game.user.isGM || (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion) && foundry.utils.isNewerVersion(lastUsedFoundryVersion, "10.291")))
			return;

		let actorList = this.getAllActors();

		for (let actor of actorList)
		{
			let updateData = [];
			for (let effect of actor.effects._source)
			{
				const statusId = effect.flags?.core?.statusId;
				if (statusId)
					updateData.push({ _id: effect._id, "statuses": [statusId] });
			}
			if (updateData.length > 0)
				await actor.updateEmbeddedDocuments("ActiveEffect", updateData);
		}
	}

	static async migrateSimpleCalendar(lastUsedVersion, lastUsedFoundryVersion)
	{
		const migrationVersion = "3.0.0"; //13.341
		if (!game.user.isGM || !foundry.utils.isNewerVersion(migrationVersion, lastUsedVersion) || !foundry.utils.isNewerVersion("13.336", lastUsedFoundryVersion))
			return false;

		const zeroInfo = game.settings.get("space1889", "yearZero").split("|");
		const isYearZeroSet = (String(zeroInfo[0]).toLowerCase() === 'true');
		const yearZero = isYearZeroSet ? Number(zeroInfo[1]) : 1889;
		if (!isYearZeroSet)
		{
			// SimpleCalendar wurde vermutlich nicht verwendet, daher defaults setzen
			const yearZeroInfo = "true|" + yearZero.toString();
			game.settings.set("space1889", "yearZero", yearZeroInfo);
		}
		return true;
	}

	static async migrateNoEpLevels(lastUsedVersion, isNewWorld)
	{
		if (isNewWorld)
			return;

		const lastNonFixVersion = "3.0.0";
		if (!game.user.isGM || (foundry.utils.isNewerVersion(lastUsedVersion, lastNonFixVersion)))
			return;

		let actorList = [];
		// nur relevant für sc und nsc die mit den Token verlinkt sind (also nicht nur in einer Szene existieren)
		for (let actor of game.actors)
		{
			if (actor.type !== "character" && actor.type !== "npc")
				continue;

			if (!actor.prototypeToken.actorLink)
				continue;

			actorList.push(actor);
		}

		for (let actor of actorList)
		{
			let updateData = [];
			for (let item of actor.items)
			{
				if (item.type != "talent" && item.type != "resource")
					continue;

				if (item.system.level.value <= 1 || !item.system?.noEp)
					continue;

				updateData.push({ _id: item._id, "system.noEpLevels": item.system.level.value });
			}

			if (updateData.length > 0)
			{
				await actor.updateEmbeddedDocuments("Item", updateData);
				console.log("migrate noEpLevels for talents and resources for: " + actor.name + "(id=" + actor._id + ")");
			}
		}
	}

	static async showNewVersionInfo(noCheck = false)
	{
		const info = game.settings.get("space1889", "newVersionPopup").split("|");
		const currentVersion = game.system.version;
		if (noCheck || (game.user.isGM && (foundry.utils.isNewerVersion(currentVersion, info[1]) || info[0] > 0)))
		{
			const isGerman = game.settings.get('core', 'language') == "de";
			let content = await foundry.applications.handlebars.renderTemplate("systems/space1889/change/" + (isGerman ? "de" : "en") + "_changelog_3.0.html");
			const understood = game.i18n.localize("SPACE1889.Understood");
			const stayAway = game.i18n.localize("SPACE1889.StayAway");
			const newVersion = game.i18n.localize("SPACE1889.NewVersion");

			new foundry.applications.api.DialogV2({
				window: { title: `${newVersion} ${currentVersion}`, resizable: true },
				position: { width: 650, height: 750},
				content: `${content}`,
				buttons: [
					{
						action: "ok",
						icon: '<i class="fas fa-check"></i>',
						label: `${understood}`,
						callback: () => game.settings.set("space1889", "newVersionPopup", `1|${currentVersion}`),
					},
					{
						action: "dont_remind",
						icon: '<i class="fas fa-times"></i>',
						label: `${stayAway}`,
						callback: () => game.settings.set("space1889", "newVersionPopup", `0|${currentVersion}`),
					}
				]
			}).render({ force: true });
		}
	}
}
