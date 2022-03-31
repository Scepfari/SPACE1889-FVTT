export default class SPACE1889Helper
{
    static getTalentData(actor, talentId)
    {
        return actor.data.talents?.find(entry => entry.data.id == talentId);
    }

    static getTalentLevel(actor, talentId)
    {
        const talent = this.getTalentData(actor, talentId);
        if (talent != undefined)
        {
            return talent.data.level.value;
        }
        return 0;
    }

    static getDeathThreshold(actor)
    {
        let threshold = -5;
        const level = this.getTalentLevel(actor, "zaeherHund");
        if (level > 0)
            threshold -= (2 * level);

        return threshold;
    }

    static isAutoStabilize(actor)
    {
        return (this.getTalentLevel(actor, "zaeherHund") > 0);
    }

    static getIncapacitateThreshold(actor)
    {
        let threshold = 0;
        const level = this.getTalentLevel(actor, "schmerzresistenz");
        if (level > 0)
            threshold -= (2 * level);

        return threshold;
    }

    static getDamageTuple(actorData, ignoreThisItemId = "")
    {
        let lethal = 0;
        let nonLethal = 0;
        for (const item of actorData.items)
        {
            if (item.data.type != "damage")
                continue;

            if (item.data._id == ignoreThisItemId)
                continue;

            if (item.data.data.damageType == "lethal")
                lethal += item.data.data.damage;
            else
                nonLethal += item.data.data.damage;
        }

        return { lethal: lethal, nonLethal: nonLethal };
    }

    static isCreature(actorData)
    {
        return actorData.type == 'creature';
	}

    /**
     * sortiert das übergebene Liste nach Namen
     * @param objectArray 
     */
    static sortByName(objectArray)
    {
        objectArray.sort((a, b) =>
        {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
    }
}