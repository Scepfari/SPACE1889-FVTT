export class Space1889Translation
{
	static logSpace1889CompendiumList()
	{
        const keys = this.getCompendiumList();

        for (const key of keys)
        {
            let resourcePack = game.packs.get(key[0]);
            if (resourcePack == undefined)
                continue;

            console.log(resourcePack.metadata.label);
        }
    }

    static getCompendiumList()
    {
        return [
            ["space1889.fertigkeiten", "SPACE1889.Skill", "SPACE1889.CompendiumFolderNameSkill"],
            ["space1889.ressourcen", "SPACE1889.Resource", "SPACE1889.CompendiumFolderNameResource"],
            ["space1889.rustungen", "SPACE1889.Armor", "SPACE1889.CompendiumFolderNameArmor"],
            ["space1889.schwachen", "SPACE1889.Weakness", "SPACE1889.CompendiumFolderNameWeakness"],
            ["space1889.spezialisierungen", "SPACE1889.SpeciSkill", "SPACE1889.CompendiumFolderNameSpecializations"],
            ["space1889.sprachen", "SPACE1889.Language", "SPACE1889.CompendiumFolderNameLanguage"],
            ["space1889.talente", "SPACE1889.Talent", "SPACE1889.CompendiumFolderNameTalent"],
            ["space1889.waffen", "SPACE1889.Weapon", "SPACE1889.CompendiumFolderNameWeapon"],
            ["space1889.gegenstaende", "SPACE1889.Item", "SPACE1889.CompendiumFolderNameItem"],
            ["space1889.gelderde", "SPACE1889.Currency", "SPACE1889.CompendiumFolderNameEarthMoney"],
            ["space1889.geldmars", "SPACE1889.Currency", "SPACE1889.CompendiumFolderNameMartianMoney"],
            ["space1889.beispielcharaktere", "SPACE1889.CompendiumExampleCharacter", "SPACE1889.CompendiumFolderNameExampleCharacter"],
            ["space1889.kreaturenerde", "SPACE1889.CompendiumCreatureEarth", "SPACE1889.CompendiumFolderNameCreatureEarth"],
            ["space1889.kreaturenluna", "SPACE1889.CompendiumCreatureLuna", "SPACE1889.CompendiumFolderNameCreatureLuna"],
            ["space1889.kreaturenmars", "SPACE1889.CompendiumCreatureMars", "SPACE1889.CompendiumFolderNameCreatureMars"],
            ["space1889.kreaturenvenus", "SPACE1889.CompendiumCreatureVenus", "SPACE1889.CompendiumFolderNameCreatureVenus"],
            ["space1889.kreaturenmerkur", "SPACE1889.CompendiumCreatureMerkur", "SPACE1889.CompendiumFolderNameCreatureMercury"]
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
                allConfig[key] = {
                    locked: lockState,
                    private: pack.private
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
                let langId = key[1];
                if (isActor)
                {
                    langId += item.data._id;
                }
                else
                {
                    const id = item.data.data.id;
                    const upperCaseId = id.replace(/^(.)/, function (b) { return b.toUpperCase(); });
                    langId = key[1] + upperCaseId;
                }
                const newName = game.i18n.localize(langId);
                if (newName != "" && newName != langId)
                    await item.update({ "name": newName });
                else
                {
                    console.log("Missing translation data for id: " + langId + " (current name: " + item.data.name + ")");
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
        const currentVersion = game.system.data.version;
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
            
            const isNewVersion = isNewerVersion(currentVersion, lastUsedVersion);

            if ((isNewVersion && currentLanguage != 'de') ||
                (!isNewVersion && lastUsedLanguage != currentLanguage))
            {
                await this.translateCompendiums();
                game.settings.set("space1889", "lastCompendiumTranslationLanguage", currentLanguage + '|' + currentVersion);
            }
        }

        // translate compendium folder names

        const compList = this.getCompendiumList();
        for (const comp of compList)
        {
            let pack = game.packs.get(comp[0]);
            if (pack == undefined)
                continue;

            let newLabel = game.i18n.localize(comp[2]);
            if (newLabel && newLabel != comp[2])
                mergeObject(pack.metadata, { label: newLabel });
        }
        ui.sidebar.tabs.compendium.render();
	}
}