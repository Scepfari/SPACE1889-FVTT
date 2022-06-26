export class Space1889Migration
{
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
			}
		}
	}

	static async runInitMigrationAction()
	{
		const currentVersion = game.system.data.version;
		const lastUsedVersion = game.settings.get("space1889", "lastUsedSystemVersion");

		if (isNewerVersion(currentVersion, lastUsedVersion) && game.user.isGM)
		{
			await this.fixEisenschaedel();
			game.settings.set("space1889", "lastUsedSystemVersion", currentVersion);
		}
	}
}
