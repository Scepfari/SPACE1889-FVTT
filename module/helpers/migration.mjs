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
			await game.settings.set("space1889", "lastUsedSystemVersion", currentVersion);
		}
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
			}).render(true);
		}
	}
}
