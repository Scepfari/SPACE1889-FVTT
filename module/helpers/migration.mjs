export class Space1889Migration
{
	static async runInitMigrationAction()
	{
		const currentVersion = game.system.data.version;
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
			let talent = actor.data?.talents?.find(e => e.data.id === 'volleAbwehr');
			if (talent != undefined && talent.data.bonusStartLevel != 2)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: talent._id, "data.bonusTarget": "defense", "data.bonusTargetType": "secondary", "data.bonus": 2, "data.bonusStartLevel": 2 }]);
				console.log("SPACE 1889 system update to " + game.system.data.version + " - fix item values: " + talent.name + "(_id=" + talent._id + ")");
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
			let talent = actor.data?.talents?.find(e => e.data.id === 'eisenschaedel');
			if (talent != undefined && talent.data.bonus != 1)
			{
				await actor.updateEmbeddedDocuments("Item", [{ _id: talent._id, "data.bonus": 1 }]);
				console.log("fix item values: " + talent.name + "(_id=" + talent._id + ")");
			}
		}
	}
}
