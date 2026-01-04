export class Space1889Translation
{
	static logSpace1889CompendiumList()
	{
		const keys = this.getCompendiumKeys();

		for (const key of keys)
		{
			let resourcePack = game.packs.get(key);
			if (resourcePack == undefined)
				continue;

			console.log(resourcePack.metadata.label);

			const folders = resourcePack.folders;
			if (folders)
			{
				for (const folder of folders)
				{
					console.log("id: " + folder.id + " name: " + folder.name);
				}
			}
		}
	}

	static getCompendiumKeys()
	{
		return ["space1889.akteure",
			"space1889.beispielcharaktere",
			"space1889.charaktermerkmale",
			"space1889.ausrustung",
			"space1889.makros",
			"space1889.help",
			"space1889.gminfos",
		];
	}

	static getCompendiumList()
	{
		return [
			["space1889.akteure", "SPACE1889.Actor", "SPACE1889.CompendiumFolderNameActors"],
			["space1889.beispielcharaktere", "SPACE1889.CompendiumExampleCharacter", "SPACE1889.CompendiumFolderNameExampleCharacter"],
			["space1889.charaktermerkmale", "SPACE1889.CharacterFeatures", "SPACE1889.CompendiumFolderNameCharacterFeatures"],
			["space1889.ausrustung", "SPACE1889.Equipment", "SPACE1889.CompendiumFolderNameEquipment"],
 	   ];
	}

	static getFullCompendiumList()
	{
		return [
			["space1889.akteure", "SPACE1889.Actor", "SPACE1889.CompendiumFolderNameActors"],
			["space1889.beispielcharaktere", "SPACE1889.CompendiumExampleCharacter", "SPACE1889.CompendiumFolderNameExampleCharacter"],
			["space1889.charaktermerkmale", "SPACE1889.CharacterFeatures", "SPACE1889.CompendiumFolderNameCharacterFeatures"],
			["space1889.ausrustung", "SPACE1889.Equipment", "SPACE1889.CompendiumFolderNameEquipment"],
			["space1889.makros", "SPACE1889.CompendiumMacro", "SPACE1889.CompendiumMacros"],
			["space1889.help", "", "SPACE1889.CompendiumHelp"],
			["space1889.gminfos", "", "SPACE1889.CompendiumGmInfo"],
 	   ];
	}

	static getCompendiumFolderList()
	{
		return [
			{ id: "PQcq8W9wotfKFWOf", baseLangId: "SPACE1889.Skill", folderName: "SPACE1889.CompendiumFolderNameSkill"},
			{ id: "BnDW0s7p77BlkNkO", baseLangId: "SPACE1889.Resource", folderName: "SPACE1889.CompendiumFolderNameResource"},
			{ id: "TPvH5YQ3iztXQ7jF", baseLangId: "SPACE1889.Weakness", folderName: "SPACE1889.CompendiumFolderNameWeakness"},
			{ id: "daqWjLZKN0LVolN0", baseLangId: "SPACE1889.SpeciSkill", folderName: "SPACE1889.CompendiumFolderNameSpecializations"},
			{ id: "DNfO9f6f6D32yRFP", baseLangId: "SPACE1889.Language", folderName: "SPACE1889.CompendiumFolderNameLanguage"},
			{ id: "JELbjvpvG4vQTRU6", baseLangId: "SPACE1889.Talent", folderName: "SPACE1889.CompendiumFolderNameTalent"},
			{ id: "8NSKxikLwGeV4Ylw", baseLangId: "SPACE1889.Armor", folderName: "SPACE1889.CompendiumFolderNameArmor"},
			{ id: "eCWp8f1yb90AJvM8", baseLangId: "SPACE1889.Weapon", folderName: "SPACE1889.CompendiumFolderNameWeapon"},
			{ id: "nQC09lmUF1KGaJl2", baseLangId: "SPACE1889.Weapon", folderName: "SPACE1889.CompendiumFolderNameWeaponVehicle"},
			{ id: "YV0RkjySg2zfkPuI", baseLangId: "SPACE1889.Ammunition", folderName: "SPACE1889.CompendiumFolderNameAmmunition"},
			{ id: "5mXCamLBIOJNgKsZ", baseLangId: "SPACE1889.Item", folderName: "SPACE1889.CompendiumFolderNameItem"},
			{ id: "i1zmXayIBvsOVNDO", baseLangId: "SPACE1889.Item", folderName: "SPACE1889.CompendiumFolderNameLightAndVision"},
			{ id: "xSukgG3aeSCRMwDa", baseLangId: "SPACE1889.Item", folderName: "SPACE1889.CompendiumFolderNameContainer"},
			{ id: "s8cpaEB1PcecAO1t", baseLangId: "SPACE1889.Currency", folderName: "SPACE1889.CompendiumFolderNameEarthMoney"},
			{ id: "WCREmwcKMp1dlsIs", baseLangId: "SPACE1889.Currency", folderName: "SPACE1889.CompendiumFolderNameMartianMoney"},
			{ id: "JvFA7ml2pcsQTPyF", baseLangId: "", folderName: "TYPES.Item.currencyPl"},
			{ id: "CJZKdoPS1yJsbXjh", baseLangId: "SPACE1889.CompendiumCreatureEarth", folderName: "SPACE1889.CompendiumFolderNameCreatureEarth"},
			{ id: "kZiwc4avMGS9RmTm", baseLangId: "SPACE1889.CompendiumCreatureLuna", folderName: "SPACE1889.CompendiumFolderNameCreatureLuna"},
			{ id: "agPWemqFUeSVoS3y", baseLangId: "SPACE1889.CompendiumCreatureMars", folderName: "SPACE1889.CompendiumFolderNameCreatureMars"},
			{ id: "NCVnWaDraTsyJ4LY", baseLangId: "SPACE1889.CompendiumCreatureVenus", folderName: "SPACE1889.CompendiumFolderNameCreatureVenus"},
			{ id: "nmvoD0qWuH53Q2eS", baseLangId: "SPACE1889.CompendiumCreatureMerkur", folderName: "SPACE1889.CompendiumFolderNameCreatureMercury"},
			{ id: "nAzVQcKWZdCTBphX", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameBeamte"},
			{ id: "eCh4kromYgvoF136", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameBuehnenkuenstler"},
			{ id: "di54nIzPvo8fiByz", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameDienstpersonal"},
			{ id: "oFplNfLHNDLOO14R", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameHaendlerUndKaufleute"},
			{ id: "z9U4bnLpKEDANjcK", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameHandwerker"},
			{ id: "PuCOJq9P41EkSSbx", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameEingeborene"},
			{ id: "liCwvEyrnqcVhvfq", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameHerrenUndDamenVonStand"},
			{ id: "jZAnKzzvcxVjeYqb", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameHochlandmarsianer"},
			{ id: "neP8QZ5hR5YnsbRm", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameHuegelmarsianer"},
			{ id: "Ofh6UgWhtq5Cr5TC", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameMilitaer"},
			{ id: "KNSszTMJL3REqHSs", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameAmuesierdamenUndGestrauchelteFrauen"},
			{ id: "WcXI6ro0eYMlPtz5", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameGauner"},
			{ id: "gKLzzyUda0OLnsmL", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameGluecksspieler"},
			{ id: "LpW7LcUgAVc80oXf", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameSchlaeger"},
			{ id: "z53gkOBlQwSG9j8B", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameArchaischeVenusier"},
			{ id: "0xU41TIvDAK07Qfl", baseLangId: "SPACE1889.CompendiumNsc", folderName: "SPACE1889.CompendiumFolderNameEntwickelteVenusier"},
			{ id: "99RCbtFPwaXplUsV", baseLangId: "SPACE1889.CompendiumAetherfahrzeug", folderName: "SPACE1889.CompendiumFolderNameAetherfahrzeuge"},
			{ id: "1CVOuXT4Gfemqvob", baseLangId: "SPACE1889.CompendiumLandfahrzeug", folderName: "SPACE1889.CompendiumFolderNameLandfahrzeuge"},
			{ id: "fOD417hbfPBq3LlT", baseLangId: "SPACE1889.CompendiumLuftfahrzeug", folderName: "SPACE1889.CompendiumFolderNameLuftfahrzeuge"},
			{ id: "iB9S2KgSmqfHmTlV", baseLangId: "SPACE1889.CompendiumWasserfahrzeug", folderName: "SPACE1889.CompendiumFolderNameWasserfahrzeuge"},
			{ id: "aohhFMXc30zuejjo", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameVehicle"},
			{ id: "U8cu7FiyBFHtsqnY", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameCreatures"},
			{ id: "g6HnXQewfHN2EUZn", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameNPC"},
			{ id: "C9zumFQ6mePeg4b1", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameMarsianer"},
			{ id: "zzseI9QuUHQuPrk2", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameVenusier"},
			{ id: "cIKeWe4fiuqk4n7y", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameNachtlebenUndUnterwelt"},
			{ id: "ARApjwrvTZsXRw7t", baseLangId: "", folderName: "SPACE1889.CompendiumFolderNameBuergerUndDienstleister"},
 	   ];
	}

	static async setSpaceCompendiumLockState(lockState, setKeys = undefined)
	{
		const restoreKeys = [];

		let keys = [];
		if (setKeys != undefined)
		{
			keys = setKeys;
		}
		else
		{
			for (const element of this.getCompendiumList())
				keys.push(element[0]);
		}


		const allConfig = game.settings.get('core', 'compendiumConfiguration');

		for (const key of keys)
		{
			const info = allConfig[key];
			if (info)
			{
				if (info.locked != lockState)
				{
					allConfig[key].locked = lockState;
					restoreKeys.push(key);
				}
			}
			else
			{
				const pack = await game.packs.get(key);
				allConfig[key] = {
					locked: lockState
				};
				restoreKeys.push(key);
			}

		}

		await game.settings.set('core', 'compendiumConfiguration', allConfig);
		return restoreKeys;
	}

	static async translateCompendiums()
	{
		const restoreKeys = await this.setSpaceCompendiumLockState(false);

		const keys = this.getCompendiumList();
		const folderKeys = this.getCompendiumFolderList();

		const currentLanguage = game.settings.get('core', 'language');

		for (const key of keys)
		{
			let resourcePack = game.packs.get(key[0]);
			if (resourcePack == undefined)
				continue;

			let resources = await resourcePack.getDocuments();
			const isActor = resourcePack.metadata.type == "Actor";

			console.log("begin " + currentLanguage + " translation of compendium pack: " + key[0] + "...");
			let errorCount = 0;
			for (let item of resources)
			{
				const folderId = item.folder?.id;
				const folderKey = folderKeys.find((element) => element.id === folderId);

				let langId = folderKey ? folderKey.baseLangId : key[1];
				if (isActor)
				{
					langId += item._id;
				}
				else
				{
					const id = item.system.id;
					const upperCaseId = id.replace(/^(.)/, function (b) { return b.toUpperCase(); });
					langId += upperCaseId;
				}
				const newName = game.i18n.localize(langId);
				if (newName != "" && newName != langId)
					await item.update({ "name": newName });
				else
				{
					console.log("Missing translation data for id: " + langId + " (current name: " + item.name + ")");
					++errorCount;
				}
			}
			console.log("...translation of compendium pack: " + key[0] + " finished." + (errorCount > 0 ? errorCount.toString() + " errors" : ""));
		}

		await this.setSpaceCompendiumLockState(true, restoreKeys);
	}

	static async runInitTranslationAction()
	{
		const currentLanguage = game.settings.get('core', 'language');
		const currentVersion = game.system.version;
		if (game.user.isGM)
		{
			// check translation state
			let lastUsedLanguage = 'de';
			let lastUsedVersion = '0.6.2';
			const info = game.settings.get("space1889", "lastCompendiumTranslationLanguage").split("|");
			if (info.length == 2)
			{
				lastUsedLanguage = info[0];
				lastUsedVersion = info[1];
			}
			
			const isNewVersion = foundry.utils.isNewerVersion(currentVersion, lastUsedVersion);

			if ((isNewVersion && currentLanguage != 'de') ||
				(!isNewVersion && lastUsedLanguage != currentLanguage))
			{
				await this.updateFolderNames(currentLanguage);
				await this.translateCompendiums();
				game.settings.set("space1889", "lastCompendiumTranslationLanguage", currentLanguage + '|' + currentVersion);
			}
			else if (foundry.utils.isNewerVersion(game.version, '10.303') && game.settings.get("space1889", "lastUsedFoundryVersion") === "9.28")
			{
				// frisch auf V11
				await this.updateFolderNames(currentLanguage);
			}
		}

		// translate compendium folder names

		const compList = this.getFullCompendiumList();
		for (const comp of compList)
		{
			let pack = game.packs.get(comp[0]);
			if (pack == undefined)
				continue;

			let newLabel = game.i18n.localize(comp[2]);
			if (newLabel && newLabel != comp[2])
				foundry.utils.mergeObject(pack.metadata, { label: newLabel });
		}
		//ui.sidebar.tabs.compendium.render();
	}

	static async updateFolderNames(currentLanguage)
	{
		const packIds = this.getCompendiumKeys();

		for (const packId of packIds)
		{
			const pack = game.packs.get(packId);
			if (!pack)
				continue;

			const folders = pack.folders;

			//const folderKey = folderKeys.find((element) => element.id === folderId);

			const folderKeys = this.getCompendiumFolderList();
			for (const element of folderKeys)
			{
				this.setFolderName(folders, element.id, element.folderName);
			}

		}



		//if (!foundry.utils.isNewerVersion(game.version, '10.999'))
		//	return;

		//const folders = game.packs.folders;

		//const merkmale = ["space1889.fertigkeiten", "space1889.ressourcen", "space1889.schwachen", "space1889.spezialisierungen", "space1889.sprachen", "space1889.talente"];
		//const merkmaleInfo = this.isSameFolder(merkmale);
		//if (merkmaleInfo.isSame)
		//	this.setFolderName(folders, merkmaleInfo.folderKey, "SPACE1889.CompendiumFolderNameCharacterFeatures");
		
		//const equipmentList = ["space1889.gegenstaende", "space1889.rustungen", "space1889.waffen", "space1889.munition", "space1889.fahrzeugwaffen", "space1889.gelderde", "space1889.geldmars"];
		//const equipmentInfo = this.isSameFolder(equipmentList);
		//if (equipmentInfo.isSame)
		//	this.setFolderName(folders, equipmentInfo.folderKey, "SPACE1889.CompendiumFolderNameEquipment");

		//const exampleActors = ["space1889.beispielcharaktere"];
		//const exampleActorsInfo = this.isSameFolder(exampleActors);
		//const vehicleList = ["space1889.atherfahrzeuge", "space1889.landfahrzeuge", "space1889.luftfahrzeuge", "space1889.wasserfahrzeuge"];
		//const vehicleInfo = this.isSameFolder(vehicleList);
		//const creatures = ["space1889.kreaturenmerkur", "space1889.kreaturenvenus", "space1889.kreaturenerde", "space1889.kreaturenluna", "space1889.kreaturenmars"];
		//const creaturesInfo = this.isSameFolder(creatures);
		//const nsc = ["space1889.nsc2eingeborene", "space1889.nsc3herrenunddamenvonstand", "space1889.nsc5militaer"];
		//const nscInfo = this.isSameFolder(nsc);
		//const venusier = ["space1889.nsc7archaischevenusier", "space1889.nsc7entwickeltevenusier"];
		//const venusierInfo = this.isSameFolder(venusier);
		//const marsianer = ["space1889.nsc4hochlandmarsianer", "space1889.nsc4huegelmarsianer"];
		//const marsianerInfo = this.isSameFolder(marsianer);
		//const bud = ["space1889.nsc1beamte", "space1889.nsc1buehnenkuenstler", "space1889.nsc1dienstpersonal", "space1889.nsc1handwerker", "space1889.nsc1haendlerundkaufleute"];
		//const budInfo = this.isSameFolder(bud);
		//const nacht = ["space1889.nsc6amuesierdamen","space1889.nsc6gauner","space1889.nsc6gluecksspieler","space1889.nsc6schlaeger"];
		//const nachtInfo = this.isSameFolder(nacht);

		//if (!exampleActorsInfo.isSame || !vehicleInfo.isSame || !creaturesInfo.isSame || !nscInfo.isSame ||
		//	!venusierInfo.isSame || !marsianerInfo.isSame || !budInfo.isSame || !nachtInfo.isSame)
		//	return;

		//if (budInfo.folderKey != marsianerInfo.folderKey && budInfo.folderKey != venusierInfo.folderKey && budInfo.folderKey != nachtInfo.folderKey &&
		//	budInfo.folderKey != nscInfo.folderKey && vehicleInfo.folderKey != creaturesInfo.folderKey)
		//{
		//	this.setFolderName(folders, exampleActorsInfo.folderKey, "SPACE1889.CompendiumFolderNameActors");
		//	this.setFolderName(folders, vehicleInfo.folderKey, "SPACE1889.CompendiumFolderNameVehicle");
		//	this.setFolderName(folders, creaturesInfo.folderKey, "SPACE1889.CompendiumFolderNameCreatures");
		//	this.setFolderName(folders, nscInfo.folderKey, "SPACE1889.CompendiumFolderNameNPC");
		//	this.setFolderName(folders, budInfo.folderKey, "SPACE1889.CompendiumFolderNameBuergerUndDienstleister");
		//	this.setFolderName(folders, marsianerInfo.folderKey, "SPACE1889.CompendiumFolderNameMarsianer");
		//	this.setFolderName(folders, venusierInfo.folderKey, "SPACE1889.CompendiumFolderNameVenusier");
		//	this.setFolderName(folders, nachtInfo.folderKey, "SPACE1889.CompendiumFolderNameNachtlebenUndUnterwelt");
		//}
	}

	static setFolderName(folders, key, langKey)
	{
		const folder = folders.get(key);
		folder?.update({ "name": game.i18n.localize(langKey) });
	}

	//static isSameFolder(vehicleList)
	//{
	//	const allConfig = game.settings.get('core', 'compendiumConfiguration');
	//	let folderKeys = [];
	//	for (let backKey of vehicleList)
	//	{
	//		const config = allConfig[backKey];
	//		if (config)
	//			folderKeys.push(config.folder)
	//		else
	//			folderKeys.push("");
	//	}
	//	if (folderKeys.length == 0)
	//		return { isSame: false, folderKey: "" };

	//	return {isSame: folderKeys.every((val, i, arr) => val === arr[0]), folderKey: folderKeys[0] };
	//}
}
