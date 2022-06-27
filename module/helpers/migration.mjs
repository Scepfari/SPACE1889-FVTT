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

	static showNewVersionInfo()
	{
		const info = game.settings.get("space1889", "newVersionPopup").split("|");
		const currentVersion = game.system.data.version;
		if (game.user.isGM && isNewerVersion(currentVersion, info[1]) || info[0] > 0)
		{
			//let content = `<strong>Hello, SPACE 1889!</strong>`;

			let content = `<h1>SPACE 1889 Neocristallicum</h1>
			<p>&nbsp;</p>
			<h3>0.7.5</h3>
			<ul>
			<li>[STRG] + [SHIFT] + Mausklick auf ein Attributswurf, w&uuml;rfelt den einfachen Attributswert, anstelle vom Doppelten</li>
			<li>Versionshinweisanzeige</li>
			<li>Fix Negative Gesundheit: Reduziert jetzt die Beladung und die Bewegung ensprechend GRW S. 224</li>
			<li>Fix Talent Volle Abwehr: Abwehrbonus auf h&ouml;heren Stufen wird nun korrekt eingerechnet</li>
			</ul>
			<p>&nbsp;</p>
			<h3>0.7.4</h3>
			<ul>
			<li>&Uuml;berarbeitung der Beschreibung/Description in den Item Sheets, d.h. die beiden Tabs wurden in einem vereinigt, wobei die Unterscheidung zwischen den &uuml;bersetzbaren Kompendien-Texten (aus der Sprachdatei) und den Nutzer Texten/Anmerkungen erhalten bleibt.</li>
			<li>Gewicht der Gegenst&auml;nde aus dem Lager wird bei den Charakteren nun mit angezeigt</li>
			</ul>
			<p>&nbsp;</p>
			<h3>0.7.3:</h3>
			<ul>
			<li>Vereinheitlichung der W&uuml;rfeltypen, d.h. bei allen Proben wird mit den gleichen W&uuml;rfeln gew&uuml;rfelt, l&auml;sst sich in den Systemeinstellungen einstellen ob mit M&uuml;nzen (dc) oder W&uuml;rfeln (d6) gew&uuml;rfelt werden soll</li>
			<li>Bugfixes</li>
			</ul>
			<p>&nbsp;</p>
			<h3>0.7.2</h3>
			<ul>
			<li>Fix: Kompendien Name &Uuml;bersetzung</li>
			<li>NSC Kompendien hinzugef&uuml;gt</li>
			</ul>
			<p>&nbsp;</p>
			<h3>0.7.1</h3>
			<ul>
			<li>Mehrsprachenunterst&uuml;tzung, einschlie&szlig;lich Umbenennung der Elemente in den Kompendien</li>
			<li>Englische &Uuml;bersetzung</li>
			<li>Verbesserte Chatausgabe, insbesondere werden im Normalfall die Beschreibungen nur noch an einen selbst gefl&uuml;stert und nur bei zus&auml;tzlichem Halten von [Strg] oder [Shift] &ouml;ffentlich in den Chat geschoben. Diese Beschreibungsw&uuml;rfe k&ouml;nnen jetzt auch mit Akteuren ausgef&uuml;hrt werden, bei denen der Spieler nur eingeschr&auml;nkte Rechte hat.</li>
			<li>Bugfixes</li>
			</ul>`;

			new Dialog({
				title: `neue Version ${currentVersion}`,
				content,
				buttons: {
					ok: {
						icon: '<i class="fas fa-check"></i>',
						label: "Verstanden",
						callback: () => game.settings.set("space1889", "newVersionPopup", `1|${currentVersion}`),
					},
					dont_remind: {
						icon: '<i class="fas fa-times"></i>',
						label: "Bleib weg",
						callback: () => game.settings.set("space1889", "newVersionPopup", `0|${currentVersion}`),
					},
				},
			}).render(true);
		}
	}
}
