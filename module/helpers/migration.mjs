import SPACE1889Helper from "../helpers/helper.mjs";

export class Space1889Migration
{
	static async runInitMigrationAction()
	{
		const currentVersion = game.system.version;
		const lastUsedVersion = game.settings.get("space1889", "lastUsedSystemVersion");

		if (isNewerVersion(currentVersion, lastUsedVersion) && game.user.isGM)
		{
			await this.fixEisenschaedel(lastUsedVersion);
			await this.fixVolleAbwehr(lastUsedVersion);
			await this.ammunitionIntroduction(lastUsedVersion);
			await game.settings.set("space1889", "lastUsedSystemVersion", currentVersion);
		}
		if (game.user.isGM)
			await this.checkFoundryMigrationBug();
	}

	static async fixVolleAbwehr(lastUsedVersion)
	{
		const lastNonFixVersion = "0.7.4";
		if (isNewerVersion(lastUsedVersion, lastNonFixVersion))
			return;

		for (let actor of game.actors.values())
		{
			let talent = actor.system?.talents?.find(e => e.system.id === 'volleAbwehr');
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
		if (isNewerVersion(lastUsedVersion, lastNonFixVersion))
			return;

		for (let actor of game.actors.values())
		{
			let talent = actor.system?.talents?.find(e => e.system.id === 'eisenschaedel');
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
		if (isNewerVersion(lastUsedVersion, lastNonFixVersion) || !game.user.isGM)
			return;

		let actorList = [];
		for (const scene of game.scenes)
		{
			for (let token of scene.tokens)
			{
				if (token.actorLink || token.actor == undefined || token.actor.type == "vehicle")
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
		await SPACE1889Helper.updateWeaponAndCreateAmmo(actorList);
	}

	static async setRemainingRoundsToMaxCapacity(actor, packWeapons)
	{
		for (let weapon of actor.system.weapons)
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

	static async checkFoundryMigrationBug()
	{
		if (game.version === "10.284")
		{
			for (const scene of game.scenes)
			{
				for (let token of scene.tokens)
				{
					if (token.actorLink || token.actor == undefined)
						continue;

					const newDocuments = await token.actor.createEmbeddedDocuments("Item", [{ name: "Foundry Bug 8180", type: "item" }]);
					const toKill = newDocuments.map(d => d._id);
					await token.actor.deleteEmbeddedDocuments("Item", toKill);
				}
			}
		}
		if (game.version === "10.285" && game.settings.get("space1889", "lastUsedFoundryVersion") === "9.28")
		{
			this.showWarning();
		}

		await game.settings.set("space1889", "lastUsedFoundryVersion", game.version);
	}

	static showWarning()
	{
		const info = game.settings.get("space1889", "newVersionPopup").split("|");
		const currentVersion = game.version;
		if (game.user.isGM && (isNewerVersion(currentVersion, info[1]) || info[0] > 0))
		{
			let content = game.i18n.localize("SPACE1889.FoundryBug8180");
			const understood = game.i18n.localize("SPACE1889.Understood");
			const warning = game.i18n.localize("SPACE1889.Warning");

			new Dialog({
				title: `${warning} ${currentVersion}`,
				content,
				buttons: {
					ok: {
						icon: '<i class="fas fa-check"></i>',
						label: `${understood}`
					},
				},
			}).render(true);
		}

		const speaker = game.userId;
		let desc = game.i18n.localize("SPACE1889.FoundryBug8180");

		ChatMessage.create({
			speaker: speaker,
			content: desc
		});

	}


	static showNewVersionInfo()
	{
		const info = game.settings.get("space1889", "newVersionPopup").split("|");
		const currentVersion = game.system.version;
		if (game.user.isGM && (isNewerVersion(currentVersion, info[1]) || info[0] > 0))
		{
			let content = game.i18n.localize("SPACE1889.VersionInfo");
			const understood = game.i18n.localize("SPACE1889.Understood");
			const stayAway = game.i18n.localize("SPACE1889.StayAway");
			const newVersion = game.i18n.localize("SPACE1889.NewVersion");

			new Dialog({
				title: `${newVersion} ${currentVersion}`,
				content,
				buttons: {
					ok: {
						icon: '<i class="fas fa-check"></i>',
						label: `${understood}`,
						callback: () => game.settings.set("space1889", "newVersionPopup", `1|${currentVersion}`),
					},
					dont_remind: {
						icon: '<i class="fas fa-times"></i>',
						label: `${stayAway}`,
						callback: () => game.settings.set("space1889", "newVersionPopup", `0|${currentVersion}`),
					},
				},
			}).render(true, { height: 750 });
		}
	}
}
